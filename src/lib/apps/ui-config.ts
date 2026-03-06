import { cva } from "class-variance-authority";

export interface AppUiConfig {
  url: string;
  theme: {
    wrapper: string;
    closeButtonGlow: string;
    appPill: string;
  };
  cardVariant: "hotstar" | "netflix" | "primevideo" | "default";
}

const defaultTheme = {
  wrapper:
    "bg-gradient-to-r from-neutral-800/95 via-neutral-700/75 to-neutral-800/95 before:from-neutral-400/15 before:via-transparent before:to-neutral-200/10 after:from-neutral-900/35 after:via-transparent after:to-neutral-500/20",
  closeButtonGlow: "hover:shadow-neutral-500/25",
  appPill: "border-white/15 bg-white/10 text-white/80",
};

export const appUiConfigs: Record<string, AppUiConfig> = {
  hotstar: {
    url: "https://www.hotstar.com/",
    theme: {
      wrapper:
        "bg-[linear-gradient(92.7deg,rgba(20,146,255,0.95)_0%,rgba(8,96,196,0.85)_50%,rgba(235,0,102,0.88)_100%)] before:from-[#7fd4ff]/35 before:via-transparent before:to-[#f85ea8]/25 after:from-[#04234a]/40 after:via-transparent after:to-[#97004d]/30",
      closeButtonGlow: "hover:shadow-[#1492ff]/35",
      appPill: "border-[#9bd8ff]/40 bg-[#1492ff]/20 text-[#e9f8ff]",
    },
    cardVariant: "hotstar",
  },
  netflix: {
    url: "https://www.netflix.com/",
    theme: {
      wrapper:
        "bg-gradient-to-r from-[#7a0000]/95 via-[#e50914]/65 to-[#2b0a0d]/95 before:from-[#ff3f4a]/30 before:via-transparent before:to-[#8f0f16]/20 after:from-[#120304]/45 after:via-transparent after:to-[#ff1f2b]/25",
      closeButtonGlow: "hover:shadow-[#e50914]/30",
      appPill: "border-[#ff6169]/30 bg-[#e50914]/20 text-[#ffd9dc]",
    },
    cardVariant: "netflix",
  },
  primevideo: {
    url: "https://www.primevideo.com/",
    theme: {
      wrapper:
        "bg-gradient-to-r from-[#062e61]/95 via-[#0f79af]/75 to-[#032443]/95 before:from-[#4cc2ff]/35 before:via-transparent before:to-[#1f86c2]/25 after:from-[#031325]/45 after:via-transparent after:to-[#0f79af]/30",
      closeButtonGlow: "hover:shadow-[#0f79af]/35",
      appPill: "border-[#73d0ff]/35 bg-[#0f79af]/20 text-[#d6f3ff]",
    },
    cardVariant: "primevideo",
  },
};

export const getDefaultUiConfig = (appId: string): AppUiConfig => ({
  url: `https://www.winoffrg.dev/`,
  theme: defaultTheme,
  cardVariant: "default",
});

export const getAppUiConfig = (appId: string): AppUiConfig => {
  return appUiConfigs[appId] ?? getDefaultUiConfig(appId);
};

export const appCardVariants = cva(
  "group flex items-center justify-between rounded-xl border px-3 py-2 transition-all duration-200 hover:shadow-lg hover:shadow-black/20",
  {
    variants: {
      variant: {
        hotstar:
          "border-[#8fd4ff]/40 bg-[linear-gradient(120deg,rgba(20,146,255,0.26),rgba(8,96,196,0.2)_52%,rgba(235,0,102,0.2))] hover:border-[#b0e2ff]/60",
        netflix:
          "border-[#ff6169]/30 bg-[linear-gradient(135deg,rgba(229,9,20,0.22),rgba(122,0,0,0.15))] hover:border-[#ff6169]/50",
        primevideo:
          "border-[#73d0ff]/35 bg-[linear-gradient(135deg,rgba(15,121,175,0.22),rgba(6,46,97,0.16))] hover:border-[#73d0ff]/55",
        default: "border-white/10 bg-white/[0.03] hover:border-white/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);
