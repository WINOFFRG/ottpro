import type { AppConfig } from "@/lib/shared/types";
import {
  autoPictureInPictureMode,
  startAutoPictureInPicturePatch,
} from "./auto-picture-in-picture";
import { bypassAccountSharing } from "./bypass-account-sharing";
import { AUTO_PICTURE_IN_PICTURE_RULE_ID } from "./picture-in-picture";
import {
  netflixPlayerStats,
  NETFLIX_PLAYER_STATS_RULE_ID,
  triggerNetflixPlayerStatsShortcut,
} from "./player-stats";

export const config: AppConfig = {
  id: "netflix",
  name: "Netflix",
  domainPattern: "(^|\\.)netflix\\.com$",
  enabled: true,
  rules: [
    {
      id: "bypass-account-sharing",
      enabled: true,
      name: "Bypass Account Sharing",
      description:
        "Removes the device blocking screen, watch over any network now!",
      middleware: bypassAccountSharing,
    },
    {
      id: AUTO_PICTURE_IN_PICTURE_RULE_ID,
      enabled: true,
      name: "Enable PiP Mode",
      description: "Enables Picture-in-Picture mode for Netflix.",
      unsupportedDescription:
        "Unavailable in this browser because Picture-in-Picture is not supported.",
      middleware: autoPictureInPictureMode,
      onInit: startAutoPictureInPicturePatch,
    },
    {
      id: NETFLIX_PLAYER_STATS_RULE_ID,
      enabled: false,
      sessionOnly: true,
      name: "Player Stats",
      description: "Shows Netflix player stats. Shortcut: Ctrl+Alt/Option+Shift+D",
      middleware: netflixPlayerStats,
      onInit: triggerNetflixPlayerStatsShortcut,
    },
  ],
};
