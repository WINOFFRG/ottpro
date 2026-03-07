import { logger } from "@/lib/logger";
import type { Middleware } from "@/lib/shared/middleware";

export const HOTSTAR_DEBUG_MODE_RULE_ID = "debug-mode";

function createDebugKeyEvent(type: "keydown" | "keyup"): KeyboardEvent {
  const keyEventInit: KeyboardEventInit = {
    key: ".",
    code: "Period",
    bubbles: true,
    cancelable: true,
    composed: true,
  };

  const event = new KeyboardEvent(type, keyEventInit);
  try {
    Object.defineProperties(event, {
      keyCode: { value: 190 },
      which: { value: 190 },
      charCode: { value: 46 },
    });
  } catch {
    // No-op: some browsers may not allow overriding readonly fields.
  }

  return event;
}

function getDispatchTarget(): Element | null {
  const activeElement = document.activeElement;
  if (activeElement instanceof Element) {
    return activeElement;
  }

  return document.body ?? document.documentElement;
}

function dispatchDebugToggleKey() {
  const target = getDispatchTarget();
  if (!target) {
    return;
  }

  target.dispatchEvent(createDebugKeyEvent("keydown"));
  target.dispatchEvent(createDebugKeyEvent("keyup"));

  logger.debug("[Hotstar] Toggled debug overlay via key event", {
    source: "hotstar",
    middleware: "debug-mode",
  });
}

export function triggerHotstarDebugMode() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", dispatchDebugToggleKey, {
      once: true,
    });
    return;
  }

  dispatchDebugToggleKey();
}

export const debugMode: Middleware = (_ctx, next) => next();
