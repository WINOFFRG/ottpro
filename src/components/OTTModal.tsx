import { type ChangeEvent, useEffect, useState } from "react";
import { LOG_LEVEL_OPTIONS, type LogLevel } from "@/lib/logger";
import {
  useAppEnabled,
  useLogLevel,
  useRootStore,
  useSetLogLevel,
  useToggleApp,
} from "../hooks/useStore";
import { appConfigs } from "@/lib/apps/registry";
import { getAppUiConfig, appCardVariants } from "@/lib/apps/ui-config";
import {
  decodeCookieTransferPayload,
  encodeCookieTransferPayload,
} from "@/lib/cookie-transfer";
import { sendMessage, StorageMessageType } from "@/lib/messaging";
import { HOME_PAGE_DOMAIN } from "@/lib/shared/constants";
import { ArrowLeft, CircleArrowRightIcon, ExternalLink } from "lucide-react";
import { OTTModalHeader } from "./OTTModalHeader";
import { RuleItem } from "./RuleItem";
import { RuleSection } from "./RuleSection";
import { SocialSection } from "./SocialSection";
import { Switch } from "./ui/switch";

const HOTSTAR_LOGIN_TRANSFER_SELECTOR = {
  exact: ["deviceId"],
  startsWith: ["user"],
};

