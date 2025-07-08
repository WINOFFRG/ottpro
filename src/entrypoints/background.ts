export default defineBackground(() => {
  (browser.action ?? browser.browserAction).onClicked.addListener(
    async (tab) => {
      console.log("browser action triggered,", tab);
      if (tab.id) {
        await browser.tabs.sendMessage(tab.id, { type: "MOUNT_UI" });
      }
    }
  );
});
