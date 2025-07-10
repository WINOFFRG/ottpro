import type { AppConfig } from "@/lib/shared/types";
import { bypassAccountSharing } from "./bypass-account-sharing";

export const config: AppConfig = {
  id: "netflix",
  name: "Netflix",
  domainPattern: "(^|\\.)netflix\\.com$",
  enabled: true,
  rules: [
    {
      id: "bypass-account-sharing",
      enabled: true,
      name: "Bypass Account Sharing",
      description:
        "Removes the device blocking screen, watch over any network now!",
      middleware: bypassAccountSharing,
    },
  ],
};
