import {
  isPrimeVideoTargetScriptUrl,
  patchPrimeVideoScriptContent,
} from "@/lib/apps/primevideo/script-patch-shared";

const PRIMEVIDEO_PAGE_BOOTSTRAP_FLAG =
  "__OTT_PRO_PRIMEVIDEO_PAGE_BOOTSTRAP__";
const PENDING_URL_KEY = "__ottProPrimevideoPendingSrc";
type PrimeVideoScriptElement = HTMLScriptElement & {
  __ottProPrimevideoPendingSrc?: string;
};

export default defineUnlistedScript(() => {
  if (!window.location.hostname.endsWith("primevideo.com")) {
    return;
  }

  const pageWindow = window as Window & {
    [PRIMEVIDEO_PAGE_BOOTSTRAP_FLAG]?: boolean;
  };

  if (pageWindow[PRIMEVIDEO_PAGE_BOOTSTRAP_FLAG]) {
    return;
  }
  pageWindow[PRIMEVIDEO_PAGE_BOOTSTRAP_FLAG] = true;

  const processedScripts = new WeakSet<HTMLScriptElement>();
  const scriptCache = new Map<string, Promise<string>>();

  const setStatus = (status: string, url?: string) => {
    if (!document.documentElement) {
      return;
    }

    if (url) {
      document.documentElement.dataset.ottProPrimevideoInterceptor = url;
    }
    document.documentElement.dataset.ottProPrimevideoInterceptorStatus = status;
  };

  const fetchPatchedScript = (url: string) => {
    let pendingScript = scriptCache.get(url);
    if (!pendingScript) {
      pendingScript = fetch(url)
        .then((response) => response.text())
        .then((content) => patchPrimeVideoScriptContent(content).content);
      scriptCache.set(url, pendingScript);
    }

    return pendingScript;
  };

  const replaceScript = (
    node: Node | null | undefined,
    forcedUrl?: string,
  ): void => {
    if (!(node instanceof HTMLScriptElement)) {
      return;
    }

    const scriptNode = node as PrimeVideoScriptElement;
    const scriptUrl =
      forcedUrl ??
      scriptNode[PENDING_URL_KEY] ??
      scriptNode.getAttribute("src") ??
      scriptNode.src;
    if (
      !scriptUrl ||
      !isPrimeVideoTargetScriptUrl(scriptUrl) ||
      processedScripts.has(scriptNode)
    ) {
      return;
    }

    processedScripts.add(scriptNode);
    delete scriptNode[PENDING_URL_KEY];

    const originalOnload = scriptNode.onload;
    const originalOnerror = scriptNode.onerror;
    setStatus("intercepting", scriptUrl);

    scriptNode.removeAttribute("src");
    scriptNode.removeAttribute("defer");
    scriptNode.removeAttribute("async");

    fetchPatchedScript(scriptUrl)
      .then((patchedContent) => {
        const replacement = document.createElement("script");
        for (const { name, value } of Array.from(scriptNode.attributes)) {
          if (name === "src" || name === "async" || name === "defer") {
            continue;
          }
          replacement.setAttribute(name, value);
        }

        replacement.textContent = `${patchedContent}\n//# sourceURL=${scriptUrl}`;
        replacement.dataset.ottProPrimevideoIntercepted = "page";
        scriptNode.replaceWith(replacement);
        setStatus("patched", scriptUrl);

        if (originalOnload) {
          originalOnload.call(replacement, new Event("load"));
        }
      })
      .catch((error) => {
        setStatus("failed", scriptUrl);
        if (originalOnerror) {
          originalOnerror.call(scriptNode, new Event("error"));
        }
        console.error("OTT Pro Prime Video bootstrap failed", error);
      });
  };

  const inspectNode = (node: Node) => {
    if (node instanceof HTMLScriptElement) {
      replaceScript(node);
      return;
    }

    if (node instanceof Element) {
      node
        .querySelectorAll<HTMLScriptElement>("script[src]")
        .forEach((scriptNode) => {
          replaceScript(scriptNode);
        });
    }
  };

  const wrapMethod = (
    proto: typeof Node.prototype,
    methodName: "appendChild" | "insertBefore" | "replaceChild",
  ) => {
    const original = proto[methodName] as (...args: unknown[]) => unknown;
    if (typeof original !== "function") {
      return;
    }

    Object.defineProperty(proto, methodName, {
      configurable: true,
      value: function (...args: unknown[]) {
        const node = args[0];
        if (node instanceof Node) {
          inspectNode(node);
        }
        return original.apply(this, args as never[]);
      },
    });
  };

  wrapMethod(Node.prototype, "appendChild");
  wrapMethod(Node.prototype, "insertBefore");
  wrapMethod(Node.prototype, "replaceChild");

  const originalSetAttribute = HTMLScriptElement.prototype.setAttribute;
  HTMLScriptElement.prototype.setAttribute = function (name, value) {
    if (name === "src") {
      const nextUrl = String(value);
      if (isPrimeVideoTargetScriptUrl(nextUrl)) {
        (this as PrimeVideoScriptElement)[PENDING_URL_KEY] = nextUrl;
        queueMicrotask(() => {
          replaceScript(this, nextUrl);
        });
        return;
      }
    }

    return originalSetAttribute.call(this, name, value);
  };

  const srcDescriptor = Object.getOwnPropertyDescriptor(
    HTMLScriptElement.prototype,
    "src",
  );
  if (srcDescriptor?.configurable && srcDescriptor.get && srcDescriptor.set) {
    const originalGet = srcDescriptor.get;
    const originalSet = srcDescriptor.set;

    Object.defineProperty(HTMLScriptElement.prototype, "src", {
      configurable: true,
      enumerable: srcDescriptor.enumerable ?? true,
      get(this: HTMLScriptElement) {
        return originalGet.call(this);
      },
      set(this: HTMLScriptElement, value) {
        const nextUrl = String(value);
        if (isPrimeVideoTargetScriptUrl(nextUrl)) {
          (this as PrimeVideoScriptElement)[PENDING_URL_KEY] = nextUrl;
          queueMicrotask(() => {
            replaceScript(this, nextUrl);
          });
          return;
        }

        return originalSet.call(this, value);
      },
    });
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        inspectNode(node);
      }
    }
  });

  observer.observe(document.documentElement ?? document, {
    childList: true,
    subtree: true,
  });

  document
    .querySelectorAll<HTMLScriptElement>("script[src]")
    .forEach((scriptNode) => {
      replaceScript(scriptNode);
    });
});
