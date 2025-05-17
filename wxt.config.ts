import { resolve } from "node:path";
import Obfusticator from "rollup-plugin-obfuscator";
import { defineConfig } from "wxt";
import packageJson from "./package.json";

// See https://wxt.dev/api/config.html
export default defineConfig({
	outDir: "dist",
	manifestVersion: 3,
	manifest: {
		version: packageJson.version,
		name: "Hotstar WiWiWi",
		description: "Patches hotstar to use with freedom",
		host_permissions: ["*://*.hotstar.com/*"],
		permissions: ["scripting"],
		content_scripts: [
			{
				matches: ["*://*.hotstar.com/*"],
				js: ["content-scripts/content.js"],
				world: "MAIN",
				run_at: "document_start",
			},
		],
	},
	runner: {
		binaries: {
			chrome: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
		},
		startUrls: ["https://www.hotstar.com"],
		chromiumArgs: [
			"--auto-open-devtools-for-tabs",
			"--user-data-dir=./.wxt/chrome-data",
			"--start-maximized",
		],
		keepProfileChanges: true,
	},
	dev: {
		reloadCommand: "Ctrl+Shift+X",
	},
	vite: ({ command }) => ({
		plugins: [command === "serve" ? [] : Obfusticator()],
		build: {
			sourcemap: true,
		},
	}),
});
