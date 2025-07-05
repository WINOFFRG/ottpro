import type { Middleware } from "@/lib/shared/middleware";

export const netflixInterstitialMiddleware: Middleware = async (ctx, next) => {
  console.log("netflixInterstitialMiddleware", ctx.url);

  if (!ctx.url.includes("web.prod.cloud.netflix.com/graphql")) {
    await next();
    return;
  }

  let body: any = undefined;
  if (ctx.init?.body) {
    if (typeof ctx.init.body === "string") {
      body = ctx.init.body;
    } else if (ctx.init.body instanceof FormData) {
      // skip
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
    } catch {}
  }

  if (shouldBlock) {
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
