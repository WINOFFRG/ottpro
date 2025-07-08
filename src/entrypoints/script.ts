import { fetchApiPolyfill } from "@/lib/fetch-pollyfill";
import type { Middleware } from "@/lib/shared/middleware";
import type { AppConfig } from "@/lib/shared/types";
import { appStorage } from "@/lib/storage";

function isDomainMatch(currentDomain: string, domainPattern: RegExp): boolean {
  return domainPattern.test(currentDomain);
}

function collectMiddlewaresFromApp(app: AppConfig): Middleware[] {
  const middlewares: Middleware[] = [];

  if (!app.rules || app.rules.length === 0) {
    console.log(`⚠️  No rules defined for app: ${app.name}`);
    return middlewares;
  }

  for (const rule of app.rules) {
    if (rule.enabled && rule.middleware) {
      console.log(`📝 Adding middleware: ${rule.name}`);
      middlewares.push(rule.middleware);
    } else {
      console.log(`⏭️  Skipping disabled rule: ${rule.name}`);
    }
  }

  return middlewares;
}

async function collectAllMiddlewares(): Promise<Middleware[]> {
  const middlewares: Middleware[] = [];
  const currentDomain = window.location.hostname;

  // Get storage-backed app configs
  const storageAppConfigs = await appStorage.getAllAppConfigs();

  for (const app of storageAppConfigs) {
    if (!app.enabled) {
      console.log(`⏭️  Skipping disabled app: ${app.name}`);
      continue;
    }

    if (!isDomainMatch(currentDomain, app.domainPattern)) {
      console.log(
        `⏭️  Domain mismatch for ${app.name}: ${currentDomain} doesn't match ${app.domainPattern}`
      );
      continue;
    }

    console.log(
      `✅ Domain match for ${app.name}: ${currentDomain} matches ${app.domainPattern}`
    );

    const appMiddlewares = collectMiddlewaresFromApp(app);
    middlewares.push(...appMiddlewares);
  }

  return middlewares;
}

async function initializeExtension() {
  console.log("🚀 Initializing extension...");

  // Initialize storage defaults on first run
  // await appStorage.initializeDefaults();

  // Collect and apply middlewares based on current storage state
  const middlewares = await collectAllMiddlewares();

  if (middlewares.length > 0) {
    console.log(`🔧 Applying ${middlewares.length} middlewares`);
    fetchApiPolyfill(middlewares);
  } else {
    console.log("⚠️  No middlewares to apply for current domain and settings");
  }

  console.log("✅ Extension initialization complete");
}

export default defineUnlistedScript(() => {
  console.log("🚀 Initializing script for:", window.location.href);

  // Initialize when script loads - no need for storage watchers since app is static
  // Real-time updates are handled in the UI layer
  initializeExtension().catch((error) => {
    console.error("❌ Failed to initialize extension:", error);
  });
});
