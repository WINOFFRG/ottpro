import type { AppConfig } from "@/lib/shared/types";
import { blockAds } from "./block-ads";
import { disableTelemetry } from "./disable-telemetry";

export const config: AppConfig = {
  id: "hotstar",
  name: "Hotstar",
  domainPattern: "(^|\\.)hotstar\\.com$",
  enabled: true,
  rules: [
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
  ],
};
