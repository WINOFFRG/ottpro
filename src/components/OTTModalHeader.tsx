import { useRootStore } from "@/hooks/useStore";
import type { AppConfig } from "@/lib/shared/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import packageJson from "../../package.json" with { type: "json" };
import { Button } from "./ui/button";
import { getAppUiConfig } from "@/lib/apps/ui-config";

export function OTTModalHeader({
  app,
  badgeLabel,
}: {
  app?: AppConfig;
  badgeLabel?: string | null;
}) {
  const root = useRootStore((state) => state.root);
  const theme = getAppUiConfig(app?.id || "").theme;
  const resolvedBadgeLabel = badgeLabel === undefined ? (app?.name ?? "Unsupported") : badgeLabel;

  const handleClose = () => {
    root?.remove();
  };

  return (
    <div
      className={cn(
        "group relative h-16 w-full flex-shrink-0 overflow-hidden backdrop-blur-md before:absolute before:inset-0 before:bg-gradient-to-br after:absolute after:inset-0 after:bg-gradient-to-tr",
        theme.wrapper,
      )}
    >
      <div className="relative flex h-full items-center justify-between px-4">
        <div className="min-w-0">
          <p className="m-0 truncate bg-gradient-to-r from-white via-white/95 to-white/80 bg-clip-text font-mono font-semibold text-base text-transparent">
            {packageJson.name}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-normal text-sm text-white/55">
              v{packageJson.version}
            </span>
            {resolvedBadgeLabel ? (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 font-medium text-[10px] tracking-wide uppercase",
                  theme.appPill,
                )}
              >
                {resolvedBadgeLabel}
              </span>
            ) : null}
          </div>
        </div>
        <Button
          aria-label="Close"
          className={cn(
            "z-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 transition-all duration-300 hover:rotate-90 hover:border-white/25 hover:bg-white/20 hover:shadow-lg",
            theme.closeButtonGlow,
          )}
          onClick={handleClose}
          size="icon"
        >
          <X className="h-4 w-4 text-white/70 transition-colors duration-200 hover:text-white/95" />
        </Button>
      </div>
    </div>
  );
}
