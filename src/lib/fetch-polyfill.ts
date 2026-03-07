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

    return originalFetch.call(window, ctx.request, ctx.init);
  };

  const OriginalXHR = window.XMLHttpRequest;
  // @ts-expect-error - Overriding XMLHttpRequest
  window.XMLHttpRequest = function () {
    const xhr = new OriginalXHR();
    const originalOpen = xhr.open.bind(xhr);
    const originalSend = xhr.send.bind(xhr);
    const originalSetRequestHeader = xhr.setRequestHeader.bind(xhr);

    let method = "";
    let url = "";
    let requestBody: Document | XMLHttpRequestBodyInit | null | undefined;
    const requestHeaders = new Headers();

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

    xhr.setRequestHeader = function (name: string, value: string) {
      requestHeaders.set(name, value);
      return originalSetRequestHeader(name, value);
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
          headers: requestHeaders,
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

      const applyResponseToXhr = async (response: Response) => {
        const responseType = xhr.responseType;

        Object.defineProperty(xhr, "readyState", { value: 4 });
        Object.defineProperty(xhr, "status", { value: response.status });
        Object.defineProperty(xhr, "statusText", {
          value: response.statusText,
        });

        if (responseType === "arraybuffer") {
          const buffer = await response.arrayBuffer();
          Object.defineProperty(xhr, "response", { value: buffer });
          Object.defineProperty(xhr, "responseText", { value: "" });
        } else if (responseType === "blob") {
          const blob = await response.blob();
          Object.defineProperty(xhr, "response", { value: blob });
          Object.defineProperty(xhr, "responseText", { value: "" });
        } else if (responseType === "document") {
          const text = await response.text();
          const parser =
            typeof DOMParser !== "undefined" ? new DOMParser() : undefined;
          const documentResponse = parser
            ? parser.parseFromString(text, "text/html")
            : text;

          Object.defineProperty(xhr, "response", { value: documentResponse });
          Object.defineProperty(xhr, "responseText", { value: text });
        } else if (responseType === "json") {
          const text = await response.text();
          let parsedJson: unknown = null;
          try {
            parsedJson = text.length ? JSON.parse(text) : null;
          } catch {
            parsedJson = null;
          }

          Object.defineProperty(xhr, "response", { value: parsedJson });
          Object.defineProperty(xhr, "responseText", { value: text });
        } else {
          const text = await response.text();
          Object.defineProperty(xhr, "responseText", { value: text });
          Object.defineProperty(xhr, "response", { value: text });
        }

        // Dispatch events
        xhr.dispatchEvent(new Event("readystatechange"));
        xhr.dispatchEvent(new Event("load"));
        xhr.dispatchEvent(new Event("loadend"));
      };

      if (ctx.handled && ctx.response) {
        await applyResponseToXhr(ctx.response);
        return;
      }

      // Use modified body if changed
      const finalBody =
        typeof ctx.init?.body === "string" ? ctx.init.body : requestBody;
      const resolvedRequestUrl =
        ctx.request instanceof Request ? ctx.request.url : ctx.request.toString();

      if (resolvedRequestUrl !== url) {
        const credentials: RequestCredentials = xhr.withCredentials
          ? "include"
          : (ctx.init?.credentials ?? "same-origin");

        const patchedResponse = await originalFetch.call(window, ctx.request, {
          ...(ctx.init ?? {}),
          method: ctx.init?.method ?? method,
          body: finalBody as BodyInit | undefined,
          credentials,
        });
        await applyResponseToXhr(patchedResponse);
        return;
      }

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
