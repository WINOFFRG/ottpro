import type { LogLevel } from "@/lib/logger";

declare module "wxt/utils/define-app-config" {
  interface SocialLink {
    name: string;
    url: string;
  }
  export interface WxtAppConfig {
    defaultLogLevel: LogLevel;
    socialLinks: SocialLink[];
  }
}

export default defineAppConfig({
  defaultLogLevel: 0,
  socialLinks: [
    {
      name: "Github",
      url: "https://github.com/winoffrg/ottpro",
    },
    {
      name: "Open Issue",
      url: "https://github.com/WINOFFRG/ottpro/issues",
    },
    {
      name: "Rate Us",
      url: "https://chromewebstore.google.com/detail/ottpro/obbimeepfgnpanehhppdikckhbjcamng",
    },
  ],
});
