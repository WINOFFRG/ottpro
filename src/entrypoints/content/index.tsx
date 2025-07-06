import ReactDOM from "react-dom/client";
import type { ContentScriptContext } from "#imports";
import App from "@/components/App";

import "@/assets/global.css";

const ModalRootTagName = "ott-pro-ui";

export default defineContentScript({
	matches: [
		"*://*.hotstar.com/*",
		"*://*.netflix.com/*",
		"*://*.winoffrg.dev/*",
	],
	runAt: "document_start",
	cssInjectionMode: "ui",
	async main(ctx) {
		const isDev = import.meta.env.MODE === "development";

		await injectScript("/script.js", {
			keepInDom: isDev,
		});

		const ui = await createUi(ctx);

		browser.runtime.onMessage.addListener((event) => {
			if (event.type === "MOUNT_UI") {
				if (ui.mounted) {
					ui.autoMount();
				} else {
					ui.mount();
				}
			}
		});

		// if (isDev) {
		document.addEventListener("DOMContentLoaded", () => {
			ui.mount();
		});
		// }

		document.addEventListener("mousedown", (e) => {
			if (e.target !== document.getElementsByTagName(ModalRootTagName)?.[0]) {
				ui.shadowHost.remove();
			}
		});
	},
});

function createUi(ctx: ContentScriptContext) {
	let root: ReactDOM.Root | null = null;

	return createShadowRootUi(ctx, {
		name: ModalRootTagName,
		position: "overlay",
		anchor: "body",
		append: "last",
		onRemove: (rootElement: ReactDOM.Root | undefined) => {
			rootElement?.unmount();
		},
		alignment: "top-right",
		zIndex: 999_999,
		isolateEvents: true,
		inheritStyles: false,
		onMount: (uiContainer, _, shadowHost) => {
			if (!root) {
				root = ReactDOM.createRoot(uiContainer);
				root.render(<App root={shadowHost} />);
			}

			return root;
		},
	});
}
