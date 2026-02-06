import type { AppConfig } from "../shared/types";
import { config as netflixConfig } from "./netflix/config";
import { config as primeVideoConfig } from "./primevideo/config";

export const appConfigs = [netflixConfig, primeVideoConfig];

export function findAppByDomain(domain: string): AppConfig | undefined {
  return appConfigs.find(
    (app) => app.enabled && new RegExp(app.domainPattern).test(domain),
  );
}
