import { logger } from "@/lib/logger";
import type { Middleware } from "@/lib/shared/middleware";
import { isAutoPictureInPictureSupported } from "./picture-in-picture";

type AutoPictureInPictureVideo = HTMLVideoElement & {
  autoPictureInPicture?: boolean;
};

function patchAutoPictureInPictureOnSingleVideo(): boolean {
  const videos = document.querySelectorAll("video");
  if (videos.length !== 1) {
    return false;
  }

  const video = videos[0] as AutoPictureInPictureVideo;
  video.removeAttribute("disablepictureinpicture");
  video.setAttribute("autopictureinpicture", "");

  if ("autoPictureInPicture" in video) {
    video.autoPictureInPicture = true;
  }

  logger.info("[Netflix] Enabled automatic Picture-in-Picture on video", {
    source: "netflix",
    middleware: "auto-picture-in-picture",
  });

  return true;
}

export function startAutoPictureInPicturePatch() {
  if (!isAutoPictureInPictureSupported()) {
    return;
  }

  if (patchAutoPictureInPictureOnSingleVideo()) {
    return;
  }

  const observer = new MutationObserver(() => {
    if (patchAutoPictureInPictureOnSingleVideo()) {
      observer.disconnect();
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

/**
 * Auto PiP - No-op middleware
 *
 * The actual patching is DOM-based and runs in onInit.
 */
export const autoPictureInPictureMode: Middleware = async (_ctx, next) => {
  await next();
};
