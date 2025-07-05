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
      if (i <= index) throw new Error("next() called multiple times");
      index = i;
      const fn = middlewares[i];
      if (fn) {
        await fn(ctx, () => dispatch(i + 1));
      }
    }
    await dispatch(0);
  };
}
