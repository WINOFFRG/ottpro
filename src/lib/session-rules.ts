import { HOTSTAR_DEBUG_MODE_RULE_ID } from "@/lib/apps/hotstar/debug-mode";
import { NETFLIX_PLAYER_STATS_RULE_ID } from "@/lib/apps/netflix/player-stats";

const SESSION_ONLY_RULE_DEFAULTS = new Map<string, boolean>([
  [`hotstar:${HOTSTAR_DEBUG_MODE_RULE_ID}`, false],
  [`netflix:${NETFLIX_PLAYER_STATS_RULE_ID}`, false],
]);

function getRuleKey(appId: string, ruleId: string): string {
  return `${appId}:${ruleId}`;
}

export function isSessionOnlyRule(appId: string, ruleId: string): boolean {
  return SESSION_ONLY_RULE_DEFAULTS.has(getRuleKey(appId, ruleId));
}

export function getSessionOnlyRuleDefault(
  appId: string,
  ruleId: string,
): boolean | undefined {
  return SESSION_ONLY_RULE_DEFAULTS.get(getRuleKey(appId, ruleId));
}
