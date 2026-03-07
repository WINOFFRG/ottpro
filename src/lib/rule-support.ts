import {
  AUTO_PICTURE_IN_PICTURE_RULE_ID,
  isAutoPictureInPictureSupported,
} from "@/lib/apps/netflix/picture-in-picture";
import {
  ENABLE_4K_RULE_ID,
  isH265PlaybackSupported,
} from "@/lib/apps/hotstar/enable-4k";
import type { AppConfig } from "@/lib/shared/types";
import { config as hotstarConfig } from "@/lib/apps/hotstar/config";
import { config as netflixConfig } from "@/lib/apps/netflix/config";

export function isRuleSupported(appId: string, ruleId: string): boolean {
  if (
    appId === netflixConfig.id &&
    ruleId === AUTO_PICTURE_IN_PICTURE_RULE_ID
  ) {
    return isAutoPictureInPictureSupported();
  }

  if (appId === hotstarConfig.id && ruleId === ENABLE_4K_RULE_ID) {
    return isH265PlaybackSupported();
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
