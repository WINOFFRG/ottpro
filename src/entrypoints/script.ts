import { findAppByDomain } from "@/lib/apps/registry";
import { fetchApiPolyfill } from "@/lib/fetch-polyfill";
import {
  OTT_PRO_APP_ENABLED_KEY,
  OTT_PRO_ENABLED_RULES_KEY,
} from "@/lib/shared/constants";

import type { Middleware } from "@/lib/shared/middleware";

export default defineUnlistedScript(() => {
  try {
    const staticConfig = findAppByDomain(window.location.hostname);
    if (!staticConfig) {
      return;
    }

    // Read enabled state from DOM (set by content script from storage)
    const appEnabled =
      document.documentElement.dataset[OTT_PRO_APP_ENABLED_KEY] !== "false";
    const enabledRulesJson =
      document.documentElement.dataset[OTT_PRO_ENABLED_RULES_KEY];
    const enabledRuleIds: string[] = enabledRulesJson
      ? JSON.parse(enabledRulesJson)
      : [];

    if (!appEnabled) {
      return;
    }

    const middlewares: Middleware[] = [];
    for (const rule of staticConfig.rules) {
      if (enabledRuleIds.includes(rule.id)) {
        middlewares.push(rule.middleware);
      }
    }

    for (const rule of staticConfig.rules) {
      if (enabledRuleIds.includes(rule.id) && rule.onInit) {
        rule.onInit();
      }
    }

    if (middlewares.length > 0) {
      fetchApiPolyfill(middlewares);
    }
  } catch (error) {
    console.error("Script: Error during execution:", error);
  }
});
