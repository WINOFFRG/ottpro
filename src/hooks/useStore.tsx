import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import { StorageMessageType, sendMessage } from "@/lib/messaging";
import {
  DEFAULT_LOG_LEVEL,
  logger,
  setGlobalLogLevel,
  type LogLevel,
} from "@/lib/logger";
import {
  PRODUCT_INSIGHTS_AVAILABLE,
  setProductInsightsEnabled,
} from "@/lib/posthog";
import {
  getSessionOnlyRuleDefault,
  isSessionOnlyRule,
} from "@/lib/session-rules";
import { OTT_PRO_SESSION_RULE_TOGGLE_EVENT } from "@/lib/shared/constants";
import type { AppConfig } from "@/lib/shared/types";

export interface RootState {
  root: HTMLElement | null;
  currentApp: AppConfig | undefined;
  // Storage-backed app states
  appStates: Map<string, boolean>;
  ruleStates: Map<string, boolean>;
  productInsightsEnabled: boolean;
  logLevel: LogLevel;
}

export interface RootActions {
  toggleApp: (appId: string) => Promise<void>;
  toggleRule: (appId: string, ruleId: string) => Promise<void>;
  toggleProductInsights: () => Promise<void>;
  setLogLevel: (level: LogLevel) => Promise<void>;
  updateProductInsightsFromStorage: (enabled: boolean) => void;
  updateLogLevelFromStorage: (level: LogLevel) => void;
  updateFromStorage: (
    appId: string,
    appEnabled: boolean,
    ruleStates: Map<string, boolean>,
  ) => void;
  initializeFromStorage: () => Promise<void>;
}

export type RootStore = RootState & RootActions;

export const defaultInitState: RootState = {
  root: null,
  currentApp: undefined,
  appStates: new Map(),
  ruleStates: new Map(),
  productInsightsEnabled: PRODUCT_INSIGHTS_AVAILABLE,
  logLevel: DEFAULT_LOG_LEVEL,
};

