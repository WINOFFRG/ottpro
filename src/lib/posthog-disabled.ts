export const PRODUCT_INSIGHTS_AVAILABLE = false;

export const POSTHOG_API_KEY = "";
export const POSTHOG_API_HOST = "";

export const posthogOptions = {
  api_host: "",
  autocapture: false,
  capture_pageview: false,
  persistence: "localStorage",
  disable_external_dependency_loading: true,
  disable_surveys: true,
  disable_session_recording: true,
} as const;

export const initPostHog = () => null;

export const setProductInsightsEnabled = (_enabled: boolean) => {};

export const isProductInsightsEnabled = () => false;

export const setCurrentAppContext = (_app?: { id?: string; name?: string }) => {};

export const getPostHogDiagnosticsContext = (
  additional: Record<string, unknown> = {},
) => ({
  diagnostics_timestamp: new Date().toISOString(),
  ...additional,
});

export const getPostHog = () => null;
