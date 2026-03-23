import type { AppConfig } from "@/lib/shared/types";
import { blockAds } from "./block-ads";
import { blockTelemetry } from "./block-telemetry";
import { patchScripts } from "./script-watcher";

/**
 * Prime Video App Configuration
 * Brand Color: #0779FD (Amazon Prime Blue)
 */
export const config: AppConfig = {
  id: "primevideo",
  name: "Prime Video",
  domainPattern: "primevideo\\.com$",
  enabled: true,
  rules: [
    {
      id: "bypass-lite-plan",
      enabled: true,
      name: "Bypass Lite Plan",
      description:
        "With a Lite plan you can watch 1080p FHD content on desktop as well.",
      middleware: patchScripts,
    },
    {
      id: "block-ads",
      enabled: true,
      name: "Block Ads",
      description: "Blocks all Ads during playback",
      middleware: blockAds,
    },
    {
      id: "block-telemetry",
      enabled: true,
      name: "Block Telemetry",
      description: "Blocks tracking and analytics requests",
      middleware: blockTelemetry,
    },
  ],
};
