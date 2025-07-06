import tailwindcss from "@tailwindcss/vite";
import Obfusticator from "rollup-plugin-obfuscator";
import { defineConfig } from "wxt";
import packageJson from "./package.json" with { type: "json" };

// See https://wxt.dev/api/config.html
export default defineConfig({
	outDir: "dist",
	srcDir: "src",
	manifestVersion: 3,
	manifest: {
		action: {},
		version: packageJson.version,
		name: "Hotstar WiWiWi",
		description: "Patches hotstar to use with freedom",
		host_permissions: [
			"*://*.hotstar.com/*",
			"*://*.hesads.akamaized.net/*",
			"*://*.bifrost-api.hotstar.com/*",
			"*://service.hotstar.com/*",
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
			"scripting",
			"declarativeNetRequest",
			"webRequest",
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
		startUrls: ["https://www.netflix.com/"],
	},
	dev: {
		reloadCommand: "Ctrl+Shift+X",
	},
	modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
	vite: (config) => ({
		plugins: [config.command === "serve" ? [] : Obfusticator(), tailwindcss()],
		build: {
			sourcemap: true,
		},
	}),
	zip: {
		artifactTemplate: "{{name}}-{{browser}}-{{version}}.zip",
	},
	autoIcons: {
		grayscaleOnDevelopment: false,
	},
});
