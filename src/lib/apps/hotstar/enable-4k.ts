import { logger } from "@/lib/logger";
import type { Middleware } from "@/lib/shared/middleware";

const HOTSTAR_BFF_PATH = "/api/internal/bff/v2/";
export const ENABLE_4K_RULE_ID = "enable-4k";
const WATCH_PATH_SUFFIX = "/watch";
const START_PATH_SUFFIX = "/start";
const HEADER_NAME = "x-hs-client";
const PATTERN_TO_REPLACE = /platform:web/g;
const REPLACEMENT_VALUE = "platform:androidtv";
const CLIENT_CAPABILITIES_PARAM = "client_capabilities";
const RESOLUTION_KEY = "resolution";
const VIDEO_CODEC_KEY = "video_codec";
const RESOLUTION_4K_VALUE = "4k";
const VIDEO_CODEC_H265_VALUE = "h265";
const HOTSTAR_BASE_URL = "https://www.hotstar.com";

const H265_MIME_TYPES = [
  'video/mp4; codecs="hvc1.1.6.L93.B0"',
  'video/mp4; codecs="hev1.1.6.L93.B0"',
  'video/mp4; codecs="hvc1"',
  'video/mp4; codecs="hev1"',
];

function supportsMimeTypeWithMediaSource(mimeType: string): boolean {
  if (typeof MediaSource === "undefined" || !MediaSource.isTypeSupported) {
    return false;
  }
  return MediaSource.isTypeSupported(mimeType);
}

function supportsMimeTypeWithVideoElement(mimeType: string): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  const video = document.createElement("video");
  const support = video.canPlayType(mimeType);
  return support === "probably" || support === "maybe";
}

export function isH265PlaybackSupported(): boolean {
  return H265_MIME_TYPES.some(
    (mimeType) =>
      supportsMimeTypeWithMediaSource(mimeType) ||
      supportsMimeTypeWithVideoElement(mimeType),
  );
}

function getRequestHeaders(ctx: Parameters<Middleware>[0]): Headers {
  if (ctx.init?.headers instanceof Headers) {
    return new Headers(ctx.init.headers);
  }

  if (ctx.init?.headers) {
    return new Headers(ctx.init.headers);
  }

  if (ctx.request instanceof Request) {
    return new Headers(ctx.request.headers);
  }

  return new Headers();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getRequestMethod(ctx: Parameters<Middleware>[0]): string {
  if (ctx.init?.method) {
    return ctx.init.method.toUpperCase();
  }

  if (ctx.request instanceof Request) {
    return ctx.request.method.toUpperCase();
  }

  return "GET";
}

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    try {
      const base =
        typeof window !== "undefined" && window.location?.origin
          ? window.location.origin
          : HOTSTAR_BASE_URL;
      return new URL(url, base);
    } catch {
      return null;
    }
  }
}

function isTargetRoute(method: string, url: URL): boolean {
  if (!url.pathname.includes(HOTSTAR_BFF_PATH)) {
    return false;
  }

  return (
    (method === "GET" && url.pathname.endsWith(WATCH_PATH_SUFFIX)) ||
    (method === "POST" && url.pathname.endsWith(START_PATH_SUFFIX))
  );
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseClientCapabilities(
  value: string,
): Record<string, unknown> | null {
  const candidates = [value];
  const decodedValue = safeDecodeURIComponent(value);
  if (decodedValue !== value) {
    candidates.push(decodedValue);
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (isRecord(parsed)) {
        return parsed;
      }
    } catch {
      // Continue trying fallback candidate
    }
  }

  return null;
}

function ensureArrayContainsValue(
  obj: Record<string, unknown>,
  key: string,
  value: string,
): boolean {
  const current = obj[key];

  if (Array.isArray(current)) {
    if (current.includes(value)) {
      return false;
    }
    current.push(value);
    return true;
  }

  if (typeof current === "string") {
    if (current === value) {
      obj[key] = [value];
      return true;
    }
    obj[key] = [current, value];
    return true;
  }

  obj[key] = [value];
  return true;
}

function patchClientCapabilitiesObject(
  capabilities: Record<string, unknown>,
): boolean {
  let changed = false;
  changed =
    ensureArrayContainsValue(
      capabilities,
      RESOLUTION_KEY,
      RESOLUTION_4K_VALUE,
    ) || changed;
  changed =
    ensureArrayContainsValue(
      capabilities,
      VIDEO_CODEC_KEY,
      VIDEO_CODEC_H265_VALUE,
    ) || changed;
  return changed;
}

