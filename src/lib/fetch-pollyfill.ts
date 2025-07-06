import {
	composeMiddlewares,
	type Middleware,
	type MiddlewareContext,
} from "@/lib/shared/middleware";

let isPolyfillApplied = false;

export function fetchApiPolyfill(middlewares: Middleware[] = []) {
	if (isPolyfillApplied) {
		console.log("Fetch polyfill already applied, skipping");
		return;
	}

	if (middlewares.length === 0) {
		console.log("No middlewares provided, skipping fetch polyfill");
		return;
	}

	console.log("Applying fetch polyfill on:", window.location.href);
	console.log("Middlewares count:", middlewares.length);

	const runMiddlewares = composeMiddlewares(middlewares);

	const originalFetch = window.fetch;
	window.fetch = async (
		resource: RequestInfo | URL,
		init?: RequestInit
	): Promise<Response> => {
		const url =
			resource instanceof Request ? resource.url : resource.toString();

		console.log("🔍 Fetch intercepted:", url);

		if (url.startsWith("chrome-extension://")) {
			console.log("⏭️  Skipping extension URL:", url);
			return originalFetch.call(window, resource, init);
		}

		// Skip processing for data URLs, blob URLs, etc.
		if (url.startsWith("data:") || url.startsWith("blob:")) {
			console.log("⏭️  Skipping data/blob URL:", url);
			return originalFetch.call(window, resource, init);
		}

		console.log("🎯 Processing fetch for:", url);

		const ctx: MiddlewareContext = {
			request: resource,
			init: init ? { ...init } : undefined,
			url,
			handled: false,
			setHandled() {
				this.handled = true;
			},
			setResponse(resp: Response) {
				this.response = resp;
			},
			response: undefined,
		};

		console.log("🔧 Running middlewares for:", url);
		await runMiddlewares(ctx);

		if (ctx.handled && ctx.response) {
			console.log("✅ Middleware handled:", url);
			return ctx.response;
		}

		console.log("➡️  Passing through to original fetch:", url);
		return originalFetch.call(window, resource, ctx.init);
	};

	isPolyfillApplied = true;
	console.log("✅ Fetch polyfill applied successfully");
}
