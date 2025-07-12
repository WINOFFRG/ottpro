import type { LucideIcon } from "lucide-react";
import type { StaticImport } from "next/dist/shared/lib/get-img-props";

export interface DownloadButton {
  id: string;
  platform: string;
  icon: StaticImport;
  url: string;
  label: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: {
    component: LucideIcon;
    color: string;
    bgColor: string;
  };
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: LucideIcon;
}

export interface LandingConfig {
  hero: {
    title: string;
    subtitle: string;
  };
  downloads: DownloadButton[];
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}
