import { storage } from "#imports";
import { appConfigs } from "./apps/registry";
import type { AppConfig, AppRule } from "./shared/types";

// Define storage item types
export interface AppState {
  enabled: boolean;
}

export interface RuleState {
  enabled: boolean;
}

// Storage keys for apps and rules
export type AppStorageKey = `local:app:${string}:enabled`;
export type RuleStorageKey = `local:app:${string}:rules:${string}:enabled`;

// Create storage items for each app's enabled state
export const createAppStorage = (appId: string) => {
  return storage.defineItem<boolean>(`local:app:${appId}:enabled` as const, {
    fallback: true, // Default to enabled
    version: 1,
  });
};

// Create storage items for each rule's enabled state
export const createRuleStorage = (appId: string, ruleName: string) => {
  // Create a safe key by replacing spaces and special chars
  const safeRuleName = ruleName.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return storage.defineItem<boolean>(
    `local:app:${appId}:rules:${safeRuleName}:enabled` as const,
    {
      fallback: true, // Default to enabled
      version: 1,
    }
  );
};

// Storage manager class to handle all app/rule states
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
    // Initialize storage items for all apps and rules
    for (const app of appConfigs) {
      // Create app storage item
      this.appStorageItems.set(app.id, createAppStorage(app.id));

      // Create rule storage items
      for (const rule of app.rules) {
        const key = this.getRuleKey(app.id, rule.name);
        this.ruleStorageItems.set(key, createRuleStorage(app.id, rule.name));
      }
    }
  }

  private getRuleKey(appId: string, ruleName: string): string {
    return `${appId}:${ruleName}`;
  }

  // Get app enabled state
  async getAppEnabled(appId: string): Promise<boolean> {
    const storageItem = this.appStorageItems.get(appId);
    if (!storageItem) {
      console.warn(`No storage item found for app: ${appId}`);
      return true; // Default to enabled
    }
    return await storageItem.getValue();
  }

  // Set app enabled state
  async setAppEnabled(appId: string, enabled: boolean): Promise<void> {
    const storageItem = this.appStorageItems.get(appId);
    if (!storageItem) {
      console.warn(`No storage item found for app: ${appId}`);
      return;
    }
    await storageItem.setValue(enabled);
  }

  // Get rule enabled state
  async getRuleEnabled(appId: string, ruleName: string): Promise<boolean> {
    const key = this.getRuleKey(appId, ruleName);
    const storageItem = this.ruleStorageItems.get(key);
    if (!storageItem) {
      console.warn(`No storage item found for rule: ${key}`);
      return true; // Default to enabled
    }
    return await storageItem.getValue();
  }

  // Set rule enabled state
  async setRuleEnabled(
    appId: string,
    ruleName: string,
    enabled: boolean
  ): Promise<void> {
    const key = this.getRuleKey(appId, ruleName);
    const storageItem = this.ruleStorageItems.get(key);
    if (!storageItem) {
      console.warn(`No storage item found for rule: ${key}`);
      return;
    }
    await storageItem.setValue(enabled);
  }

  // Get complete app config with storage-backed enabled states
  async getAppConfig(appId: string): Promise<AppConfig | undefined> {
    const staticConfig = appConfigs.find((config) => config.id === appId);
    if (!staticConfig) {
      return;
    }

    // Get app enabled state from storage
    const appEnabled = await this.getAppEnabled(appId);

    // Get rule enabled states from storage
    const rulesWithStorageState = await Promise.all(
      staticConfig.rules.map(async (rule) => ({
        ...rule,
        enabled: await this.getRuleEnabled(appId, rule.name),
      }))
    );

    return {
      ...staticConfig,
      enabled: appEnabled,
      rules: rulesWithStorageState,
    };
  }

  // Get all app configs with storage-backed states
  async getAllAppConfigs(): Promise<AppConfig[]> {
    const configs = await Promise.all(
      appConfigs.map((config) => this.getAppConfig(config.id))
    );
    return configs.filter(Boolean) as AppConfig[];
  }

  // Watch for app enabled state changes
  watchAppEnabled(
    appId: string,
    callback: (enabled: boolean) => void
  ): () => void {
    const storageItem = this.appStorageItems.get(appId);
    if (!storageItem) {
      console.warn(`No storage item found for app: ${appId}`);
      return () => {};
    }

    const unwatch = storageItem.watch(callback);

    // Track watcher for cleanup
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

  // Watch for rule enabled state changes
  watchRuleEnabled(
    appId: string,
    ruleName: string,
    callback: (enabled: boolean) => void
  ): () => void {
    const key = this.getRuleKey(appId, ruleName);
    const storageItem = this.ruleStorageItems.get(key);
    if (!storageItem) {
      console.warn(`No storage item found for rule: ${key}`);
      return () => {};
    }

    const unwatch = storageItem.watch(callback);

    // Track watcher for cleanup
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

  // Clean up all watchers
  cleanup(): void {
    for (const watcherList of this.watchers.values()) {
      for (const unwatch of watcherList) {
        unwatch();
      }
    }
    this.watchers.clear();
  }

  // Initialize default values from static configs (run once on install)
  async initializeDefaults(): Promise<void> {
    console.log("🔧 Initializing storage defaults from static configs...");

    for (const app of appConfigs) {
      // Check if app state already exists
      const appStorageItem = this.appStorageItems.get(app.id);
      if (appStorageItem) {
        const existingValue = await appStorageItem.getValue();
        // Only set if not already initialized (getValue returns fallback if not set)
        if (existingValue === true) {
          // Fallback value
          await appStorageItem.setValue(app.enabled);
        }
      }

      // Initialize rule states
      for (const rule of app.rules) {
        const key = this.getRuleKey(app.id, rule.name);
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

    console.log("✅ Storage defaults initialized");
  }
}

// Create global instance
export const appStorage = new AppStorageManager();

// Utility functions for easier access
export const getAppEnabled = (appId: string) => appStorage.getAppEnabled(appId);
export const setAppEnabled = (appId: string, enabled: boolean) =>
  appStorage.setAppEnabled(appId, enabled);
export const getRuleEnabled = (appId: string, ruleName: string) =>
  appStorage.getRuleEnabled(appId, ruleName);
export const setRuleEnabled = (
  appId: string,
  ruleName: string,
  enabled: boolean
) => appStorage.setRuleEnabled(appId, ruleName, enabled);
export const getAppConfig = (appId: string) => appStorage.getAppConfig(appId);
export const getAllAppConfigs = () => appStorage.getAllAppConfigs();
export const watchAppEnabled = (
  appId: string,
  callback: (enabled: boolean) => void
) => appStorage.watchAppEnabled(appId, callback);
export const watchRuleEnabled = (
  appId: string,
  ruleName: string,
  callback: (enabled: boolean) => void
) => appStorage.watchRuleEnabled(appId, ruleName, callback);
