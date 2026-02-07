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

  // Intercept fetch API
  const originalFetch = window.fetch;
  window.fetch = async (
    resource: RequestInfo | URL,
    init?: RequestInit,
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
      originalFetch: originalFetch.bind(window),
    };

    await runMiddlewares(ctx);

    if (ctx.handled && ctx.response) {
      return ctx.response;
    }

    return originalFetch.call(window, resource, ctx.init);
  };

  const OriginalXHR = window.XMLHttpRequest;
  // @ts-expect-error - Overriding XMLHttpRequest
  window.XMLHttpRequest = function () {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open.bind(xhr);
    const originalSend = xhr.send.bind(xhr);

    let method = "";
    let url = "";
    let requestBody: Document | XMLHttpRequestBodyInit | null | undefined;

    xhr.open = function (
      _method: string,
      _url: string | URL,
      async?: boolean,
      username?: string | null,
      password?: string | null,
    ) {
      method = _method;
      url = _url.toString();
      return originalOpen(_method, _url, async ?? true, username, password);
    };

    xhr.send = async function (
      body?: Document | XMLHttpRequestBodyInit | null,
    ) {
      requestBody = body;

      logger.debug("🎯 Processing XHR for:", url);

      const ctx: MiddlewareContext = {
        request: url,
        init: {
          method,
          body: body as BodyInit | undefined,
        },
        url,
        handled: false,
        setHandled() {
          this.handled = true;
        },
        setResponse(resp: Response) {
          this.response = resp;
        },
        response: undefined,
        originalFetch: originalFetch.bind(window),
      };

      await runMiddlewares(ctx);

      if (ctx.handled && ctx.response) {
        // Fake the XHR response
        Object.defineProperty(xhr, "readyState", { value: 4 });
        Object.defineProperty(xhr, "status", { value: ctx.response.status });
        Object.defineProperty(xhr, "statusText", {
          value: ctx.response.statusText,
        });
        const text = await ctx.response.text();
        Object.defineProperty(xhr, "responseText", { value: text });
        Object.defineProperty(xhr, "response", { value: text });

        // Dispatch events
        xhr.dispatchEvent(new Event("readystatechange"));
        xhr.dispatchEvent(new Event("load"));
        xhr.dispatchEvent(new Event("loadend"));
        return;
      }

      // Use modified body if changed
      const finalBody =
        typeof ctx.init?.body === "string" ? ctx.init.body : requestBody;
      return originalSend(
        finalBody as Document | XMLHttpRequestBodyInit | null,
      );
    };

    return xhr;
  };

  // Copy static properties
  Object.keys(OriginalXHR).forEach((key) => {
    // @ts-expect-error - Copying static properties
    window.XMLHttpRequest[key] = OriginalXHR[key];
  });
  window.XMLHttpRequest.prototype = OriginalXHR.prototype;

  isPolyfillApplied = true;
  logger.info("Fetch and XHR polyfill applied successfully");
}
