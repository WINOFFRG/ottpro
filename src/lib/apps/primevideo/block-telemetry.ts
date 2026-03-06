import type { Middleware } from "@/lib/shared/middleware";

/**
 * Block Telemetry - No-op Middleware
 *
 * The actual request blocking is handled by declarativeNetRequest
 * dynamic rules (see src/lib/dnr-rules.ts).
 */
export const blockTelemetry: Middleware = (_ctx, next) => next();
