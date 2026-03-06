import type { Middleware } from "@/lib/shared/middleware";

/**
 * Disable Telemetry - No-op Middleware
 *
 * Host blocking is handled by declarativeNetRequest
 * dynamic rules (see src/lib/dnr-rules.ts).
 */
export const disableTelemetry: Middleware = async (_ctx, next) => {
  await next();
};
