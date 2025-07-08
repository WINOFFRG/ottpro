import type { Middleware } from "./middleware";

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
  log: (level: keyof LogLevel, message: string, data?: unknown) => void;
}

export interface AppRule {
  name: string;
  enabled: boolean;
  description: string;
  middleware: Middleware;
}

export interface AppConfig {
  id: string;
  name: string;
  domainPattern: RegExp;
  enabled: boolean;
  rules: AppRule[];
}
