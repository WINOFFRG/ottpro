import ChromeIcon from "@/assets/chrome.svg";
import FirefoxIcon from "@/assets/firefox.svg";
import type { LandingConfig } from "./types";

export const landingConfig: LandingConfig = {
  hero: {
    title: "Your force field against OTT restrictions",
    subtitle: "Binge with freedom",
  },
  downloads: [
    {
      id: "chrome",
      platform: "Chrome",
      icon: ChromeIcon,
      url: "https://chromewebstore.google.com/detail/obbimeepfgnpanehhppdikckhbjcamng",
      label: "Get for",
    },
    {
      id: "firefox",
      platform: "Firefox",
      icon: FirefoxIcon,
      url: "https://addons.mozilla.org/en-US/firefox/addon/ottpro",
      label: "Get for",
    },
  ],
};