export const createRootStore = (initState: RootState = defaultInitState) => {
  return createStore<RootStore>()((set, get) => ({
    ...initState,

    toggleApp: async (appId: string) => {
      const { appStates } = get();
      const currentState = appStates.get(appId) ?? true;
      const newState = !currentState;

      await sendMessage(StorageMessageType.SET_APP_ENABLED, {
        appId,
        enabled: newState,
      });

      const newAppStates = new Map(appStates);
      newAppStates.set(appId, newState);
      set({ appStates: newAppStates });
    },

    toggleRule: async (appId: string, ruleId: string) => {
      const { ruleStates } = get();
      const ruleKey = `${appId}:${ruleId}`;
      const currentState =
        ruleStates.get(ruleKey) ??
        getSessionOnlyRuleDefault(appId, ruleId) ??
        true;
      const newState = !currentState;

      if (isSessionOnlyRule(appId, ruleId)) {
        const newRuleStates = new Map(ruleStates);
        newRuleStates.set(ruleKey, newState);
        set({ ruleStates: newRuleStates });

        document.dispatchEvent(
          new CustomEvent(OTT_PRO_SESSION_RULE_TOGGLE_EVENT, {
            detail: { appId, ruleId },
          }),
        );

        return;
      }

      await sendMessage(StorageMessageType.SET_RULE_ENABLED, {
        appId,
        ruleId,
        enabled: newState,
      });

      const newRuleStates = new Map(ruleStates);
      newRuleStates.set(ruleKey, newState);
      set({ ruleStates: newRuleStates });
    },

    toggleProductInsights: async () => {
      if (!PRODUCT_INSIGHTS_AVAILABLE) {
        set({ productInsightsEnabled: false });
        return;
      }

      const { productInsightsEnabled } = get();
      const enabled = !productInsightsEnabled;

      await sendMessage(StorageMessageType.SET_PRODUCT_INSIGHTS_ENABLED, {
        enabled,
      });

      setProductInsightsEnabled(enabled);
      set({ productInsightsEnabled: enabled });
    },

    setLogLevel: async (level: LogLevel) => {
      await sendMessage(StorageMessageType.SET_LOG_LEVEL, { level });
      setGlobalLogLevel(level);
      set({ logLevel: level });
    },

    updateProductInsightsFromStorage: (enabled: boolean) => {
      const nextEnabled = PRODUCT_INSIGHTS_AVAILABLE && enabled;
      setProductInsightsEnabled(nextEnabled);
      set({ productInsightsEnabled: nextEnabled });
    },

    updateLogLevelFromStorage: (level: LogLevel) => {
      setGlobalLogLevel(level);
      set({ logLevel: level });
    },

    updateFromStorage: (
      appId: string,
      appEnabled: boolean,
      ruleStates: Map<string, boolean>,
    ) => {
      const { appStates, currentApp } = get();

      const newAppStates = new Map(appStates);
      newAppStates.set(appId, appEnabled);

      const updatedCurrentApp =
        currentApp?.id === appId
          ? { ...currentApp, enabled: appEnabled }
          : currentApp;

      set({
        appStates: newAppStates,
        ruleStates: new Map(ruleStates),
        currentApp: updatedCurrentApp,
      });
    },

    initializeFromStorage: async () => {
      try {
        const [appConfigs, productInsightsEnabled, logLevel] = await Promise.all([
          sendMessage(StorageMessageType.GET_ALL_APP_CONFIGS),
          sendMessage(StorageMessageType.GET_PRODUCT_INSIGHTS_ENABLED),
          sendMessage(StorageMessageType.GET_LOG_LEVEL),
        ]);

        const newAppStates = new Map<string, boolean>();
        const newRuleStates = new Map<string, boolean>();

        for (const app of appConfigs) {
          newAppStates.set(app.id, app.enabled);

          for (const rule of app.rules) {
            const ruleKey = `${app.id}:${rule.id}`;
            const sessionDefault = getSessionOnlyRuleDefault(app.id, rule.id);
            newRuleStates.set(ruleKey, sessionDefault ?? rule.enabled);
          }
        }

        const insightsEnabled =
          PRODUCT_INSIGHTS_AVAILABLE && productInsightsEnabled;
        setProductInsightsEnabled(insightsEnabled);
        setGlobalLogLevel(logLevel);
        set({
          appStates: newAppStates,
          ruleStates: newRuleStates,
          productInsightsEnabled: insightsEnabled,
          logLevel,
        });
      } catch (error) {
        logger.error("Failed to initialize from storage:", { error });
      }
    },
  }));
};

export type RootStoreApi = ReturnType<typeof createRootStore>;

export const RootStoreContext = createContext<RootStoreApi | undefined>(
  undefined,
);

export interface RootStoreProviderProps {
  children: ReactNode;
  initialState?: RootState;
}

