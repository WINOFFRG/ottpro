import type { LogLevel } from "@/lib/logger";

declare module "wxt/utils/define-app-config" {
  export interface WxtAppConfig {
    defaultLogLevel: LogLevel;
  }
}

export default defineAppConfig({
  defaultLogLevel: import.meta.env.MODE === "development" ? 0 : 1,
});
