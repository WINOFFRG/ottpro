export default defineContentScript({
  matches: ["*://*.primevideo.com/*"],
  runAt: "document_start",
  main() {
    const isDev = import.meta.env.MODE === "development";
    const bootstrapPath =
      "/primevideo-bootstrap.js" as Parameters<typeof injectScript>[0];

    void injectScript(bootstrapPath, {
      keepInDom: isDev,
    });
  },
});
