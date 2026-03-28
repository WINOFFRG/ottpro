import { appConfigs } from "@/lib/apps/registry";
import type { AppConfig } from "@/lib/shared/types";
import { DEFAULT_LOG_LEVEL, logger, type LogLevel } from "@/lib/logger";

export const createAppStorage = (appId: string) => {
  return storage.defineItem<boolean>(`local:app:${appId}:enabled` as const, {
    fallback: true,
    version: 1,
  });
};

export const createRuleStorage = (appId: string, ruleId: string) => {
  return storage.defineItem<boolean>(
    `local:app:${appId}:rules:${ruleId}:enabled` as const,
    {
      fallback: true, // Default to enabled
      version: 1,
    },
  );
};

export const productInsightsStorage = storage.defineItem<boolean>(
  "local:product-insights:enabled",
  {
    fallback: true,
    version: 1,
  },
);

export const logLevelStorage = storage.defineItem<LogLevel>("local:log-level", {
  fallback: DEFAULT_LOG_LEVEL,
  version: 1,
});

export class AppStorageManager {
  private appStorageItems = new Map<
    string,
    ReturnType<typeof createAppStorage>
  >();
  private ruleStorageItems = new Map<
    string,
    ReturnType<typeof createRuleStorage>
  >();
  private watchers = new Map<string, (() => void)[]>();

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage() {
    for (const app of appConfigs) {
      this.appStorageItems.set(app.id, createAppStorage(app.id));

      for (const rule of app.rules) {
        if (rule.sessionOnly) {
          continue;
        }
        const key = this.getRuleKey(app.id, rule.id);
        this.ruleStorageItems.set(key, createRuleStorage(app.id, rule.id));
      }
    }
  }

  private getRuleKey(appId: string, ruleId: string): string {
    return `${appId}:${ruleId}`;
  }

  private findStaticRule(appId: string, ruleId: string) {
    const app = appConfigs.find((config) => config.id === appId);
    return app?.rules.find((rule) => rule.id === ruleId);
  }

  async getAppEnabled(appId: string): Promise<boolean> {
    const storageItem = this.appStorageItems.get(appId);
    if (!storageItem) {
      logger.warn(`No storage item found for app: ${appId}`);
      return true; // Default to enabled
    }
    return await storageItem.getValue();
  }

  async setAppEnabled(appId: string, enabled: boolean): Promise<void> {
    const storageItem = this.appStorageItems.get(appId);
    if (!storageItem) {
      logger.warn(`No storage item found for app: ${appId}`);
      return;
    }
    await storageItem.setValue(enabled);
  }

  async getRuleEnabled(appId: string, ruleId: string): Promise<boolean> {
    const staticRule = this.findStaticRule(appId, ruleId);
    if (staticRule?.sessionOnly) {
      return staticRule.enabled;
    }

    const key = this.getRuleKey(appId, ruleId);
    const storageItem = this.ruleStorageItems.get(key);
    if (!storageItem) {
      logger.warn(`No storage item found for rule: ${key}`);
      return staticRule?.enabled ?? true; // Default to enabled
    }
    return await storageItem.getValue();
  }

  // Set rule enabled state
  async setRuleEnabled(
    appId: string,
    ruleId: string,
    enabled: boolean,
  ): Promise<void> {
    const staticRule = this.findStaticRule(appId, ruleId);
    if (staticRule?.sessionOnly) {
      return;
    }

    const key = this.getRuleKey(appId, ruleId);
    const storageItem = this.ruleStorageItems.get(key);
    if (!storageItem) {
      logger.warn(`No storage item found for rule: ${key}`);
      return;
    }
    await storageItem.setValue(enabled);
  }

  async getAppConfig(appId: string): Promise<AppConfig | undefined> {
    const staticConfig = appConfigs.find((config) => config.id === appId);
    if (!staticConfig) {
      return;
    }

    const appEnabled = await this.getAppEnabled(appId);

    const rulesWithStorageState = await Promise.all(
      staticConfig.rules.map(async (rule) => ({
        ...rule,
        enabled: rule.sessionOnly
          ? rule.enabled
          : await this.getRuleEnabled(appId, rule.id),
      })),
    );

    return {
      ...staticConfig,
      enabled: appEnabled,
      rules: rulesWithStorageState,
    };
  }

  async getProductInsightsEnabled(): Promise<boolean> {
    return await productInsightsStorage.getValue();
  }

  async setProductInsightsEnabled(enabled: boolean): Promise<void> {
    await productInsightsStorage.setValue(enabled);
  }

  async getLogLevel(): Promise<LogLevel> {
    return await logLevelStorage.getValue();
  }

  async setLogLevel(level: LogLevel): Promise<void> {
    await logLevelStorage.setValue(level);
  }

  async getAllAppConfigs(): Promise<AppConfig[]> {
    const configs = await Promise.all(
      appConfigs.map((config) => this.getAppConfig(config.id)),
    );
    return configs.filter(Boolean) as AppConfig[];
  }

  watchAppEnabled(
    appId: string,
    callback: (enabled: boolean) => void,
  ): () => void {
    const storageItem = this.appStorageItems.get(appId);
    if (!storageItem) {
      logger.warn(`No storage item found for app: ${appId}`);
      return () => {};
    }

    const unwatch = storageItem.watch(callback);

    const watcherKey = `app:${appId}`;
    if (!this.watchers.has(watcherKey)) {
      this.watchers.set(watcherKey, []);
    }
    const watcherList = this.watchers.get(watcherKey);
    if (watcherList) {
      watcherList.push(unwatch);
    }

    return unwatch;
  }

  watchRuleEnabled(
    appId: string,
    ruleId: string,
    callback: (enabled: boolean) => void,
  ): () => void {
    const key = this.getRuleKey(appId, ruleId);
    const storageItem = this.ruleStorageItems.get(key);
    if (!storageItem) {
      logger.warn(`No storage item found for rule: ${key}`);
      return () => {};
    }

    const unwatch = storageItem.watch(callback);

    const watcherKey = `rule:${key}`;
    if (!this.watchers.has(watcherKey)) {
      this.watchers.set(watcherKey, []);
    }
    const watcherList = this.watchers.get(watcherKey);
    if (watcherList) {
      watcherList.push(unwatch);
    }

    return unwatch;
  }

  cleanup(): void {
    for (const watcherList of this.watchers.values()) {
      for (const unwatch of watcherList) {
        unwatch();
      }
    }
    this.watchers.clear();
  }

  async initializeDefaults(): Promise<void> {
    logger.info("🔧 Initializing storage defaults from static configs...");

    for (const app of appConfigs) {
      const appStorageItem = this.appStorageItems.get(app.id);
      if (appStorageItem) {
        const existingValue = await appStorageItem.getValue();
        // Only set if not already initialized (getValue returns fallback if not set)
        if (existingValue === true) {
          // Fallback value
          await appStorageItem.setValue(app.enabled);
        }
      }

      for (const rule of app.rules) {
        if (rule.sessionOnly) {
          continue;
        }
        const key = this.getRuleKey(app.id, rule.id);
        const ruleStorageItem = this.ruleStorageItems.get(key);
        if (ruleStorageItem) {
          const existingValue = await ruleStorageItem.getValue();
          if (existingValue === true) {
            // Fallback value
            await ruleStorageItem.setValue(rule.enabled);
          }
        }
      }
    }

    logger.info("✅ Storage defaults initialized");
  }
}
export const appStorage = new AppStorageManager();
