import type { LogLevel } from "@/lib/logger";
import type { Middleware } from "@/lib/shared/middleware";

export interface AppStats {
  appId: string;
  blocked: number;
  modified: number;
  total: number;
}

export interface SharedContext {
  stats: Map<string, AppStats>;
  logLevel: keyof LogLevel;
  enabledApps: Set<string>;
  updateStats: (appId: string, action: "blocked" | "modified") => void;
  log: (level: keyof LogLevel, message: string, data?: unknown) => void;
}

export interface AppRule {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  middleware: Middleware;
}

export interface AppConfig {
  id: string;
  name: string;
  domainPattern: string;
  enabled: boolean;
  rules: AppRule[];
}
