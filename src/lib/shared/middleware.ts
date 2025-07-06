export interface MiddlewareContext {
	request: RequestInfo | URL;
	init?: RequestInit;
	url: string;
	handled: boolean;
	setHandled: () => void;
	setResponse: (response: Response) => void;
	response?: Response;
}

export type Middleware = (
	ctx: MiddlewareContext,
	next: () => Promise<void>
) => Promise<void>;

export function composeMiddlewares(
	middlewares: Middleware[]
): (ctx: MiddlewareContext) => Promise<void> {
	return async function composed(ctx: MiddlewareContext) {
		let index = -1;
		async function dispatch(i: number): Promise<void> {
			if (i <= index) {
				throw new Error("next() called multiple times");
			}
			index = i;
			const fn = middlewares[i];
			if (fn) {
				await fn(ctx, () => dispatch(i + 1));
			}
		}
		await dispatch(0);
	};
}

/**
 * Creates a middleware that blocks requests matching any of the provided regex patterns
 * @param patterns Array of regex patterns to match against the URL
 * @param description Optional description for logging purposes
 * @returns Middleware function that blocks matching requests
 */
export function createBlockingMiddleware(
	patterns: RegExp[],
	description?: string
): Middleware {
	return async (ctx, next) => {
		const isBlocked = patterns.some((pattern) => pattern.test(ctx.url));

		if (isBlocked) {
			const logMessage = description
				? `🚫 Blocked request (${description}): ${ctx.url}`
				: `🚫 Blocked request: ${ctx.url}`;
			console.log(logMessage);

			ctx.setHandled();
			ctx.setResponse(
				new Response(null, {
					status: 204,
					statusText: "No Content",
				})
			);
			return;
		}

		await next();
	};
}
