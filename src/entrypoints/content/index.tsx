import ReactDOM from "react-dom/client";
import type { ContentScriptContext } from "#imports";
import App from "@/components/App";

import "@/assets/global.css";
import { StorageMessageType, sendMessage } from "@/lib/messaging";

const ModalRootTagName = "ott-pro-ui";

export default defineContentScript({
  matches: [
    "*://*.hotstar.com/*",
    "*://*.netflix.com/*",
    "*://*.winoffrg.dev/*",
    "*://*.primevideo.com/*",
  ],
  runAt: "document_start",
  cssInjectionMode: "ui",
  async main(ctx) {
    const isDev = import.meta.env.MODE === "development";

    const currentDomain = window.location.hostname;
    const allAppConfigs = await sendMessage(
      StorageMessageType.GET_ALL_APP_CONFIGS,
    );
    const currentApp = allAppConfigs.find((config) =>
      new RegExp(config.domainPattern).test(currentDomain),
    );

    if (currentApp) {
      const enabledRules = currentApp.rules
        .filter((rule) => rule.enabled)
        .map((rule) => rule.id);
      document.documentElement.dataset.ottProEnabledRules =
        JSON.stringify(enabledRules);
      document.documentElement.dataset.ottProAppEnabled = String(
        currentApp.enabled,
      );
    }

    await injectScript("/script.js", {
      keepInDom: isDev,
    });

    const ui = await createUi(ctx);

    browser.runtime.onMessage.addListener((event) => {
      if (event.type === "MOUNT_UI") {
        ui.mount();
      }

      if (
        event.type === StorageMessageType.STORAGE_CHANGED &&
        event.data?.ruleId
      ) {
        window.location.reload();
      }
    });

    if (isDev) {
      document.addEventListener("DOMContentLoaded", () => {
        ui.mount();
      });
    }

    document.addEventListener("mousedown", (e) => {
      if (e.target !== document.getElementsByTagName(ModalRootTagName)?.[0]) {
        ui.shadowHost.remove();
      }
    });
  },
});

async function createUi(ctx: ContentScriptContext) {
  let root: ReactDOM.Root | null = null;

  const currentDomain = window.location.hostname;
  const allAppConfigs = await sendMessage(
    StorageMessageType.GET_ALL_APP_CONFIGS,
  );
  const app = allAppConfigs.find((config) =>
    new RegExp(config.domainPattern).test(currentDomain),
  );

  return createShadowRootUi(ctx, {
    name: ModalRootTagName,
    position: "overlay",
    anchor: "body",
    append: "before",
    onRemove: (rootElement: ReactDOM.Root | undefined) => {
      rootElement?.unmount();
    },
    alignment: "top-right",
    zIndex: 999_999,
    isolateEvents: true,
    inheritStyles: true,
    onMount: (uiContainer, _, shadowHost) => {
      if (!root) {
        root = ReactDOM.createRoot(uiContainer);
        root.render(<App app={app} root={shadowHost} />);
      }

      return root;
    },
  });
}
