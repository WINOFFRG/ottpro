import { appHandlers } from "@/lib/apps/registry";
import { fetchApiPolyfill } from "@/lib/fetch-pollyfill";
import type { Middleware } from "@/lib/shared/middleware";
import type { AppHandler } from "@/lib/shared/types";

function isDomainMatch(currentDomain: string, appDomain: string): boolean {
  return currentDomain.includes(appDomain);
}

function collectMiddlewaresFromApp(app: AppHandler): Middleware[] {
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

function collectAllMiddlewares(): Middleware[] {
  const middlewares: Middleware[] = [];
  const currentDomain = window.location.hostname;

  for (const app of appHandlers) {
    if (!app.enabled) {
      console.log(`⏭️  Skipping disabled app: ${app.name}`);
      continue;
    }

    console.log(`🔍 Processing app: ${app.name}`);

    if (!isDomainMatch(currentDomain, app.domain)) {
      console.log(
        `⏭️  Domain mismatch for ${app.name}: ${currentDomain} doesn't match ${app.domain}`
      );
      continue;
    }

    console.log(
      `✅ Domain match for ${app.name}: ${currentDomain} matches ${app.domain}`
    );

    const appMiddlewares = collectMiddlewaresFromApp(app);
    middlewares.push(...appMiddlewares);
  }

  return middlewares;
}

export default defineUnlistedScript(() => {
  console.log("🚀 Initializing script for:", window.location.href);

  const middlewares = collectAllMiddlewares();
  console.log(`🎯 Total middlewares collected: ${middlewares.length}`);

  if (middlewares.length > 0) {
    fetchApiPolyfill(middlewares);
  } else {
    console.log("⏭️  No middlewares found, skipping fetch polyfill setup");
  }
});
