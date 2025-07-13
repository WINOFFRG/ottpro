import tailwindcss from "@tailwindcss/vite";
import Obfusticator from "rollup-plugin-obfuscator";
import { defineConfig } from "wxt";
import packageJson from "./package.json" with { type: "json" };

// See https://wxt.dev/api/config.html
export default defineConfig({
	srcDir: "src",
	manifestVersion: 3,
	manifest: {
		action: {},
		author: {
			email: "rohangupta1528@gmail.com",
		},
		version: packageJson.version,
		name: packageJson.name,
		description: packageJson.description,
		host_permissions: [
			"*://*.hotstar.com/*",
			"*://*.akamaized.net/*",
			"*://*.netflix.com/*",
			"*://*.winoffrg.dev/*",
		],
		web_accessible_resources: [
			{
				resources: ["script.js"],
				matches: [
					"*://*.hotstar.com/*",
					"*://*.netflix.com/*",
					"*://*.winoffrg.dev/*",
				],
			},
		],
		permissions: [
			"storage",
		],
	},
	webExt: {
		chromiumArgs: [
			"--auto-open-devtools-for-tabs",
			"--user-data-dir=./.wxt/chrome-data",
			"--start-maximized",
		],
		keepProfileChanges: true,
		startUrls: ["https://winoffrg.dev/"],
	},
	dev: {
		reloadCommand: "Ctrl+Shift+X",
	},
	modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
	vite: (config) => ({
		plugins: [
			config.command === "serve" ? [] : Obfusticator(),
			tailwindcss(),
		],
		build: {
			sourcemap: config.command === "serve",
		},
	}),
	publicDir: "src/public",
});