export const RootStoreProvider = ({
  children,
  initialState = defaultInitState,
}: RootStoreProviderProps) => {
  const storeRef = useRef<RootStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createRootStore(initialState);
  }

  useEffect(() => {
    const store = storeRef.current;
    if (!store) {
      return;
    }

    // Initialize from storage via background script
    store.getState().initializeFromStorage();

    // Listen for storage change broadcasts from background script
    const messageListener = (message: {
      type: string;
      data: Record<string, unknown>;
    }) => {
      if (message.type === StorageMessageType.STORAGE_CHANGED) {
        const { ruleStates, appStates } = store.getState();

        if (
          "appId" in message.data &&
          "enabled" in message.data &&
          !("ruleId" in message.data)
        ) {
          // App enabled change
          const appId = message.data.appId as string;
          const enabled = message.data.enabled as boolean;
          logger.debug(
            `🔄 Received app change broadcast: ${appId} = ${enabled}`,
          );
          const appRuleStates = new Map<string, boolean>();
          store.getState().updateFromStorage(appId, enabled, appRuleStates);
        } else if (
          "appId" in message.data &&
          "ruleId" in message.data &&
          "enabled" in message.data
        ) {
          // Rule enabled change
          const appId = message.data.appId as string;
          const ruleId = message.data.ruleId as string;
          const enabled = message.data.enabled as boolean;
          logger.debug(
            `🔄 Received rule change broadcast: ${appId}:${ruleId} = ${enabled}`,
          );
          const newRuleStates = new Map(ruleStates);
          const ruleKey = `${appId}:${ruleId}`;
          newRuleStates.set(ruleKey, enabled);

          const appEnabled = appStates.get(appId) ?? true;
          store.getState().updateFromStorage(appId, appEnabled, newRuleStates);
        } else if ("productInsightsEnabled" in message.data) {
          const enabled = message.data.productInsightsEnabled as boolean;
          store.getState().updateProductInsightsFromStorage(enabled);
        } else if ("logLevel" in message.data) {
          const logLevel = message.data.logLevel as LogLevel;
          store.getState().updateLogLevelFromStorage(logLevel);
        }
      }
    };

    browser.runtime.onMessage.addListener(messageListener);

    const resetSessionOnlyRulesForCurrentApp = () => {
      const { currentApp, ruleStates } = store.getState();
      if (!currentApp) {
        return;
      }

      const sessionRules = currentApp.rules.filter((rule) => rule.sessionOnly);
      if (sessionRules.length === 0) {
        return;
      }

      const newRuleStates = new Map(ruleStates);
      let changed = false;

      for (const rule of sessionRules) {
        const ruleKey = `${currentApp.id}:${rule.id}`;
        const defaultState =
          getSessionOnlyRuleDefault(currentApp.id, rule.id) ?? rule.enabled;
        const currentState = newRuleStates.get(ruleKey) ?? defaultState;

        if (currentState !== defaultState) {
          newRuleStates.set(ruleKey, defaultState);
          changed = true;
        }
      }

      if (changed) {
        store.setState({ ruleStates: newRuleStates });
      }
    };

    let lastRoute = window.location.href;
    const handleRouteChange = () => {
      const currentRoute = window.location.href;
      if (currentRoute === lastRoute) {
        return;
      }
      lastRoute = currentRoute;
      resetSessionOnlyRulesForCurrentApp();
    };

    const routePollId = window.setInterval(handleRouteChange, 400);

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);

    return () => {
      browser.runtime.onMessage.removeListener(messageListener);
      window.clearInterval(routePollId);
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("hashchange", handleRouteChange);
    };
  }, []);

  return (
    <RootStoreContext.Provider value={storeRef.current}>
      {children}
    </RootStoreContext.Provider>
  );
};

export const useRootStore = <T,>(selector: (store: RootStore) => T): T => {
  const store = useContext(RootStoreContext);
  if (!store) {
    throw new Error("Missing RootStoreProvider");
  }
  return useStore(store, selector);
};

export const useAppEnabled = (appId: string): boolean => {
  return useRootStore((state) => state.appStates.get(appId) ?? true);
};

export const useRuleEnabled = (appId: string, ruleId: string): boolean => {
  const ruleKey = `${appId}:${ruleId}`;
  return useRootStore((state) => {
    const storedState = state.ruleStates.get(ruleKey);
    if (storedState !== undefined) {
      return storedState;
    }

    const ruleDefault =
      state.currentApp?.id === appId
        ? state.currentApp.rules.find((rule) => rule.id === ruleId)?.enabled
        : undefined;

    return ruleDefault ?? true;
  });
};

export const useToggleApp = () => {
  return useRootStore((state) => state.toggleApp);
};

export const useToggleRule = () => {
  return useRootStore((state) => state.toggleRule);
};

export const useProductInsightsEnabled = () => {
  return useRootStore((state) => state.productInsightsEnabled);
};

export const useToggleProductInsights = () => {
  return useRootStore((state) => state.toggleProductInsights);
};

export const useLogLevel = () => {
  return useRootStore((state) => state.logLevel);
};

export const useSetLogLevel = () => {
  return useRootStore((state) => state.setLogLevel);
};
