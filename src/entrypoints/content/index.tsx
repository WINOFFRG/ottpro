import ReactDOM from "react-dom/client";
import type { ContentScriptContext } from "#imports";
import App from "@/components/App";
import { PostHogProvider } from "posthog-js/react";
import {
  initPostHog,
  POSTHOG_API_KEY,
  posthogOptions,
  setProductInsightsEnabled,
} from "@/lib/posthog";

import "@/assets/global.css";
import { StorageMessageType, sendMessage } from "@/lib/messaging";

import {
  OTT_PRO_APP_ENABLED_KEY,
  OTT_PRO_ENABLED_RULES_KEY,
} from "@/lib/shared/constants";

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
      document.documentElement.dataset[OTT_PRO_ENABLED_RULES_KEY] =
        JSON.stringify(enabledRules);
      document.documentElement.dataset[OTT_PRO_APP_ENABLED_KEY] = String(
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
  const [allAppConfigs, productInsightsEnabled] = await Promise.all([
    sendMessage(StorageMessageType.GET_ALL_APP_CONFIGS),
    sendMessage(StorageMessageType.GET_PRODUCT_INSIGHTS_ENABLED),
  ]);
  setProductInsightsEnabled(productInsightsEnabled);
  if (productInsightsEnabled) {
    initPostHog();
  }
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
        if (productInsightsEnabled) {
          root.render(
            <PostHogProvider apiKey={POSTHOG_API_KEY} options={posthogOptions}>
              <App app={app} root={shadowHost} />
            </PostHogProvider>,
          );
        } else {
          root.render(<App app={app} root={shadowHost} />);
        }
      }

      return root;
    },
  });
}
