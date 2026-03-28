import { defineExtensionMessaging } from "@webext-core/messaging";
import type { LogLevel } from "./logger";
import type { AppConfig } from "./shared/types";
import type {
  ExportCookiesRequest,
  ExportCookiesResponse,
  ImportCookiesRequest,
  ImportCookiesResponse,
} from "./cookie-transfer";

export const StorageMessageType = {
  GET_APP_ENABLED: "get-app-enabled",
  SET_APP_ENABLED: "set-app-enabled",
  GET_RULE_ENABLED: "get-rule-enabled",
  SET_RULE_ENABLED: "set-rule-enabled",
  GET_PRODUCT_INSIGHTS_ENABLED: "get-product-insights-enabled",
  SET_PRODUCT_INSIGHTS_ENABLED: "set-product-insights-enabled",
  GET_LOG_LEVEL: "get-log-level",
  SET_LOG_LEVEL: "set-log-level",
  GET_APP_CONFIG: "get-app-config",
  GET_ALL_APP_CONFIGS: "get-all-app-configs",
  INITIALIZE_DEFAULTS: "initialize-defaults",
  EXPORT_COOKIES: "export-cookies",
  IMPORT_COOKIES: "import-cookies",
  STORAGE_CHANGED: "storage-changed",
  ON_APP_ENABLED_CHANGED: "on-app-enabled-changed",
  ON_RULE_ENABLED_CHANGED: "on-rule-enabled-changed",
} as const;

interface ProtocolMap {
  [StorageMessageType.GET_APP_ENABLED]: (appId: string) => boolean;
  [StorageMessageType.SET_APP_ENABLED]: (data: {
    appId: string;
    enabled: boolean;
  }) => void;
  [StorageMessageType.GET_RULE_ENABLED]: (data: {
    appId: string;
    ruleId: string;
  }) => boolean;
  [StorageMessageType.SET_RULE_ENABLED]: (data: {
    appId: string;
    ruleId: string;
    enabled: boolean;
  }) => void;
  [StorageMessageType.GET_PRODUCT_INSIGHTS_ENABLED]: () => boolean;
  [StorageMessageType.SET_PRODUCT_INSIGHTS_ENABLED]: (data: {
    enabled: boolean;
  }) => void;
  [StorageMessageType.GET_LOG_LEVEL]: () => LogLevel;
  [StorageMessageType.SET_LOG_LEVEL]: (data: {
    level: LogLevel;
  }) => void;
  [StorageMessageType.GET_APP_CONFIG]: (appId: string) => AppConfig;
  [StorageMessageType.GET_ALL_APP_CONFIGS]: () => AppConfig[];
  [StorageMessageType.INITIALIZE_DEFAULTS]: () => void;
  [StorageMessageType.EXPORT_COOKIES]: (
    data: ExportCookiesRequest,
  ) => ExportCookiesResponse;
  [StorageMessageType.IMPORT_COOKIES]: (
    data: ImportCookiesRequest,
  ) => ImportCookiesResponse;
  [StorageMessageType.STORAGE_CHANGED]: (data: {
    appId?: string;
    ruleId?: string;
    productInsightsEnabled?: boolean;
    logLevel?: LogLevel;
    enabled?: boolean;
  }) => void;
  [StorageMessageType.ON_APP_ENABLED_CHANGED]: (data: {
    appId: string;
    enabled: boolean;
  }) => void;
  [StorageMessageType.ON_RULE_ENABLED_CHANGED]: (data: {
    appId: string;
    ruleId: string;
    enabled: boolean;
  }) => void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
