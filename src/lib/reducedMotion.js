// The Motion toggle sets <html data-motion="reduce"|"full">; with no choice
// made, the OS preference decides. Every reduced-motion check goes through
// here so the toggle and the OS setting agree.
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  const forced = document.documentElement.dataset.motion;
  if (forced) return forced === "reduce";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
