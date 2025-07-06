import { appHandlers } from "@/lib/apps/registry";
import { extensionContext } from "@/lib/shared/context";

export default defineBackground(async () => {
  extensionContext.log("INFO", "Background script initialized", {
    id: browser.runtime.id,
  });

  (browser.action ?? browser.browserAction).onClicked.addListener(
    async (tab) => {
      console.log("browser action triggered,", tab);
      if (tab.id) {
        await browser.tabs.sendMessage(tab.id, { type: "MOUNT_UI" });
      }
    }
  );
  // Set up declarative net request rules (MV3 only)
  await setupDeclarativeNetRequest();

  // Set up webRequest monitoring for statistics
  setupWebRequestMonitoring();
});

async function setupDeclarativeNetRequest() {
  try {
    const allRules: Browser.declarativeNetRequest.Rule[] = [];

    // Update dynamic rules
    await browser.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: Array.from({ length: 50 }, (_, i) => i + 1), // Remove existing rules
      addRules: allRules,
    });

    extensionContext.log("INFO", "Declarative net request rules installed", {
      count: allRules.length,
    });
  } catch (error) {
    extensionContext.log("ERROR", "Failed to register blocking rules", error);
  }
}

function setupWebRequestMonitoring() {
  // Monitor requests for statistics
  const handleRequest = (details: any) => {
    for (const handler of appHandlers) {
      if (handler.handleBackgroundRequest) {
        const result = handler.handleBackgroundRequest(details);
        if (result) {
          extensionContext.updateStats(handler.id, "blocked");
          extensionContext.log("DEBUG", `Request handled by ${handler.name}`, {
            url: details.url,
          });
        }
      }
    }
    // Always return non-blocking for MV3
    return {};
  };

  // Get all URL patterns for monitoring
  const urlPatterns: string[] = [];
  for (const handler of appHandlers) {
    // Add basic patterns for each domain
    urlPatterns.push(`*://*.${handler.domain}/*`);
  }

  if (urlPatterns.length > 0) {
    browser.webRequest.onBeforeRequest.addListener(handleRequest, {
      urls: urlPatterns,
    });
  }
}