export function OTTModal() {
  const currentApp = useRootStore((state) => state.currentApp);
  const toggleApp = useToggleApp();
  const productInsightsEnabled = useProductInsightsEnabled();
  const logLevel = useLogLevel();
  const setLogLevel = useSetLogLevel();
  const toggleProductInsights = useToggleProductInsights();
  const isAppEnabled = useAppEnabled(currentApp?.id || "");
  const [hotstarView, setHotstarView] = useState<"main" | "login-transfer">(
    "main",
  );
  const [loginTransferMode, setLoginTransferMode] = useState<
    "export" | "import" | null
  >(null);
  const [loginTransferText, setLoginTransferText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isTransferBusy, setIsTransferBusy] = useState(false);
  const [transferMessage, setTransferMessage] = useState("");
  const [transferError, setTransferError] = useState("");

  const isHotstar = currentApp?.id === "hotstar";

  useEffect(() => {
    setHotstarView("main");
    setLoginTransferMode(null);
    setLoginTransferText("");
    setIsCopied(false);
    setIsTransferBusy(false);
    setTransferMessage("");
    setTransferError("");
  }, [currentApp?.id]);

  const handleAppToggle = async () => {
    if (currentApp) {
      await toggleApp(currentApp.id);
    }
  };

  const handleProductInsightsToggle = async () => {
    await toggleProductInsights();
  };

  const handleLogLevelChange = async (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    await setLogLevel(Number(event.target.value) as LogLevel);
  };

  const handleOpenLoginTransfer = () => {
    setHotstarView("login-transfer");
    setTransferMessage("");
    setTransferError("");
  };

  const handleBackToMain = () => {
    setHotstarView("main");
    setLoginTransferMode(null);
    setLoginTransferText("");
    setIsCopied(false);
    setTransferMessage("");
    setTransferError("");
  };

  const handleExportLogin = async () => {
    setLoginTransferMode("export");
    setIsCopied(false);
    setTransferError("");
    setTransferMessage("");
    setIsTransferBusy(true);

    try {
      const result = await sendMessage(StorageMessageType.EXPORT_COOKIES, {
        url: window.location.origin,
        selector: HOTSTAR_LOGIN_TRANSFER_SELECTOR,
      });
      const encodedPayload = encodeCookieTransferPayload(result.payload);

      setLoginTransferText(encodedPayload);
      setTransferMessage(
        result.matchedCount > 0
          ? `Exported ${result.matchedCount} cookies.`
          : "No matching cookies found to export.",
      );

      try {
        await navigator.clipboard.writeText(encodedPayload);
        setIsCopied(true);
      } catch {
        setIsCopied(false);
      }
    } catch (error) {
      setTransferError(
        error instanceof Error
          ? error.message
          : "Failed to export login cookies.",
      );
      setLoginTransferText("");
      setIsCopied(false);
    } finally {
      setIsTransferBusy(false);
    }
  };

  const handleImportLogin = () => {
    setLoginTransferMode("import");
    setLoginTransferText("");
    setIsCopied(false);
    setTransferMessage("");
    setTransferError("");
  };

  const handleImportSession = async () => {
    if (!loginTransferText.trim()) {
      setTransferError("Paste exported session text first.");
      return;
    }

    setTransferError("");
    setTransferMessage("");
    setIsTransferBusy(true);

    try {
      const payload = decodeCookieTransferPayload(loginTransferText);
      const result = await sendMessage(StorageMessageType.IMPORT_COOKIES, {
        url: window.location.origin,
        payload,
      });

      const failedCount = result.failedCookies.length;
      if (failedCount > 0) {
        setTransferMessage(
          `Imported ${result.importedCount} cookies, ${failedCount} failed.`,
        );
      } else {
        setTransferMessage(`Imported ${result.importedCount} cookies.`);
      }
    } catch (error) {
      setTransferError(
        error instanceof Error
          ? error.message
          : "Failed to import session cookies.",
      );
    } finally {
      setIsTransferBusy(false);
    }
  };

  const currentHost = window.location.hostname;
  const isHomePage =
    currentHost === HOME_PAGE_DOMAIN ||
    currentHost.endsWith(`.${HOME_PAGE_DOMAIN}`);
  const supportedAppLinks = appConfigs.map((app) => {
    const uiConfig = getAppUiConfig(app.id);
    return {
      id: app.id,
      name: app.name,
      variant: uiConfig.cardVariant,
      url: uiConfig.url,
    };
  });

  return (
    <div
      className={
        "slide-in-from-right-2 fade-in no-scrollbar pointer-events-auto fixed top-3 right-3 isolate z-[9999999] flex max-h-[90vh] w-72 transform-gpu animate-in flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-800 shadow-[0px_0px_28px_0px_rgba(0,0,0,0.5)] backdrop-blur-[40px] transition-all duration-300"
      }
      style={{
        transition:
          "box-shadow 0.2s, opacity 0.2s, transform 0.2s, max-height 0.3s",
      }}
    >
      <OTTModalHeader
        app={currentApp}
        badgeLabel={isHomePage && !currentApp ? null : undefined}
      />
      <div
        className="min-h-0 flex-1 overflow-y-auto px-0"
        style={{
          msScrollChaining: "none",
          overscrollBehavior: "contain",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {currentApp ? (
          <div
            className={
              isHotstar && hotstarView === "login-transfer"
                ? "slide-in-from-right-2 fade-in animate-in duration-200"
                : "slide-in-from-left-2 fade-in animate-in duration-200"
            }
          >
            {isHotstar && hotstarView === "login-transfer" ? (
              <>
                <div className="border-white/10 border-b px-4 py-3">
                  <button
                    className="mb-2 inline-flex items-center gap-1 text-white/70 text-xs transition-colors hover:text-white"
                    onClick={handleBackToMain}
                    type="button"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back
                  </button>
                  <h3 className="truncate font-medium text-sm text-white">
                    Login Another Device
                  </h3>
                  <p className="mt-1 text-white/60 text-xs">
                    Bypass active devices restriction by copying your current
                    login to another device
                  </p>
                </div>

                <RuleSection title="Transfer Options">
                  <div className="flex gap-2">
                    <button
                      className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white text-xs transition-colors hover:bg-white/10 disabled:opacity-60"
                      disabled={isTransferBusy}
                      onClick={handleExportLogin}
                      type="button"
                    >
                      {isTransferBusy && loginTransferMode === "export"
                        ? "Exporting..."
                        : "Export"}
                    </button>
                    <button
                      className="flex-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white text-xs transition-colors hover:bg-white/10 disabled:opacity-60"
                      disabled={isTransferBusy}
                      onClick={handleImportLogin}
                      type="button"
                    >
                      Import
                    </button>
                  </div>
                </RuleSection>

                {loginTransferMode && (
                  <RuleSection
                    title={
                      loginTransferMode === "export"
                        ? "Exported Session"
                        : "Import Session"
                    }
                  >
                    <textarea
                      className="min-h-24 w-full resize-y rounded-lg border border-white/15 bg-white/5 p-3 text-white text-xs outline-none placeholder:text-white/35"
                      onChange={(event) =>
                        setLoginTransferText(event.target.value)
                      }
                      placeholder="Paste session text here..."
                      readOnly={loginTransferMode === "export"}
                      value={loginTransferText}
                    />
                    {loginTransferMode === "export" && (
                      <div className="flex items-center justify-between gap-2 text-emerald-300/90 text-[11px]">
                        <span>
                          {isCopied
                            ? "Copied to clipboard."
                            : "Copy from the box if clipboard is blocked."}
                        </span>
                        {transferMessage && (
                          <span className="shrink-0">{transferMessage}</span>
                        )}
                      </div>
                    )}
                    {loginTransferMode === "import" && (
                      <button
                        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white text-xs transition-colors hover:bg-white/10 disabled:opacity-60"
                        disabled={isTransferBusy}
                        onClick={handleImportSession}
                        type="button"
                      >
                        {isTransferBusy ? "Importing..." : "Import Session"}
                      </button>
                    )}
                    {loginTransferMode === "import" && transferMessage && (
                      <span className="text-emerald-300/90 text-[11px]">
                        {transferMessage}
                      </span>
                    )}
                    {transferError && (
                      <span className="text-red-300/90 text-[11px]">
                        {transferError}
                      </span>
                    )}
                  </RuleSection>
                )}
              </>
            ) : (
              <>
                <div className="border-white/10 border-b px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-sm text-white">
                        Enable {currentApp.name}
                      </h3>
                      <p className="mt-1 text-white/60 text-xs">
                        Master switch for all features
                      </p>
                    </div>
                    <div className="">
                      <Switch
                        aria-label={`Toggle ${currentApp.name}`}
                        checked={isAppEnabled}
                        className="relative h-6 w-10 cursor-pointer rounded-full border-2 border-white/10 p-1 shadow-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=checked]:border-transparent data-[state=checked]:bg-white/30 data-[state=unchecked]:bg-transparent"
                        onCheckedChange={handleAppToggle}
                      />
                    </div>
                  </div>
                </div>

                {isAppEnabled && currentApp.rules?.length > 0 && (
                  <RuleSection title="Rules">
                    {currentApp.rules.map((rule) => (
                      <RuleItem
                        description={
                          rule.supported === false
                            ? rule.unsupportedDescription || rule.description
                            : rule.description
                        }
                        key={rule.id}
                        ruleId={rule.id}
                        supported={rule.supported !== false}
                        title={rule.name}
                      />
                    ))}
                  </RuleSection>
                )}

                {isHotstar && (
                  <RuleSection title="Bypass Device Limitations">
                    <button
                      className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-left text-white text-xs transition-colors hover:bg-white/10"
                      onClick={handleOpenLoginTransfer}
                      type="button"
                    >
                      <div className="flex items-center justify-between">
                        Login Another Device
                        <CircleArrowRightIcon className="size-4" />
                      </div>
                    </button>
                  </RuleSection>
                )}

                <RuleSection title="">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="truncate font-medium text-sm text-white">
                        Log level
                      </p>
                    </div>
                    <select
                      aria-label="Select log level"
                      className="min-w-24 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white text-xs outline-none transition-colors hover:bg-white/10"
                      onChange={handleLogLevelChange}
                      value={String(logLevel)}
                    >
                      {LOG_LEVEL_OPTIONS.map((option) => (
                        <option
                          className="bg-neutral-900 text-white"
                          key={option.value}
                          value={String(option.value)}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </RuleSection>
              </>
            )}
          </div>
        ) : isHomePage ? (
          <div className="flex h-full min-h-56 flex-col px-5 py-6">
            <div className="mb-4">
              <h3 className="m-0 font-medium text-base text-white">
                Supported Apps
              </h3>
              <p className="mt-1 text-white/60 text-xs">
                Open a platform below, then use the extension icon to configure
                rules.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {supportedAppLinks.map((app) => (
                <a
                  className={appCardVariants({ variant: app.variant })}
                  href={app.url}
                  key={app.id}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="font-medium text-sm text-white">
                    {app.name}
                  </span>
                  <ExternalLink className="size-4 text-white/65 transition-colors group-hover:text-white/90" />
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-56 flex-col items-center justify-center px-5 py-8 text-center">
            <div className="mb-3 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1">
              <p className="m-0 font-semibold text-[10px] tracking-wide text-amber-200 uppercase">
                Unsupported App
              </p>
            </div>
            <h3 className="m-0 font-medium text-base text-white">
              This app is not supported yet
            </h3>
            <p className="mt-2 max-w-60 text-white/65 text-xs leading-relaxed">
              OTTPRO doesn&apos;t have rules for{" "}
              <span className="font-medium text-white/80">{currentHost}</span>{" "}
              right now. Check the support links below to request it.
            </p>
          </div>
        )}

        <SocialSection />
      </div>
    </div>
  );
}