function patchClientCapabilitiesInUrl(url: URL): boolean {
  const currentValue = url.searchParams.get(CLIENT_CAPABILITIES_PARAM);
  if (!currentValue) {
    return false;
  }

  const capabilities = parseClientCapabilities(currentValue);
  if (!capabilities) {
    return false;
  }

  const changed = patchClientCapabilitiesObject(capabilities);
  if (!changed) {
    return false;
  }

  url.searchParams.set(CLIENT_CAPABILITIES_PARAM, JSON.stringify(capabilities));
  return true;
}

function patchDeepLinkUrlValue(value: string): {
  changed: boolean;
  value: string;
} {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value, HOTSTAR_BASE_URL);
  } catch {
    return { changed: false, value };
  }

  const changed = patchClientCapabilitiesInUrl(parsedUrl);
  if (!changed) {
    return { changed: false, value };
  }

  if (value.startsWith("/")) {
    return {
      changed: true,
      value: `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`,
    };
  }

  return { changed: true, value: parsedUrl.toString() };
}

function patchStartBody(ctx: Parameters<Middleware>[0]): boolean {
  const body = ctx.init?.body;

  if (typeof body === "string") {
    try {
      const parsedBody = JSON.parse(body);
      if (
        !isRecord(parsedBody) ||
        typeof parsedBody.deeplink_url !== "string"
      ) {
        return false;
      }

      const patchedDeepLink = patchDeepLinkUrlValue(parsedBody.deeplink_url);
      if (!patchedDeepLink.changed) {
        return false;
      }

      parsedBody.deeplink_url = patchedDeepLink.value;
      ctx.init = {
        ...(ctx.init ?? {}),
        body: JSON.stringify(parsedBody),
      };
      return true;
    } catch {
      return false;
    }
  }

  if (body instanceof URLSearchParams) {
    const deepLink = body.get("deeplink_url");
    if (!deepLink) {
      return false;
    }

    const patchedDeepLink = patchDeepLinkUrlValue(deepLink);
    if (!patchedDeepLink.changed) {
      return false;
    }

    const params = new URLSearchParams(body);
    params.set("deeplink_url", patchedDeepLink.value);
    ctx.init = {
      ...(ctx.init ?? {}),
      body: params,
    };
    return true;
  }

  return false;
}

function patch4kHeader(ctx: Parameters<Middleware>[0]): boolean {
  const headers = getRequestHeaders(ctx);
  const originalValue = headers.get(HEADER_NAME);
  if (!originalValue) {
    return false;
  }

  const modifiedValue = originalValue.replace(
    PATTERN_TO_REPLACE,
    REPLACEMENT_VALUE,
  );

  if (modifiedValue === originalValue) {
    return false;
  }

  headers.set(HEADER_NAME, modifiedValue);
  ctx.init = {
    ...(ctx.init ?? {}),
    headers,
  };
  return true;
}

function updateRequestUrl(ctx: Parameters<Middleware>[0], newUrl: string) {
  ctx.url = newUrl;

  if (ctx.request instanceof Request) {
    ctx.request = new Request(newUrl, ctx.request);
    return;
  }

  if (ctx.request instanceof URL) {
    ctx.request = new URL(newUrl);
    return;
  }

  ctx.request = newUrl;
}

export const enable4k: Middleware = async (ctx, next) => {
  const method = getRequestMethod(ctx);
  const parsedUrl = parseUrl(ctx.url);

  if (!parsedUrl || !isTargetRoute(method, parsedUrl)) {
    await next();
    return;
  }

  const headerPatched = patch4kHeader(ctx);
  const queryPatched = patchClientCapabilitiesInUrl(parsedUrl);
  if (queryPatched) {
    updateRequestUrl(ctx, parsedUrl.toString());
  }

  const startBodyPatched =
    method === "POST" && parsedUrl.pathname.endsWith(START_PATH_SUFFIX)
      ? patchStartBody(ctx)
      : false;

  if (headerPatched || queryPatched || startBodyPatched) {
    logger.debug("[Hotstar] Applied Enable 4K request patch", {
      source: "hotstar",
      middleware: "enable-4k",
      method,
      url: ctx.url,
      headerPatched,
      queryPatched,
      startBodyPatched,
    });
  }

  await next();
};
