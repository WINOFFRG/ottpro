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
import type { AppConfig } from "@/lib/shared/types";

export interface RootState {
	root: HTMLElement | null;
	currentApp: AppConfig | undefined;
	// Storage-backed app states
	appStates: Map<string, boolean>;
	ruleStates: Map<string, boolean>;
}

export interface RootActions {
	toggleApp: (appId: string) => Promise<void>;
	toggleRule: (appId: string, ruleId: string) => Promise<void>;
	updateFromStorage: (
		appId: string,
		appEnabled: boolean,
		ruleStates: Map<string, boolean>
	) => void;
	initializeFromStorage: () => Promise<void>;
}

export type RootStore = RootState & RootActions;

export const defaultInitState: RootState = {
	root: null,
	currentApp: undefined,
	appStates: new Map(),
	ruleStates: new Map(),
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
			const currentState = ruleStates.get(ruleKey) ?? true;
			const newState = !currentState;

			await sendMessage(StorageMessageType.SET_RULE_ENABLED, {
				appId,
				ruleId,
				enabled: newState,
			});

			const newRuleStates = new Map(ruleStates);
			newRuleStates.set(ruleKey, newState);
			set({ ruleStates: newRuleStates });
		},

		updateFromStorage: (
			appId: string,
			appEnabled: boolean,
			ruleStates: Map<string, boolean>
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
				const appConfigs = await sendMessage(
					StorageMessageType.GET_ALL_APP_CONFIGS
				);

				const newAppStates = new Map<string, boolean>();
				const newRuleStates = new Map<string, boolean>();

				for (const app of appConfigs) {
					newAppStates.set(app.id, app.enabled);

					for (const rule of app.rules) {
						const ruleKey = `${app.id}:${rule.id}`;
						newRuleStates.set(ruleKey, rule.enabled);
					}
				}

				set({ appStates: newAppStates, ruleStates: newRuleStates });
			} catch (error) {
				console.error("Failed to initialize from storage:", error);
			}
		},
	}));
};

export type RootStoreApi = ReturnType<typeof createRootStore>;

export const RootStoreContext = createContext<RootStoreApi | undefined>(
	undefined
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
					console.log(
						`🔄 Received app change broadcast: ${appId} = ${enabled}`
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
					console.log(
						`🔄 Received rule change broadcast: ${appId}:${ruleId} = ${enabled}`
					);
					const newRuleStates = new Map(ruleStates);
					const ruleKey = `${appId}:${ruleId}`;
					newRuleStates.set(ruleKey, enabled);

					const appEnabled = appStates.get(appId) ?? true;
					store.getState().updateFromStorage(appId, appEnabled, newRuleStates);
				}
			}
		};

		browser.runtime.onMessage.addListener(messageListener);

		return () => {
			browser.runtime.onMessage.removeListener(messageListener);
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
	return useRootStore((state) => state.ruleStates.get(ruleKey) ?? true);
};

export const useToggleApp = () => {
	return useRootStore((state) => state.toggleApp);
};

export const useToggleRule = () => {
	return useRootStore((state) => state.toggleRule);
};
