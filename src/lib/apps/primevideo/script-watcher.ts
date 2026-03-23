import type { Middleware } from "@/lib/shared/middleware";

/**
 * Middleware for fetch/XHR interception - patches response content
 */
export const patchScripts: Middleware = (_ctx, next) => next();
