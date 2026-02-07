import posthog from "posthog-js";

export const POSTHOG_API_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
export const POSTHOG_API_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

export const posthogOptions = {
  api_host: POSTHOG_API_HOST,
  autocapture: false,
  capture_pageview: false,
  persistence: "localStorage",
  disable_external_dependency_loading: true,
  disable_surveys: true,
  disable_session_recording: true,
} as const;

let productInsightsEnabled = false;
let isPosthogInitialized = false;
const extensionSessionId = crypto.randomUUID();
let appContext: { app_id?: string; app_name?: string } = {};

const getExtensionVersion = () => {
  try {
    return browser.runtime.getManifest().version;
  } catch {
    return "unknown";
  }
};

const getRuntimeKind = () => {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return "content";
  }

  return "background";
};

const getBrowserDetails = () => {
  if (typeof navigator === "undefined") {
    return {};
  }

  return {
    user_agent: navigator.userAgent,
    browser_language: navigator.language,
    browser_languages: navigator.languages?.join(","),
    platform: navigator.platform,
    vendor: navigator.vendor,
    hardware_concurrency: navigator.hardwareConcurrency,
    device_memory:
      "deviceMemory" in navigator ? navigator.deviceMemory : undefined,
  };
};

const getPageDetails = () => {
  if (typeof window === "undefined") {
    return {};
  }

  return {
    page_host: window.location.hostname,
    page_path: window.location.pathname,
    page_url: window.location.href,
  };
};

const getBaseContext = () => ({
  extension_version: getExtensionVersion(),
  extension_session_id: extensionSessionId,
  runtime_kind: getRuntimeKind(),
  ...appContext,
  ...getBrowserDetails(),
  ...getPageDetails(),
});

const registerContext = () => {
  if (!isPosthogInitialized) {
    return;
  }

  posthog.register(getBaseContext());
  posthog.register_for_session({
    extension_session_id: extensionSessionId,
    ...appContext,
  });
  posthog.register_once({
    first_seen_extension_version: getExtensionVersion(),
    first_seen_runtime_kind: getRuntimeKind(),
    ...getBrowserDetails(),
  });
};

export const initPostHog = () => {
  if (!POSTHOG_API_KEY || !POSTHOG_API_HOST) {
    return null;
  }

  if (isPosthogInitialized) {
    return posthog;
  }

  posthog.init(POSTHOG_API_KEY, posthogOptions);
  isPosthogInitialized = true;
  registerContext();
  applyProductInsightsState();

  return posthog;
};

const applyProductInsightsState = () => {
  if (!isPosthogInitialized) {
    return;
  }

  if (productInsightsEnabled) {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
};

export const setProductInsightsEnabled = (enabled: boolean) => {
  productInsightsEnabled = enabled;
  applyProductInsightsState();
};

export const isProductInsightsEnabled = () => productInsightsEnabled;

export const setCurrentAppContext = (app?: { id?: string; name?: string }) => {
  appContext = app?.id
    ? {
        app_id: app.id,
        app_name: app.name ?? app.id,
      }
    : {};

  registerContext();
};

export const getPostHogDiagnosticsContext = (
  additional: Record<string, unknown> = {},
) => {
  const posthogSessionId = isPosthogInitialized
    ? posthog.get_session_id?.()
    : undefined;
  const distinctId = isPosthogInitialized
    ? posthog.get_distinct_id?.()
    : undefined;

  return {
    ...getBaseContext(),
    posthog_session_id: posthogSessionId,
    distinct_id: distinctId,
    diagnostics_timestamp: new Date().toISOString(),
    ...additional,
  };
};

export const getPostHog = () => {
  if (!isPosthogInitialized) {
    return null;
  }

  return posthog;
};
