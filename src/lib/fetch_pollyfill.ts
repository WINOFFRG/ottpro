import { composeMiddlewares, MiddlewareContext } from "@/lib/shared/middleware";
import { hotstarHeaderMiddleware } from "@/lib/apps/hotstar/middleware";
import { netflixInterstitialMiddleware } from "@/lib/apps/netflix/middleware";

const middlewares = [hotstarHeaderMiddleware, netflixInterstitialMiddleware];

const runMiddlewares = composeMiddlewares(middlewares);

let isPolyfillApplied = false;

export function fetchApiPolyfill() {
  if (isPolyfillApplied) {
    console.log("Fetch polyfill already applied, skipping");
    return;
  }

  console.log("Applying fetch polyfill on:", window.location.href);

  const originalFetch = window.fetch;
  window.fetch = async function (
    resource: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url =
      resource instanceof Request ? resource.url : resource.toString();

    console.log("🔍 Fetch intercepted:", url);

    // Skip processing for extension URLs
    if (url.startsWith("chrome-extension://")) {
      console.log("⏭️  Skipping extension URL:", url);
      return originalFetch.call(window, resource, init);
    }

    // Skip processing for data URLs, blob URLs, etc.
    if (url.startsWith("data:") || url.startsWith("blob:")) {
      console.log("⏭️  Skipping data/blob URL:", url);
      return originalFetch.call(window, resource, init);
    }

    console.log("🎯 Processing fetch for:", url);

    let ctx: MiddlewareContext = {
      request: resource,
      init: init ? { ...init } : undefined,
      url,
      handled: false,
      setHandled() {
        this.handled = true;
      },
      setResponse(resp: Response) {
        this.response = resp;
      },
      response: undefined,
    };

    console.log("🔧 Running middlewares for:", url);
    await runMiddlewares(ctx);

    if (ctx.handled && ctx.response) {
      console.log("✅ Middleware handled:", url);
      return ctx.response;
    }

    console.log("➡️  Passing through to original fetch:", url);
    return originalFetch.call(window, resource, ctx.init);
  };

  isPolyfillApplied = true;
  console.log("✅ Fetch polyfill applied successfully");
}
