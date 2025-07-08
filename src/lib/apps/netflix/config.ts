import type { AppConfig } from "@/lib/shared/types";
import { bypassAccountSharing } from "./bypass-account-sharing";

export const config: AppConfig = {
  id: "netflix",
  name: "Netflix",
  domainPattern: /(^|\.)netflix\.com$/,
  enabled: true,
  rules: [
    {
      enabled: true,
      name: "Bypass Account Sharing",
      description: "Bypass account sharing",
      middleware: bypassAccountSharing,
    },
  ],
};
