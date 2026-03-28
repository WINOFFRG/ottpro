import { findAppByDomain } from "@/lib/apps/registry";
import { fetchApiPolyfill } from "@/lib/fetch-polyfill";
import {
  OTT_PRO_APP_ENABLED_KEY,
  OTT_PRO_ENABLED_RULES_KEY,
  OTT_PRO_SESSION_RULE_TOGGLE_EVENT,
} from "@/lib/shared/constants";

import type { Middleware } from "@/lib/shared/middleware";

export default defineUnlistedScript(() => {
  try {
    const staticConfig = findAppByDomain(window.location.hostname);
    if (!staticConfig) {
      return;
    }

    document.addEventListener(
      OTT_PRO_SESSION_RULE_TOGGLE_EVENT,
      (event: Event) => {
        const customEvent = event as CustomEvent<{
          appId?: string;
          ruleId?: string;
        }>;

        const appId = customEvent.detail?.appId;
        const ruleId = customEvent.detail?.ruleId;
        if (appId !== staticConfig.id || !ruleId) {
          return;
        }

        const rule = staticConfig.rules.find(
          (configRule) => configRule.id === ruleId,
        );
        if (!rule?.sessionOnly || !rule.onInit) {
          return;
        }

        rule.onInit();
      },
    );

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

    if (middlewares.length > 0) {
      fetchApiPolyfill(middlewares);
    }

    for (const rule of staticConfig.rules) {
      if (enabledRuleIds.includes(rule.id) && rule.onInit) {
        rule.onInit();
      }
    }
  } catch (error) {
    console.error("Script: Error during execution:", error);
  }
});
