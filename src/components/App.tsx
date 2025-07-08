import { useEffect } from "react";
import type { AppConfig } from "@/lib/shared/types";
import { RootStoreProvider, useRootStore } from "../hooks/useStore";
import { OTTModal } from "./OTTModal";

function AppContent() {
	const initializeFromStorage = useRootStore(
		(state) => state.initializeFromStorage
	);

	useEffect(() => {
		// Initialize from storage on mount
		initializeFromStorage();
	}, [initializeFromStorage]);

	return <OTTModal />;
}

function App({ root, app }: { root: HTMLElement; app: AppConfig | undefined }) {
	return (
		<RootStoreProvider
			initialState={{
				root,
				currentApp: app,
				appStates: new Map(),
				ruleStates: new Map(),
			}}
		>
			<AppContent />
		</RootStoreProvider>
	);
}

export default App;
