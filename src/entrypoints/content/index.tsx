import ReactDOM from "react-dom/client";
import React, { useState } from "react";

import "@/assets/global.css";

import type { ContentScriptContext } from "#imports";
import App from "@/components/App";
import { fetchApiPolyfill } from "@/lib/fetch_pollyfill";

export default defineContentScript({
  matches: [
    "*://*.hotstar.com/*",
    "*://*.netflix.com/*",
    "*://*.winoffrg.dev/*",
  ],
  runAt: "document_start",
  world: "MAIN",
  async main() {
    console.log("Content script main() called on:", window.location.href);

    fetchApiPolyfill();
    // patchXMLHttpRequest();

    // const ui = await createUi(ctx);

    // browser.runtime.onMessage.addListener((event) => {
    //   if (event.type === "MOUNT_UI") {
    //     console.log(ui, ui.mounted);

    //     if (!ui.mounted) {
    //       // ui.mount();
    //     } else {
    //       // ui.autoMount();
    //     }
    //   }
    // });

    // // if (import.meta.env.MODE === "development") {
    // document.addEventListener("DOMContentLoaded", () => {
    //   console.log("DOMContentLoaded", ui);
    //   // ui.mount();
    // });
    // // }

    // document.addEventListener("mousedown", (e) => {
    //   if (e.target !== document.getElementsByTagName("ott-pro-ui")?.[0]) {
    //     // ui.shadowHost.remove();
    //   }
    // });
  },
});

function createUi(ctx: ContentScriptContext) {
  let root: ReactDOM.Root | null = null;

  return createShadowRootUi(ctx, {
    name: "ott-pro-ui",
    position: "overlay",
    anchor: "body",
    append: "last",
    onRemove: (root: ReactDOM.Root | undefined) => {
      root?.unmount();
    },
    alignment: "top-right",
    zIndex: 999999,
    isolateEvents: true,
    inheritStyles: false,
    onMount: (uiContainer, shadow, shadowHost) => {
      if (!root) {
        root = ReactDOM.createRoot(uiContainer);
        root.render(<App root={shadowHost} />);
      }

      return root;
    },
  });
}
