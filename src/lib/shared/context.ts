import type { SharedContext, AppStats, LogLevel } from "./types";

export class ExtensionContext implements SharedContext {
	stats: Map<string, AppStats> = new Map();
	logLevel: keyof LogLevel = "INFO";
	enabledApps: Set<string> = new Set();

	constructor() {
		// Load saved settings
		this.loadSettings();
	}

	updateStats = (appId: string, action: "blocked" | "modified") => {
		const currentStats = this.stats.get(appId) || {
			appId,
			blocked: 0,
			modified: 0,
			total: 0,
		};

		if (action === "blocked") {
			currentStats.blocked++;
		} else if (action === "modified") {
			currentStats.modified++;
		}
		currentStats.total++;

		this.stats.set(appId, currentStats);
		this.saveStats();
	};

	log = (level: keyof LogLevel, message: string, data?: any) => {
		const logLevels: Record<keyof LogLevel, number> = {
			ERROR: 0,
			WARN: 1,
			INFO: 2,
			DEBUG: 3,
		};

		if (logLevels[level] <= logLevels[this.logLevel]) {
			const timestamp = new Date().toISOString();
			const logMessage = `[${timestamp}] [${level}] ${message}`;

			if (level === "ERROR") {
				console.error(logMessage, data);
			} else if (level === "WARN") {
				console.warn(logMessage, data);
			} else if (level === "DEBUG") {
				console.debug(logMessage, data);
			} else {
				console.log(logMessage, data);
			}
		}
	};

	private async loadSettings() {
		try {
			const result = await browser.storage.sync.get([
				"enabledApps",
				"logLevel",
				"stats",
			]);

			if (result.enabledApps) {
				this.enabledApps = new Set(result.enabledApps);
			}

			if (result.logLevel) {
				this.logLevel = result.logLevel;
			}

			if (result.stats) {
				this.stats = new Map(Object.entries(result.stats));
			}
		} catch (error) {
			console.error("Failed to load settings:", error);
		}
	}

	private async saveStats() {
		try {
			const statsObject = Object.fromEntries(this.stats.entries());
			await browser.storage.sync.set({ stats: statsObject });
		} catch (error) {
			console.error("Failed to save stats:", error);
		}
	}

	async saveSettings() {
		try {
			await browser.storage.sync.set({
				enabledApps: Array.from(this.enabledApps),
				logLevel: this.logLevel,
			});
		} catch (error) {
			console.error("Failed to save settings:", error);
		}
	}

	toggleApp(appId: string) {
		if (this.enabledApps.has(appId)) {
			this.enabledApps.delete(appId);
		} else {
			this.enabledApps.add(appId);
		}
		this.saveSettings();
	}

	getAppStats(appId: string): AppStats | undefined {
		return this.stats.get(appId);
	}
}

// Global context instance
export const extensionContext = new ExtensionContext();
