import type { Middleware } from "@/lib/shared/middleware";

export const hotstarHeaderMiddleware: Middleware = async (ctx, next) => {
	const HEADER_NAME = "x-hs-client";
	const PATTERN_TO_REPLACE = /platform:web/g;
	const REPLACEMENT_VALUE = "platform:android";

	if (!ctx.url.includes("hotstar.com")) {
		await next();
		return;
	}

	let headers: Headers | undefined;
	if (ctx.init?.headers instanceof Headers) {
		headers = ctx.init.headers;
	} else if (ctx.init?.headers && typeof ctx.init.headers === "object") {
		headers = new Headers(ctx.init.headers as Record<string, string>);
	}

	if (headers && headers.has(HEADER_NAME)) {
		const originalValue = headers.get(HEADER_NAME) || "";
		const modifiedValue = originalValue.replace(
			PATTERN_TO_REPLACE,
			REPLACEMENT_VALUE
		);
		if (originalValue !== modifiedValue) {
			headers.set(HEADER_NAME, modifiedValue);
			ctx.init = { ...ctx.init, headers };
		}
	}

	await next();
};
