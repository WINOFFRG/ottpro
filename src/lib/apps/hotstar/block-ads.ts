import {
  createBlockingMiddleware,
  type Middleware,
} from "@/lib/shared/middleware";

const adBlockingPatterns = [
  /hesads\.akamaized\.net/,
  /service\.hotstar\.com\/blaze\//,
  /bifrost-api\.hotstar\.com/,
];

export const blockAds: Middleware = createBlockingMiddleware(
  adBlockingPatterns,
  "Hotstar Ad Blocking"
);
