import type { Middleware } from "@/lib/shared/middleware";
import { logger } from "@/lib/logger";
import {
  isPrimeVideoTargetScriptUrl,
  patchPrimeVideoScriptContent,
} from "./script-patch-shared";

/**
 * Script Patcher - Patches Prime Video scripts via fetch interception
 *
 * For scripts loaded via fetch/XHR: middleware patches response directly.
 * Script-tag interception now happens earlier via the dedicated page bootstrap.
 */

const handledUrls = new Set<string>();

/**
 * Middleware for fetch/XHR interception - patches response content
 */
export const patchScripts: Middleware = async (ctx, next) => {
  if (!isPrimeVideoTargetScriptUrl(ctx.url)) {
    return next();
  }

  if (handledUrls.has(ctx.url)) {
    return next();
  }
  handledUrls.add(ctx.url);

  try {
    const response = await ctx.originalFetch(ctx.url, ctx.init);
    const content = await response.text();
    const { changed, content: patchedContent } =
      patchPrimeVideoScriptContent(content);

    if (!changed) {
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
