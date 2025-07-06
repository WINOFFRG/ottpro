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

const HEADER_NAME = "x-hs-client";
const PATTERN_TO_REPLACE = /platform:web/g;
const REPLACEMENT_VALUE = "platform:android";

const shouldInterceptUrl = (url: string | URL): boolean => {
  console.log("shouldInterceptUrl", url);

  let pathname = "";
  try {
    if (typeof url === "string") {
      const fullUrl = window.location.origin + url;
      pathname = new URL(fullUrl).pathname;
    } else {
      pathname = url.pathname;
    }

    return pathname.endsWith("/watch") || pathname.endsWith("/start");
  } catch (e) {
    console.error(e, url);
    return false;
  }
};

const modifyHeaderValue = (
  value: string
): { modified: boolean; value: string } => {
  const originalValue = value;
  const modifiedValue = value.replace(PATTERN_TO_REPLACE, REPLACEMENT_VALUE);
  return {
    modified: originalValue !== modifiedValue,
    value: modifiedValue,
  };
};

export const patchXMLHttpRequest = () => {
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    async = true,
    username?: string | null,
    password?: string | null
  ) {
    this._interceptedURL = url.toString();
    this._interceptedMethod = method;
    this._interceptedHeaders = {};
    this._modifiedHeaders = {};
    this._shouldIntercept = shouldInterceptUrl(url);
    return originalXHROpen.call(
      this,
      method,
      url,
      // @ts-ignore
      async,
      username,
      password
    );
  };

  XMLHttpRequest.prototype.setRequestHeader = function (
    name: string,
    value: string
  ) {
    if (!this._interceptedHeaders) this._interceptedHeaders = {};
    if (!this._modifiedHeaders) this._modifiedHeaders = {};

    this._interceptedHeaders[name] = value;

    if (this._shouldIntercept && name.toLowerCase() === HEADER_NAME) {
      const { modified, value: modifiedValue } = modifyHeaderValue(value);

      if (modified) {
        this._modifiedHeaders[name] = modifiedValue;
        return originalXHRSetRequestHeader.call(this, name, modifiedValue);
      }
    }

    return originalXHRSetRequestHeader.call(this, name, value);
  };

  XMLHttpRequest.prototype.send = function (
    body?: Document | XMLHttpRequestBodyInit | null
  ) {
    if (
      this._shouldIntercept &&
      this._modifiedHeaders &&
      Object.keys(this._modifiedHeaders).length > 0
    ) {
      console.group(
        "%c XHR [INTERCEPTED]",
        "background: #9b59b6; color: white; padding: 3px; border-radius: 3px;"
      );
      console.log("%c URL:", "font-weight: bold;", this._interceptedURL);
      console.log("%c Modified Headers:", "font-weight: bold; color: #e74c3c;");
      console.table(this._modifiedHeaders);
      console.groupEnd();
    }

    return originalXHRSend.call(this, body);
  };
};
