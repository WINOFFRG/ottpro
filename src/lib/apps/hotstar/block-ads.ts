import { logger } from "@/lib/logger";
import type { Middleware } from "@/lib/shared/middleware";

const HOTSTAR_BFF_PATH = "/api/internal/bff/v2/";
const DISPLAY_AD_WIDGET_TEMPLATE = "DisplayAdContainerWidget";
const PLAYER_WIDGET_TEMPLATE = "PlayerWidget";
const PLAYER_AD_DATA_KEYS = [
  "live_stream_ad",
  "intervention_data",
  "ads_free_button",
] as const;

type RemovedDisplayAdWidgetsResult = {
  removedWidgets: Record<string, unknown>[];
};

type RemovedPlayerAdDataEntry = {
  wrapperIndex: number;
  removedData: Partial<Record<(typeof PLAYER_AD_DATA_KEYS)[number], unknown>>;
};

type RemovedPlayerAdDataResult = {
  removals: RemovedPlayerAdDataEntry[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getRecord(
  value: Record<string, unknown>,
  key: string,
): Record<string, unknown> | null {
  const nested = value[key];
  return isRecord(nested) ? nested : null;
}

function removeDisplayAdWidgetsFromPayload(
  payload: unknown,
): RemovedDisplayAdWidgetsResult {
  if (!isRecord(payload)) {
    return { removedWidgets: [] };
  }

  const success = getRecord(payload, "success");
  if (!success) {
    return { removedWidgets: [] };
  }

  const page = getRecord(success, "page");
  if (!page) {
    return { removedWidgets: [] };
  }

  const spaces = getRecord(page, "spaces");
  if (!spaces) {
    return { removedWidgets: [] };
  }

  const tray = getRecord(spaces, "tray");
  if (!tray) {
    return { removedWidgets: [] };
  }

  const wrappers = tray.widget_wrappers;
  if (!Array.isArray(wrappers)) {
    return { removedWidgets: [] };
  }

  const removedWidgets: Record<string, unknown>[] = [];
  const filteredWrappers: unknown[] = [];
  for (const wrapper of wrappers) {
    if (
      isRecord(wrapper) &&
      wrapper.template === DISPLAY_AD_WIDGET_TEMPLATE
    ) {
      removedWidgets.push(wrapper);
      continue;
    }
    filteredWrappers.push(wrapper);
  }

  if (removedWidgets.length === 0) {
    return { removedWidgets: [] };
  }

  tray.widget_wrappers = filteredWrappers;

  return { removedWidgets };
}

function removePlayerAdDataFromPayload(
  payload: unknown,
): RemovedPlayerAdDataResult {
  if (!isRecord(payload)) {
    return { removals: [] };
  }

  const success = getRecord(payload, "success");
  if (!success) {
    return { removals: [] };
  }

  const page = getRecord(success, "page");
  if (!page) {
    return { removals: [] };
  }

  const spaces = getRecord(page, "spaces");
  if (!spaces) {
    return { removals: [] };
  }

  const player = getRecord(spaces, "player");
  if (!player) {
    return { removals: [] };
  }

  const wrappers = player.widget_wrappers;
  if (!Array.isArray(wrappers)) {
    return { removals: [] };
  }

  const removals: RemovedPlayerAdDataEntry[] = [];
  for (const [index, wrapper] of wrappers.entries()) {
    if (!isRecord(wrapper) || wrapper.template !== PLAYER_WIDGET_TEMPLATE) {
      continue;
    }

    const widget = getRecord(wrapper, "widget");
    if (!widget) {
      continue;
    }

    const dataValue = widget.data;
    if (!isRecord(dataValue)) {
      continue;
    }
    const data = dataValue;

    const removedData: Partial<
      Record<(typeof PLAYER_AD_DATA_KEYS)[number], unknown>
    > = {};
    for (const key of PLAYER_AD_DATA_KEYS) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        removedData[key] = data[key];
        delete data[key];
      }
    }

    if (Object.keys(removedData).length > 0) {
      removals.push({
        wrapperIndex: index,
        removedData,
      });
    }
  }

  return { removals };
}

export const blockAds: Middleware = async (ctx, next) => {
  if (!ctx.url.includes(HOTSTAR_BFF_PATH)) {
    await next();
    return;
  }

  let upstreamResponse: Response | undefined;

  try {
    upstreamResponse = await ctx.originalFetch(ctx.request, ctx.init);
    const responseText = await upstreamResponse.clone().text();

    let payload: unknown;
    try {
      payload = JSON.parse(responseText);
    } catch {
      ctx.setHandled();
      ctx.setResponse(upstreamResponse);
      return;
    }

    const { removedWidgets } = removeDisplayAdWidgetsFromPayload(payload);
    const { removals: playerAdDataRemovals } =
      removePlayerAdDataFromPayload(payload);

    if (removedWidgets.length === 0 && playerAdDataRemovals.length === 0) {
      ctx.setHandled();
      ctx.setResponse(upstreamResponse);
      return;
    }

    if (removedWidgets.length > 0) {
      logger.debug("[Hotstar] Removed tray ad widget objects", {
        source: "hotstar",
        middleware: "block-ads",
        url: ctx.url,
        removedWidgets,
      });
    }

    if (playerAdDataRemovals.length > 0) {
      logger.debug("[Hotstar] Removed PlayerWidget ad data keys", {
        source: "hotstar",
        middleware: "block-ads",
        url: ctx.url,
        removals: playerAdDataRemovals,
      });
    }

    logger.info("[Hotstar] Patched BFF response to remove ad payloads", {
      source: "hotstar",
      middleware: "block-ads",
      url: ctx.url,
      removedDisplayAdWidgetsCount: removedWidgets.length,
      removedPlayerAdDataCount: playerAdDataRemovals.length,
    });

    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.delete("content-length");
    responseHeaders.delete("content-encoding");
    responseHeaders.set("content-type", "application/json");

    ctx.setHandled();
    ctx.setResponse(
      new Response(JSON.stringify(payload), {
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        headers: responseHeaders,
      }),
    );
    return;
  } catch (error) {
    logger.error("[Hotstar] Failed to patch BFF response", {
      source: "hotstar",
      middleware: "block-ads",
      url: ctx.url,
      error,
      hasUpstreamResponse: Boolean(upstreamResponse),
    });
    if (upstreamResponse) {
      ctx.setHandled();
      ctx.setResponse(upstreamResponse);
      return;
    }

    await next();
  }
};
