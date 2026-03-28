import type { ReactNode } from "react";
import { PostHogProvider } from "posthog-js/react";
import {
  POSTHOG_API_KEY,
  PRODUCT_INSIGHTS_AVAILABLE,
  posthogOptions,
} from "@/lib/posthog";

export function ProductInsightsProvider({
  children,
}: {
  children: ReactNode;
}) {
  if (!PRODUCT_INSIGHTS_AVAILABLE) {
    return <>{children}</>;
  }

  return (
    <PostHogProvider apiKey={POSTHOG_API_KEY} options={posthogOptions}>
      {children}
    </PostHogProvider>
  );
}
