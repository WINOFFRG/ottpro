import type { AppHandler } from "@/lib/shared/types";
import { bypassAccountSharing } from "./bypass-account-sharing";

export const netflixHandler: AppHandler = {
  id: "netflix",
  name: "Netflix",
  domain: "netflix.com",
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
