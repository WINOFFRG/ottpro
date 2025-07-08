import { defineAppConfig } from "#imports";

declare module "wxt/utils/define-app-config" {
  export interface WxtAppConfig {
    theme?: "light" | "dark";
  }
}

export default defineAppConfig({
  theme: "dark",
});
