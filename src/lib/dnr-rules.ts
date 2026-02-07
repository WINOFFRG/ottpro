/**
 * Dynamic DeclarativeNetRequest Rules
 *
 * These rules can be added/removed dynamically based on user settings.
 * Rule IDs should be high (1000+) to avoid conflicts with other extensions.
 */

import { logger } from "./logger";

const ANDROID_USER_AGENT =
  "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36";

// DNR Rule interface (subset of browser.declarativeNetRequest.Rule)
interface DnrRule {
  id: number;
  priority: number;
  action: {
    type: string;
    requestHeaders?: Array<{
      header: string;
      operation: string;
      value: string;
    }>;
  };
  condition: {
    regexFilter?: string;
    urlFilter?: string;
    resourceTypes: string[];
  };
}

/**
 * Prime Video - Bypass Lite Plan
 * Modifies User-Agent to Android to enable 1080p FHD on desktop
 */
export const PRIMEVIDEO_BYPASS_LITE_PLAN_RULE: DnrRule = {
  id: 1001,
  priority: 1,
  action: {
    type: "modifyHeaders",
    requestHeaders: [
      {
        header: "User-Agent",
        operation: "set",
        value: ANDROID_USER_AGENT,
      },
    ],
  },
  condition: {
    regexFilter:
      "^https://www\\.primevideo\\.com/(detail/|api/getTitles|api/getDetailWidgets)",
    resourceTypes: ["main_frame", "sub_frame", "xmlhttprequest", "other"],
  },
};

/**
 * Prime Video - Block Telemetry Rules
 * Multiple simple rules instead of one complex regex
 */
const TELEMETRY_RESOURCE_TYPES = [
  "xmlhttprequest",
  "ping",
  "other",
  "script",
  "image",
];

export const PRIMEVIDEO_BLOCK_TELEMETRY_RULES: DnrRule[] = [
  {
    id: 1002,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||unagi-eu.amazon.com/",
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1003,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||global.telemetry.insights.video.a2z.com/",
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1004,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||sonar.prime-video.amazon.dev/",
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1005,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||minerva.devices.a2z.com/",
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1006,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||atv-ps-eu.primevideo.com/cdp/usage/ClientsideImpression",
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1007,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||atv-ps-eu.primevideo.com/cdp/insights/reportEvent",
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
];

/**
 * Map of app:rule keys to their DNR rule definitions
 */
export const DNR_RULE_MAP: Record<string, DnrRule | DnrRule[]> = {
  "primevideo:bypass-lite-plan": PRIMEVIDEO_BYPASS_LITE_PLAN_RULE,
  "primevideo:block-telemetry": PRIMEVIDEO_BLOCK_TELEMETRY_RULES,
};

/**
 * Get all rule IDs for cleanup
 */
export function getAllDnrRuleIds(): number[] {
  const ids: number[] = [];
  for (const rules of Object.values(DNR_RULE_MAP)) {
    if (Array.isArray(rules)) {
      ids.push(...rules.map((r) => r.id));
    } else {
      ids.push(rules.id);
    }
  }
  return ids;
}

/**
 * Sync a dynamic DNR rule based on enabled state
 */
export async function syncDynamicRule(
  appId: string,
  ruleId: string,
  enabled: boolean,
): Promise<void> {
  const ruleKey = `${appId}:${ruleId}`;
  const ruleOrRules = DNR_RULE_MAP[ruleKey];

  if (!ruleOrRules) {
    return;
  }

  const rules = Array.isArray(ruleOrRules) ? ruleOrRules : [ruleOrRules];
  const ruleIds = rules.map((r) => r.id);

  try {
    if (enabled) {
      await browser.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
        // @ts-expect-error - Rule type mismatch between our interface and browser types
        addRules: rules,
      });
      logger.info(`[DNR] Added ${rules.length} rule(s) for ${ruleKey}`);
    } else {
      await browser.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ruleIds,
      });
      logger.info(`[DNR] Removed ${rules.length} rule(s) for ${ruleKey}`);
    }
  } catch (error) {
    logger.error(`[DNR] Failed to sync rule ${ruleKey}`, { error });
  }
}

/**
 * Sync all DNR rules based on current storage state
 */
export async function syncAllDynamicRules(
  getRuleEnabled: (appId: string, ruleId: string) => Promise<boolean>,
): Promise<void> {
  for (const [ruleKey] of Object.entries(DNR_RULE_MAP)) {
    const [appId, ruleId] = ruleKey.split(":");
    const enabled = await getRuleEnabled(appId, ruleId);
    await syncDynamicRule(appId, ruleId, enabled);
  }
}
