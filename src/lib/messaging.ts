import { defineExtensionMessaging } from "@webext-core/messaging";
import type { AppConfig } from "./shared/types";

export const StorageMessageType = {
  GET_APP_ENABLED: "get-app-enabled",
  SET_APP_ENABLED: "set-app-enabled",
  GET_RULE_ENABLED: "get-rule-enabled",
  SET_RULE_ENABLED: "set-rule-enabled",
  GET_APP_CONFIG: "get-app-config",
  GET_ALL_APP_CONFIGS: "get-all-app-configs",
  INITIALIZE_DEFAULTS: "initialize-defaults",
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
  [StorageMessageType.GET_APP_CONFIG]: (appId: string) => AppConfig;
  [StorageMessageType.GET_ALL_APP_CONFIGS]: () => AppConfig[];
  [StorageMessageType.INITIALIZE_DEFAULTS]: () => void;
  [StorageMessageType.STORAGE_CHANGED]: (data: {
    appId?: string;
    ruleId?: string;
    enabled: boolean;
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
