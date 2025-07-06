import type { AppHandler } from "@/lib/shared/types";

export const netflixHandler: AppHandler = {
	id: "netflix",
	name: "Netflix",
	domain: "netflix.com",
	enabled: true,
	rules: [
		{
			enabled: true,
			name: "Block Interstitial Ads",
			description: "Block interstitial ads",
		},
	],
	middlewares: [],
};
