import posthog, { isPostHogConfigured } from "./posthog.js";

// A tab opened before a deploy asks for /assets/<oldhash>.js after it, and the
// file is gone. Reloading fetches the new index.html and the new hashes.
// (Vercel Skew Protection prevents most of these; this is the safety net.)

const RELOAD_KEY = "chunk-reload-at";
// One automatic reload per window. A second failure inside it means a reload
// didn't help (offline, blocked, genuinely broken), so show the error UI
// instead of looping.
const RELOAD_WINDOW_MS = 30000;

// Browsers word this differently: Chromium, Firefox and Safari respectively,
// plus Vite's own CSS preload failure.
const CHUNK_ERROR =
  /dynamically imported module|Importing a module script failed|Unable to preload CSS/i;

// The router's URL only updates once a navigation succeeds, so when its target
// chunk fails, location is still the page being left. main.jsx hands the router
// over so the reload can go where the visitor was heading.
let router;
export const registerRouter = (r) => {
  router = r;
};

export const isChunkError = (error) => CHUNK_ERROR.test(error?.message ?? "");

// Returns true if it started a reload. Reports once per call either way.
export function recoverFromChunkError(error) {
  const willReload = reserveReload();
  if (isPostHogConfigured) {
    posthog.capture("chunk_load_failure", {
      message: error?.message,
      reloading: willReload,
      sha: import.meta.env.VITE_COMMIT_SHA,
    });
  }
  if (willReload) {
    const pending = router?.state.navigation.location;
    if (pending)
      location.assign(pending.pathname + pending.search + pending.hash);
    else location.reload();
  }
  return willReload;
}

function reserveReload() {
  let last = 0;
  try {
    last = Number(sessionStorage.getItem(RELOAD_KEY)) || 0;
  } catch {
    // Storage blocked: no loop guard is possible, so don't auto-reload.
    return false;
  }
  if (Date.now() - last < RELOAD_WINDOW_MS) return false;
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  return true;
}

// Fired by Vite when a dynamic import's preload (JS or CSS) fails.
window.addEventListener("vite:preloadError", (event) => {
  if (recoverFromChunkError(event.payload)) event.preventDefault();
});
