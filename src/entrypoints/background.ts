import { onMessage, StorageMessageType } from "@/lib/messaging";
import { AppStorageManager } from "@/lib/storage";
import { syncAllDynamicRules, syncDynamicRule } from "@/lib/dnr-rules";
import { logger, setGlobalLogLevel } from "@/lib/logger";

import { isSessionOnlyRule } from "@/lib/session-rules";
import { exportCookies, importCookies } from "@/lib/cookie-transfer-background";

import { WELCOME_URL } from "@/lib/shared/constants";

export default defineBackground(() => {
  const storageManager = new AppStorageManager();
  Promise.all([
    storageManager.getProductInsightsEnabled(),
    storageManager.getLogLevel(),
  ])
    .then(([enabled, logLevel]) => {
      setGlobalLogLevel(logLevel);
    })
    .catch((error) => {
      logger.error("Failed to load product insights setting", { error });
    });

  onMessage(StorageMessageType.GET_APP_ENABLED, async (message) => {
    logger.debug("Background: Getting app enabled state for", message.data);
    return await storageManager.getAppEnabled(message.data);
  });

  onMessage(StorageMessageType.SET_APP_ENABLED, async (message) => {
    const { appId, enabled } = message.data;
    logger.debug("Background: Setting app enabled state", { appId, enabled });
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
          .catch((error) => {
            logger.error("Failed to send message to tab", {
              tabId: tab.id,
              error,
            });
          });
      }
    }
  });

  onMessage(StorageMessageType.GET_RULE_ENABLED, async (message) => {
    const { appId, ruleId } = message.data;
    return await storageManager.getRuleEnabled(appId, ruleId);
  });

  onMessage(StorageMessageType.GET_LOG_LEVEL, async () => {
    return await storageManager.getLogLevel();
  });

  onMessage(StorageMessageType.SET_RULE_ENABLED, async (message) => {
    const { appId, ruleId, enabled } = message.data;

    if (isSessionOnlyRule(appId, ruleId)) {
      return;
    }

    await storageManager.setRuleEnabled(appId, ruleId, enabled);

    await syncDynamicRule(appId, ruleId, enabled);

    // Broadcast the change to all tabs
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        browser.tabs
          .sendMessage(tab.id, {
            type: StorageMessageType.STORAGE_CHANGED,
            data: { appId, ruleId, enabled },
          })
          .catch((error) => {
            logger.error("Failed to send message to tab", {
              tabId: tab.id,
              error,
            });
          });
      }
    }
  });

  onMessage(StorageMessageType.SET_LOG_LEVEL, async (message) => {
    const { level } = message.data;
    await storageManager.setLogLevel(level);
    setGlobalLogLevel(level);

    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (tab.id) {
        browser.tabs
          .sendMessage(tab.id, {
            type: StorageMessageType.STORAGE_CHANGED,
            data: { logLevel: level },
          })
          .catch((error) => {
            logger.error("Failed to send log level message to tab", {
              tabId: tab.id,
              error,
            });
          });
      }
    }
  });

  onMessage(StorageMessageType.GET_APP_CONFIG, async (message) => {
    const config = await storageManager.getAppConfig(message.data);
    if (!config) {
      throw new Error(`App config not found for: ${message.data}`);
    }
    return config;
  });

  onMessage(StorageMessageType.GET_ALL_APP_CONFIGS, async () => {
    logger.debug("Background: Getting all app configs");
    return await storageManager.getAllAppConfigs();
  });

  onMessage(StorageMessageType.INITIALIZE_DEFAULTS, async () => {
    logger.debug("Background: Initializing storage defaults");
    await storageManager.initializeDefaults();
  });

  onMessage(StorageMessageType.EXPORT_COOKIES, async (message) => {
    return await exportCookies(message.data);
  });

  onMessage(StorageMessageType.IMPORT_COOKIES, async (message) => {
    return await importCookies(message.data);
  });

  (browser.action ?? browser.browserAction).onClicked.addListener(
    async (tab) => {
      logger.debug("browser action triggered,", tab);
      if (tab.id) {
        await browser.tabs.sendMessage(tab.id, { type: "MOUNT_UI" });
      }
    },
  );

  browser.runtime.onInstalled.addListener(async (details) => {
    try {
      await storageManager.initializeDefaults();

      // Sync all dynamic DNR rules with stored settings
      await syncAllDynamicRules((appId, ruleId) =>
        storageManager.getRuleEnabled(appId, ruleId),
      );
    } catch (error) {
      logger.error("Background: Failed to initialize storage:", { error });
    }

    if (details.reason === "install") {
      browser.tabs.create({ url: WELCOME_URL });
    } else if (details.reason === "update") {
      logger.info("Previous version:", details.previousVersion);
    } else if (details.reason === "chrome_update") {
      logger.info("Chrome browser updated");
    }
  });

  // Also sync on browser startup (for when extension is already installed)
  browser.runtime.onStartup.addListener(async () => {
    await syncAllDynamicRules((appId, ruleId) =>
      storageManager.getRuleEnabled(appId, ruleId),
    );
  });
});
