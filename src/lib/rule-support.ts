import {
  AUTO_PICTURE_IN_PICTURE_RULE_ID,
  isAutoPictureInPictureSupported,
} from "@/lib/apps/netflix/picture-in-picture";
import type { AppConfig } from "@/lib/shared/types";

export function isRuleSupported(appId: string, ruleId: string): boolean {
  if (appId === "netflix" && ruleId === AUTO_PICTURE_IN_PICTURE_RULE_ID) {
    return isAutoPictureInPictureSupported();
  }

  return true;
}

export function withRuleSupport(appConfigs: AppConfig[]): AppConfig[] {
  return appConfigs.map((app) => ({
    ...app,
    rules: app.rules.map((rule) => ({
      ...rule,
      supported: isRuleSupported(app.id, rule.id),
    })),
  }));
}
