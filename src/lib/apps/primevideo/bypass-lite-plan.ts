import type { Middleware } from "@/lib/shared/middleware";

/**
 * Bypass Lite Plan - No-op Middleware
 *
 * The actual User-Agent modification is handled by declarativeNetRequest
 * dynamic rules (see src/lib/dnr-rules.ts).
 *
 * This middleware exists as a placeholder so the rule appears in the UI
 * and can be toggled. The toggle syncs with the DNR rule in the background.
 */
export const bypassLitePlan: Middleware = async (_ctx, next) => {
  await next();
};
