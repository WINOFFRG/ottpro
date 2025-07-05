import type { AppHandler } from "../shared/types";
import { hotstarHandler } from "./hotstar/handler";
import { netflixHandler } from "./netflix/handler";

export const appHandlers: AppHandler[] = [hotstarHandler, netflixHandler];
