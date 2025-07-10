import type { AppConfig } from "../shared/types";
import { config as netflixConfig } from "./netflix/config";

export const appConfigs = [netflixConfig];

export function findAppByDomain(domain: string): AppConfig | undefined {
  return appConfigs.find(
    (app) => app.enabled && new RegExp(app.domainPattern).test(domain)
  );
}
