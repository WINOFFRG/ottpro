import type { AppConfig } from "../../shared/types";
import { blockAds } from "./block-ads";
import { hotstarHeaderMiddleware } from "./middleware";

export const config: AppConfig = {
  id: "hotstar",
  name: "Disney+ Hotstar",
  domainPattern: /(^|\.)hotstar\.com$/,
  enabled: true,
  rules: [
    {
      enabled: true,
      name: "Header Modification",
      description: "Modify x-hs-client header to use Android platform",
      middleware: hotstarHeaderMiddleware,
    },
    {
      enabled: true,
      name: "Ad Blocking",
      description: "Block advertisement and tracking requests",
      middleware: blockAds,
    },
  ],
};
