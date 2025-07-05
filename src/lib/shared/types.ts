import { Middleware } from "./middleware";

export interface AppStats {
  appId: string;
  blocked: number;
  modified: number;
  total: number;
}

export interface LogLevel {
  ERROR: "error";
  WARN: "warn";
  INFO: "info";
  DEBUG: "debug";
}

export interface SharedContext {
  stats: Map<string, AppStats>;
  logLevel: keyof LogLevel;
  enabledApps: Set<string>;
  updateStats: (appId: string, action: "blocked" | "modified") => void;
  log: (level: keyof LogLevel, message: string, data?: any) => void;
}

export interface AppRule {
  name: string;
  enabled: boolean;
  description: string;
}

export interface AppHandler {
  id: string;
  name: string;
  domain: string;
  enabled: boolean;
  rules: AppRule[];
  setupBackgroundRules?: () => Promise<Browser.declarativeNetRequest.Rule[]>; // Returns declarative net request rules
  handleBackgroundRequest?: (details: any) => boolean | void; // Handle request monitoring, return true if handled
  middlewares: Middleware[];
}
