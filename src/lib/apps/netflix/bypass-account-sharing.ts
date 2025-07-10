import { logger } from "@/lib/logger";
import type { Middleware } from "@/lib/shared/middleware";

export const bypassAccountSharing: Middleware = async (ctx, next) => {
  if (!ctx.url.includes("web.prod.cloud.netflix.com/graphql")) {
    await next();
    return;
  }

  let body: string | undefined;

  if (ctx.init?.body) {
    if (typeof ctx.init.body === "string") {
      body = ctx.init.body;
    } else {
      body = JSON.stringify(ctx.init.body);
    }
  }

  let shouldBlock = false;
  if (body) {
    try {
      const parsed = JSON.parse(body);
      const targetOps = [
        "CLCSInterstitialPlaybackAndPostPlayback",
        "CLCSInterstitialLolomo",
        "CLCSSendFeedback",
        "CLCSInterstitialPlaybackError",
      ];
      if (targetOps.includes(parsed.operationName)) {
        shouldBlock = true;
      }
    } catch {
      logger.error("Failed to parse body", { body });
    }
  }

  if (shouldBlock) {
    logger.info(`Blocking request ${ctx.url}`, {
      source: "netflix",
      middleware: "bypass-account-sharing",
    });

    ctx.setHandled();
    ctx.setResponse(
      new Response(JSON.stringify({}), {
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "application/json" },
      })
    );
    return;
  }

  await next();
};
