import { logger } from "@/lib/logger";
import type { Middleware } from "@/lib/shared/middleware";

export const blockAds: Middleware = async (ctx, next) => {
  const url = ctx.url;

  if (url.includes("cdp/getVideoAds")) {
    logger.info(`[Prime Video] Blocking ad request: ${url}`, {
      source: "primevideo",
      middleware: "block-ads",
    });

    ctx.setHandled();
    ctx.setResponse(
      new Response(JSON.stringify({}), {
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "application/json" },
      }),
    );
    return;
  }

  if (!url.includes("/playback/prs/GetVodPlaybackResources")) {
    await next();
    return;
  }

  if (!ctx.init?.body) {
    await next();
    return;
  }

  logger.info(`[Prime Video] Intercepting GetVodPlaybackResources: ${url}`, {
    source: "primevideo",
    middleware: "block-ads",
  });

  try {
    let body: string;
    if (typeof ctx.init.body === "string") {
      body = ctx.init.body;
    } else if (ctx.init.body instanceof ArrayBuffer) {
      body = new TextDecoder().decode(ctx.init.body);
    } else {
      await next();
      return;
    }

    const parsed = JSON.parse(body);

    if (parsed?.vodPlaylistedPlaybackUrlsRequest?.ads) {
      const ads = parsed.vodPlaylistedPlaybackUrlsRequest.ads;

      if (ads.gdpr) {
        if ("consentMap" in ads.gdpr) {
          ads.gdpr.consentMap = true;
        }
      } else {
        ads.gdpr = {
          enabled: true,
          consentMap: false,
        };
      }

      logger.debug("[Prime Video] Modified ads.gdpr settings", {
        source: "primevideo",
        middleware: "block-ads",
        gdpr: ads.gdpr,
      });

      ctx.init = {
        ...ctx.init,
        body: JSON.stringify(parsed),
      };
    }
  } catch (err) {
    logger.error("[Prime Video] Failed to parse/modify request body", {
      source: "primevideo",
      middleware: "block-ads",
      error: err,
    });
  }

  await next();
};
