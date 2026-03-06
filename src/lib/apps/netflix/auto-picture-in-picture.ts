import { logger } from "@/lib/logger";
import type { Middleware } from "@/lib/shared/middleware";
import { isAutoPictureInPictureSupported } from "./picture-in-picture";

function patchAutoPictureInPictureOnSingleVideo(): boolean {
  const videos = document.querySelectorAll("video");
  if (videos.length !== 1) {
    return false;
  }

  const video = videos[0];
  video.removeAttribute("disablepictureinpicture");

  logger.info("[Netflix] Enabled Picture-in-Picture on video", {
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

  let isPatched = false;
  let isPatchScheduled = false;

  const runPatchAttempt = () => {
    if (isPatched) {
      return;
    }

    isPatchScheduled = false;
    isPatched = patchAutoPictureInPictureOnSingleVideo();
    if (isPatched) {
      observer.disconnect();
    }
  };

  const schedulePatchAttempt = () => {
    if (isPatched || isPatchScheduled) {
      return;
    }

    isPatchScheduled = true;
    requestAnimationFrame(runPatchAttempt);
  };

  const observer = new MutationObserver(() => {
    schedulePatchAttempt();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  schedulePatchAttempt();
}

/**
 * Auto PiP - No-op middleware
 *
 * The actual patching is DOM-based and runs in onInit.
 */
export const autoPictureInPictureMode: Middleware = (_ctx, next) => next();
