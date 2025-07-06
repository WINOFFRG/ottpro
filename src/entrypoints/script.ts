import { fetchApiPolyfill } from "@/lib/fetch_pollyfill";

export default defineUnlistedScript(() => {
  fetchApiPolyfill();
});
