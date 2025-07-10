import { onMessage, StorageMessageType } from "@/lib/messaging";
import { AppStorageManager } from "@/lib/storage";

export default defineBackground(() => {
  const storageManager = new AppStorageManager();

  onMessage(StorageMessageType.GET_APP_ENABLED, async (message) => {
    console.log("Background: Getting app enabled state for", message.data);
    return await storageManager.getAppEnabled(message.data);
  });

  onMessage(StorageMessageType.SET_APP_ENABLED, async (message) => {
    const { appId, enabled } = message.data;
    console.log("Background: Setting app enabled state", { appId, enabled });
    await storageManager.setAppEnabled(appId, enabled);

    // Broadcast the change to all tabs
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        browser.tabs
          .sendMessage(tab.id, {
            type: StorageMessageType.STORAGE_CHANGED,
            data: { appId, enabled },
          })
          .catch(() => {
            // Ignore errors for tabs that don't have content scripts
          });
      }
    }
  });

  onMessage(StorageMessageType.GET_RULE_ENABLED, async (message) => {
    const { appId, ruleId } = message.data;
    console.log("Background: Getting rule enabled state", { appId, ruleId });
    return await storageManager.getRuleEnabled(appId, ruleId);
  });

  onMessage(StorageMessageType.SET_RULE_ENABLED, async (message) => {
    const { appId, ruleId, enabled } = message.data;
    console.log("Background: Setting rule enabled state", {
      appId,
      ruleId,
      enabled,
    });
    await storageManager.setRuleEnabled(appId, ruleId, enabled);

    // Broadcast the change to all tabs
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        browser.tabs
          .sendMessage(tab.id, {
            type: StorageMessageType.STORAGE_CHANGED,
            data: { appId, ruleId, enabled },
          })
          .catch(() => {
            // Ignore errors for tabs that don't have content scripts
          });
      }
    }
  });

  onMessage(StorageMessageType.GET_APP_CONFIG, async (message) => {
    console.log("Background: Getting app config for", message.data);
    const config = await storageManager.getAppConfig(message.data);
    if (!config) {
      throw new Error(`App config not found for: ${message.data}`);
    }
    return config;
  });

  onMessage(StorageMessageType.GET_ALL_APP_CONFIGS, async () => {
    console.log("Background: Getting all app configs");
    return await storageManager.getAllAppConfigs();
  });

  onMessage(StorageMessageType.INITIALIZE_DEFAULTS, async () => {
    console.log("Background: Initializing storage defaults");
    await storageManager.initializeDefaults();
  });

  (browser.action ?? browser.browserAction).onClicked.addListener(
    async (tab) => {
      console.log("browser action triggered,", tab);
      if (tab.id) {
        await browser.tabs.sendMessage(tab.id, { type: "MOUNT_UI" });
      }
    }
  );

  browser.runtime.onInstalled.addListener(async (details) => {
    try {
      console.log("Background: Initializing defaults...");
      await storageManager.initializeDefaults();
      console.log("Background: Storage initialization complete");
    } catch (error) {
      console.error("Background: Failed to initialize storage:", error);
    }

    if (details.reason === "install") {
      console.log("Extension installed for the first time");
    } else if (details.reason === "update") {
      console.log("Extension updated");
      console.log("Previous version:", details.previousVersion);
    } else if (details.reason === "chrome_update") {
      console.log("Chrome browser updated");
    }
  });
});
