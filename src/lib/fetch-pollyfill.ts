import {
  composeMiddlewares,
  type Middleware,
  type MiddlewareContext,
} from "@/lib/shared/middleware";
import { logger } from "./logger";

let isPolyfillApplied = false;

export function fetchApiPolyfill(middlewares: Middleware[] = []) {
  if (isPolyfillApplied) {
    logger.debug("Fetch polyfill already applied, skipping");
    return;
  }

  if (middlewares.length === 0) {
    logger.debug("No middlewares provided, skipping fetch polyfill");
    return;
  }

  const runMiddlewares = composeMiddlewares(middlewares);

  const originalFetch = window.fetch;
  window.fetch = async (
    resource: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const url =
      resource instanceof Request ? resource.url : resource.toString();

    if (url.startsWith("chrome-extension://")) {
      return originalFetch.call(window, resource, init);
    }

    if (url.startsWith("data:") || url.startsWith("blob:")) {
      return originalFetch.call(window, resource, init);
    }

    logger.debug("🎯 Processing fetch for:", url);

    const ctx: MiddlewareContext = {
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

    await runMiddlewares(ctx);

    if (ctx.handled && ctx.response) {
      return ctx.response;
    }

    return originalFetch.call(window, resource, ctx.init);
  };

  isPolyfillApplied = true;
}
