export const AUTO_PICTURE_IN_PICTURE_RULE_ID = "auto-picture-in-picture";

export function isAutoPictureInPictureSupported(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  if (!("pictureInPictureEnabled" in document) || !document.pictureInPictureEnabled) {
    return false;
  }

  return true;
}
