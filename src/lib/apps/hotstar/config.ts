import type { AppConfig } from "@/lib/shared/types";
import { blockAds } from "./block-ads";
import {
  debugMode,
  HOTSTAR_DEBUG_MODE_RULE_ID,
  triggerHotstarDebugMode,
} from "./debug-mode";
import { disableTelemetry } from "./disable-telemetry";
import { enable4k, ENABLE_4K_RULE_ID } from "./enable-4k";

export const config: AppConfig = {
  id: "hotstar",
  name: "Hotstar",
  domainPattern: "(^|\\.)hotstar\\.com$",
  enabled: true,
  rules: [
    {
      id: ENABLE_4K_RULE_ID,
      enabled: true,
      name: "Enable 4K",
      description:
        "Unlocks 4K playback, the quality will fallback to FHD if the device does not support the playback.",
      unsupportedDescription:
        "Unavailable because this device/browser does not support H.265 playback.",
      middleware: enable4k,
    },
    {
      id: "block-ads",
      enabled: true,
      name: "Block Ads",
      description:
        "Removes ad widgets from Hotstar BFF responses during playback and browse.",
      middleware: blockAds,
    },
    {
      id: "disable-telemetry",
      enabled: true,
      name: "Disable Telemetry",
      description: "Blocks tracking and telemetry hosts on Hotstar",
      middleware: disableTelemetry,
    },
    {
      id: HOTSTAR_DEBUG_MODE_RULE_ID,
      enabled: false,
      sessionOnly: true,
      name: "Player Stats",
      description: "Shows player stats overlay, Press . to toggle.",
      middleware: debugMode,
      onInit: triggerHotstarDebugMode,
    },
  ],
};
