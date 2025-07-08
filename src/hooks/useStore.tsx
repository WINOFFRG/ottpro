import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
} from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import type { AppConfig } from "@/lib/shared/types";
import { appStorage, setAppEnabled, setRuleEnabled } from "@/lib/storage";

export interface RootState {
	root: HTMLElement | null;
	currentApp: AppConfig | undefined;
	// Storage-backed app states
	appStates: Map<string, boolean>;
	ruleStates: Map<string, boolean>;
}

export interface RootActions {
	toggleApp: (appId: string) => Promise<void>;
	toggleRule: (appId: string, ruleName: string) => Promise<void>;
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

			// Update storage
			await setAppEnabled(appId, newState);

			// Update local state
			const newAppStates = new Map(appStates);
			newAppStates.set(appId, newState);
			set({ appStates: newAppStates });
		},

		toggleRule: async (appId: string, ruleName: string) => {
			const { ruleStates } = get();
			const ruleKey = `${appId}:${ruleName}`;
			const currentState = ruleStates.get(ruleKey) ?? true;
			const newState = !currentState;

			await setRuleEnabled(appId, ruleName, newState);

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
				const appConfigs = await appStorage.getAllAppConfigs();

				const newAppStates = new Map<string, boolean>();
				const newRuleStates = new Map<string, boolean>();

				for (const app of appConfigs) {
					newAppStates.set(app.id, app.enabled);

					for (const rule of app.rules) {
						const ruleKey = `${app.id}:${rule.name}`;
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

	// Set up storage watchers and initialization for the current app only
	useEffect(() => {
		const store = storeRef.current;
		if (!store) {
			return;
		}

		// Initialize from storage
		store.getState().initializeFromStorage();

		// Set up watchers only for the current app (since app never changes in content script)
		const { currentApp } = store.getState();
		if (currentApp) {
			console.log(`📡 Setting up storage watchers for app: ${currentApp.name}`);

			// Watch app enabled state
			const appUnwatch = appStorage.watchAppEnabled(
				currentApp.id,
				(enabled) => {
					console.log(
						`🔄 App ${currentApp.name} enabled state changed to:`,
						enabled
					);

					// Update rule states from storage
					const ruleStates = new Map<string, boolean>();
					Promise.all(
						currentApp.rules.map(async (rule) => {
							const ruleKey = `${currentApp.id}:${rule.name}`;
							const ruleEnabled = await appStorage.getRuleEnabled(
								currentApp.id,
								rule.name
							);
							ruleStates.set(ruleKey, ruleEnabled);
						})
					).then(() => {
						store
							.getState()
							.updateFromStorage(currentApp.id, enabled, ruleStates);
					});
				}
			);

			// Watch individual rule states
			const ruleUnwatchers = currentApp.rules.map((rule) =>
				appStorage.watchRuleEnabled(currentApp.id, rule.name, (enabled) => {
					console.log(
						`🔄 Rule ${rule.name} enabled state changed to:`,
						enabled
					);
					const { ruleStates } = store.getState();
					const newRuleStates = new Map(ruleStates);
					const ruleKey = `${currentApp.id}:${rule.name}`;
					newRuleStates.set(ruleKey, enabled);

					// Get current app state
					const appEnabled =
						store.getState().appStates.get(currentApp.id) ?? true;
					store
						.getState()
						.updateFromStorage(currentApp.id, appEnabled, newRuleStates);
				})
			);

			return () => {
				appUnwatch();
				for (const unwatch of ruleUnwatchers) {
					unwatch();
				}
			};
		}
	}, []); // Empty dependency array since currentApp never changes

	return (
		<RootStoreContext.Provider value={storeRef.current}>
			{children}
		</RootStoreContext.Provider>
	);
};

export const useRootStore = <T,>(selector: (store: RootStore) => T): T => {
	const rootStoreContext = useContext(RootStoreContext);

	if (!rootStoreContext) {
		throw new Error("useRootStore must be used within RootStoreProvider");
	}

	return useStore(rootStoreContext, selector);
};

// Utility hooks for easier access to storage-backed state
export const useAppEnabled = (appId: string): boolean => {
	return useRootStore((state) => state.appStates.get(appId) ?? true);
};

export const useRuleEnabled = (appId: string, ruleName: string): boolean => {
	return useRootStore((state) => {
		const ruleKey = `${appId}:${ruleName}`;
		return state.ruleStates.get(ruleKey) ?? true;
	});
};

export const useToggleApp = () => {
	return useRootStore((state) => state.toggleApp);
};

export const useToggleRule = () => {
	return useRootStore((state) => state.toggleRule);
};
