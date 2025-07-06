declare global {
  interface XMLHttpRequest {
    _interceptedURL?: string;
    _interceptedMethod?: string;
    _interceptedHeaders?: Record<string, string>;
    _modifiedHeaders?: Record<string, string>;
    _shouldIntercept?: boolean;
  }
}

export default defineContentScript({
  matches: ["*://*.hotstar.com/*"],
  runAt: "document_start",
  world: "MAIN",
  main() {
    console.log(
      "%c [ext] Content script is running on hotstar.com",
      "background: #2ecc71; color: white; padding: 5px; border-radius: 3px;"
    );

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
      const modifiedValue = value.replace(
        PATTERN_TO_REPLACE,
        REPLACEMENT_VALUE
      );
      return {
        modified: originalValue !== modifiedValue,
        value: modifiedValue,
      };
    };

    const patchXMLHttpRequest = () => {
      const originalXHROpen = XMLHttpRequest.prototype.open;
      const originalXHRSetRequestHeader =
        XMLHttpRequest.prototype.setRequestHeader;
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
          console.log(
            "%c Modified Headers:",
            "font-weight: bold; color: #e74c3c;"
          );
          console.table(this._modifiedHeaders);
          console.groupEnd();
        }

        return originalXHRSend.call(this, body);
      };
    };

    patchXMLHttpRequest();

    console.log(
      "%c [ext] Header modification hooks installed successfully",
      "color: #2ecc71; font-weight: bold;"
    );
  },
});
