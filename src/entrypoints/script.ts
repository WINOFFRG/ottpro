import { findAppByDomain } from "@/lib/apps/registry";
import { fetchApiPolyfill } from "@/lib/fetch-pollyfill";
import type { Middleware } from "@/lib/shared/middleware";

export default defineUnlistedScript(() => {
  try {
    const staticConfig = findAppByDomain(window.location.hostname);
    if (!staticConfig) {
      return;
    }

    // const config = await sendMessage(
    //   StorageMessageType.GET_APP_CONFIG,
    //   staticConfig.id
    // );
    if (!staticConfig.enabled) {
      return;
    }
    // Collect enabled middlewares from rules
    const middlewares: Middleware[] = [];
    for (const rule of staticConfig.rules) {
      if (rule.enabled) {
        console.log(`Script: Rule ${rule.name} is enabled`);
        middlewares.push(rule.middleware);
      }
    }

    if (middlewares.length > 0) {
      console.log(`Script: Applying ${middlewares.length} middlewares`);
      fetchApiPolyfill(middlewares);
    } else {
      console.log("Script: No middlewares to apply");
    }
    console.log("Script: Configuration applied successfully");
  } catch (error) {
    console.error("Script: Error during execution:", error);
  }

  // onMessage(StorageMessageType.STORAGE_CHANGED, () => {
  //   console.log("Script: Storage changed, reloading configuration");
  //   window.location.reload();
  // });
});
