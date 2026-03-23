import tailwindcss from "@tailwindcss/vite";
import Obfusticator from "rollup-plugin-obfuscator";
import { defineConfig } from "wxt";
import packageJson from "./package.json" with { type: "json" };

// See https://wxt.dev/api/config.html
const posthogBuildEnabled = process.env.VITE_ENABLE_POSTHOG === "true";
const toWorkspacePath = (relativePath: string) =>
	new URL(relativePath, import.meta.url).pathname;

export default defineConfig({
	srcDir: "src",
	manifestVersion: 3,
	manifest: {
		action: {},
		version: packageJson.version,
		name: packageJson.name,
		description: packageJson.description,
		host_permissions: [
			"*://*.hotstar.com/*",
			"*://*.akamaized.net/*",
			"*://analytics.google.com/*",
			"*://www.googletagmanager.com/*",
			"*://connect.facebook.net/*",
			"*://static.ads-twitter.com/*",
			"*://bat.bing.com/*",
			"*://a.quora.com/*",
			"*://t.co/*",
			"*://www.google-analytics.com/*",
			"*://*.doubleclick.net/*",
			"*://*.ingest.sentry.io/*",
			"*://q.quora.com/*",
			"*://cdn.growthbook.io/*",
			"*://*.netflix.com/*",
			"*://*.winoffrg.dev/*",
			"*://*.primevideo.com/*",
			"*://*.unagi-eu.amazon.com/*",
			"*://*.video.a2z.com/*",
			"*://m.media-amazon.com/images/*",
			"*://*.i.posthog.com/*",
		],
		web_accessible_resources: [
			{
				resources: ["script.js"],
				matches: [
					"*://*.hotstar.com/*",
					"*://*.netflix.com/*",
					"*://*.winoffrg.dev/*",
					"*://*.primevideo.com/*",
					"*://*.i.posthog.com/*",
				],
			},
			{
				resources: ["primevideo-bootstrap.js"],
				matches: ["*://*.primevideo.com/*"],
			},
		],
		permissions: [
			"storage",
			"declarativeNetRequest",
			"cookies",
		],
		browser_specific_settings: {
			gecko: {
				id: "ottpro@winoffrg.dev",
				// @ts-ignore
				data_collection_permissions: {
					required: ["none"],
					optional: ["technicalAndInteraction"]
				}
			},
		},
	},
	webExt: {
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
	modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
	vite: (config) => ({
		plugins: [
			tailwindcss(),
		],
		resolve: {
			alias: [
				{
					find: "@/lib/posthog-impl",
					replacement: toWorkspacePath(
						posthogBuildEnabled
							? "src/lib/posthog-enabled.ts"
							: "src/lib/posthog-disabled.ts",
					),
				},
				{
					find: "@/lib/posthog-provider-impl",
					replacement: toWorkspacePath(
						posthogBuildEnabled
							? "src/lib/posthog-provider-enabled.tsx"
							: "src/lib/posthog-provider-disabled.tsx",
					),
				},
			],
		},
		build: {
			sourcemap: true
		},
	}),
	publicDir: "src/public",
});
