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
    initiatorDomains?: string[];
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
 * Hotstar - Disable Telemetry Rules
 * Block telemetry hosts only when requests are initiated from www.hotstar.com
 */
const HOTSTAR_INITIATOR_DOMAINS = ["www.hotstar.com"];

export const HOTSTAR_DISABLE_TELEMETRY_RULES: DnrRule[] = [
  {
    id: 1101,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||analytics.google.com/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1102,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||bifrost-api.hotstar.com/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1103,
    priority: 1,
    action: { type: "block" },
    condition: {
      regexFilter: "^https://[^/]+\\.ingest\\.sentry\\.io/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1104,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||q.quora.com/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1105,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||cdn.growthbook.io/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1106,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||www.googletagmanager.com/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1107,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||connect.facebook.net/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1108,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||static.ads-twitter.com/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1109,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||bat.bing.com/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1110,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||a.quora.com/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1111,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||t.co/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1112,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||usersvc.hotstar.com/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1113,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||www.google-analytics.com/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
  {
    id: 1114,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: "||doubleclick.net/",
      initiatorDomains: HOTSTAR_INITIATOR_DOMAINS,
      resourceTypes: TELEMETRY_RESOURCE_TYPES,
    },
  },
];

/**
 * Map of app:rule keys to their DNR rule definitions
 */
export const DNR_RULE_MAP: Record<string, DnrRule | DnrRule[]> = {
  "hotstar:disable-telemetry": HOTSTAR_DISABLE_TELEMETRY_RULES,
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
