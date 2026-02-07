import {
  useAppEnabled,
  useProductInsightsEnabled,
  useRootStore,
  useToggleApp,
  useToggleProductInsights,
} from "../hooks/useStore";
import { appConfigs } from "@/lib/apps/registry";
import { getAppUiConfig, appCardVariants } from "@/lib/apps/ui-config";
import { HOME_PAGE_DOMAIN } from "@/lib/shared/constants";
import { ExternalLink } from "lucide-react";
import { OTTModalHeader } from "./OTTModalHeader";
import { RuleItem } from "./RuleItem";
import { RuleSection } from "./RuleSection";
import { SocialSection } from "./SocialSection";
import { Switch } from "./ui/switch";

export function OTTModal() {
  const currentApp = useRootStore((state) => state.currentApp);
  const toggleApp = useToggleApp();
  const productInsightsEnabled = useProductInsightsEnabled();
  const toggleProductInsights = useToggleProductInsights();
  const isAppEnabled = useAppEnabled(currentApp?.id || "");

  const handleAppToggle = async () => {
    if (currentApp) {
      await toggleApp(currentApp.id);
    }
  };

  const handleProductInsightsToggle = async () => {
    await toggleProductInsights();
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
                    description={rule.description}
                    key={rule.id}
                    ruleId={rule.id}
                    title={rule.name}
                  />
                ))}
              </RuleSection>
            )}

            <RuleSection title="Improve Product">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="truncate font-medium text-sm text-white">
                    Share diagnostics
                  </p>
                  <p className="mt-1 text-white/60 text-xs">
                    Sends usage logs to improve product quality
                  </p>
                </div>
                <Switch
                  aria-label="Toggle improve product diagnostics"
                  checked={productInsightsEnabled}
                  className="relative h-6 w-10 cursor-pointer rounded-full border-2 border-white/10 p-1 shadow-none transition-all duration-200 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=checked]:border-transparent data-[state=checked]:bg-white/30 data-[state=unchecked]:bg-transparent"
                  onCheckedChange={handleProductInsightsToggle}
                />
              </div>
            </RuleSection>
          </>
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
