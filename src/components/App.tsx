import { useEffect } from "react";
import type { AppConfig } from "@/lib/shared/types";
import { setCurrentAppContext } from "@/lib/posthog";
import { RootStoreProvider, useRootStore } from "../hooks/useStore";
import { OTTModal } from "./OTTModal";

function AppContent() {
	const initializeFromStorage = useRootStore(
		(state) => state.initializeFromStorage
	);
	const currentApp = useRootStore((state) => state.currentApp);

	useEffect(() => {
		initializeFromStorage();
	}, []);

	useEffect(() => {
		setCurrentAppContext(
			currentApp
				? {
						id: currentApp.id,
						name: currentApp.name,
					}
				: undefined
		);
	}, [currentApp?.id, currentApp?.name]);

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
				productInsightsEnabled: true,
			}}
		>
			<AppContent />
		</RootStoreProvider>
	);
}

export default App;
