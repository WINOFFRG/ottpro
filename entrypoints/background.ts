export default defineBackground(() => {
	console.log("Background script initialized", { id: browser.runtime.id });

	// The header modification is now handled entirely by the content script
	// This keeps the background script minimal
});
