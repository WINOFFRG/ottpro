import type { AppHandler, SharedContext } from "../../shared/types";

export const hotstarHandler: AppHandler = {
  id: "hotstar",
  name: "Disney+ Hotstar",
  domain: "hotstar.com",
  enabled: true,

  handleBackgroundRequest: (details: any) => {
    const adPatterns = [
      "hesads.akamaized.net",
      "service.hotstar.com/blaze/",
      "bifrost-api.hotstar.com",
    ];

    const isBlocked = adPatterns.some((pattern) =>
      details.url.includes(pattern)
    );

    if (isBlocked) {
      return true;
    }

    return false;
  },
};
