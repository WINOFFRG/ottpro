import type { Middleware } from "@/lib/shared/middleware";
import { logger } from "@/lib/logger";

/**
 * Script Patcher - Patches Prime Video scripts via fetch interception
 *
 * For scripts loaded via fetch/XHR: middleware patches response directly
 * For scripts loaded via <script> tags: MutationObserver intercepts, fetches
 * through polyfill (which triggers patching), then injects inline
 */

const TARGET_URL_PATTERN =
  /^https:\/\/m\.media-amazon\.com\/images\/I\/.*\.js/i;

const FIND_PATTERN =
  "e=>(null==e?void 0:e.isBonus)||(null==e?void 0:e.sequenceNumber)&&e.sequenceNumber>=1&&e.sequenceNumber<=3";
const REPLACE_WITH = "e=>true";

const handledUrls = new Set<string>();

/**
 * Middleware for fetch/XHR interception - patches response content
 */
export const patchScripts: Middleware = async (ctx, next) => {
  if (!TARGET_URL_PATTERN.test(ctx.url)) {
    return next();
  }

  if (handledUrls.has(ctx.url)) {
    return next();
  }
  handledUrls.add(ctx.url);

  try {
    const response = await ctx.originalFetch(ctx.url, ctx.init);
    const content = await response.text();

    if (!content.includes(FIND_PATTERN)) {
      ctx.setHandled();
      ctx.setResponse(
        new Response(content, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        }),
      );
      return;
    }

    const fileName = ctx.url.split("/").pop()?.split("?")[0];
    logger.info(`🔧 Patched script: ${fileName}`);

    const patchedContent = content.replace(FIND_PATTERN, REPLACE_WITH);

    ctx.setHandled();
    ctx.setResponse(
      new Response(patchedContent, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      }),
    );
  } catch (error) {
    logger.error("Patch failed", error);
    return next();
  }
};

/**
 * MutationObserver to intercept <script> tags and redirect through fetch
 * This ensures scripts loaded via HTML go through our fetch polyfill
 */
export function startScriptTagInterceptor() {
  const processedScripts = new Set<HTMLScriptElement>();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (
          node instanceof HTMLScriptElement &&
          node.src &&
          TARGET_URL_PATTERN.test(node.src) &&
          !processedScripts.has(node)
        ) {
          processedScripts.add(node);
          const originalSrc = node.src;
          const originalOnload = node.onload;
          const originalOnerror = node.onerror;

          node.removeAttribute("src");
          node.removeAttribute("defer");
          node.removeAttribute("async");

          fetch(originalSrc)
            .then((response) => response.text())
            .then((patchedContent) => {
              node.textContent = patchedContent;

              if (originalOnload) {
                originalOnload.call(node, new Event("load"));
              }
            })
            .catch((error) => {
              logger.error("Script fetch failed", error);
              if (originalOnerror) {
                originalOnerror.call(node, new Event("error"));
              }
            });
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}
