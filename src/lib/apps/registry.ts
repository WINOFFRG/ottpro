import type { AppConfig } from "../shared/types";
import { config as hotstarConfig } from "./hotstar/config";
import { config as netflixConfig } from "./netflix/config";

export const appConfigs = [hotstarConfig, netflixConfig];

/**
 * Find the matching app configuration for a given domain
 * @param domain - The domain to match (e.g., "www.hotstar.com", "netflix.com")
 * @returns The matching AppConfig or undefined if no match found
 */
export function findAppByDomain(domain: string): AppConfig | undefined {
  return appConfigs.find(
    (app) => app.enabled && app.domainPattern.test(domain)
  );
}

/**
 * Check if a domain matches any registered app
 * @param domain - The domain to check
 * @returns True if the domain matches any enabled app
 */
export function isDomainSupported(domain: string): boolean {
  return appConfigs.some(
    (app) => app.enabled && app.domainPattern.test(domain)
  );
}

/**
 * Get all supported domains (as regex patterns)
 * @returns Array of regex patterns for all enabled apps
 */
export function getSupportedDomainPatterns(): RegExp[] {
  return appConfigs
    .filter((app) => app.enabled)
    .map((app) => app.domainPattern);
}
