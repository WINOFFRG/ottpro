import type { Middleware } from "@/lib/shared/middleware";

export const NETFLIX_PLAYER_STATS_RULE_ID = "player-stats";

const NETFLIX_STATS_SHORTCUT_ATTEMPTS = [
  { key: "D", code: "KeyD", keyCode: 68 },
  { key: "Ð", code: "KeyD", keyCode: 68 },
  { key: "Q", code: "KeyQ", keyCode: 81 },
] as const;

function createNetflixStatsKeyEvent(
  key: string,
  code: string,
  keyCode: number,
): KeyboardEvent {
  const keyEventInit: KeyboardEventInit = {
    key,
    code,
    ctrlKey: true,
    altKey: true,
    shiftKey: true,
    bubbles: true,
    cancelable: true,
    composed: true,
  };

  const event = new KeyboardEvent("keydown", keyEventInit);
  try {
    Object.defineProperties(event, {
      keyCode: { value: keyCode },
      which: { value: keyCode },
      charCode: { value: keyCode },
    });
  } catch {
    // No-op: some browsers may not allow overriding readonly fields.
  }

  return event;
}

function dispatchShortcutKeydown(key: string, code: string, keyCode: number) {
  document.dispatchEvent(createNetflixStatsKeyEvent(key, code, keyCode));
}

function dispatchNetflixStatsShortcut() {
  for (const shortcut of NETFLIX_STATS_SHORTCUT_ATTEMPTS) {
    dispatchShortcutKeydown(
      shortcut.key,
      shortcut.code,
      shortcut.keyCode,
    );
  }
}

export function triggerNetflixPlayerStatsShortcut() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", dispatchNetflixStatsShortcut, {
      once: true,
    });
    return;
  }

  dispatchNetflixStatsShortcut();
}

export const netflixPlayerStats: Middleware = (_ctx, next) => next();
