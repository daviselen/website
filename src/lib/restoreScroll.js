// On refresh the browser restores scroll once, early in the load, clamped to
// however tall the page is at that moment. This page keeps growing after
// that (images, fonts, lazy sections), so a refresh lands short and stays
// there. Keep the position ourselves and re-apply it as the page grows.
const key = `scroll:${location.pathname}`;

window.addEventListener("pagehide", () => {
  try {
    sessionStorage.setItem(key, String(window.scrollY));
  } catch {
    // Storage blocked: the browser's own restore is all we get.
  }
});

const isReload =
  performance.getEntriesByType("navigation")[0]?.type === "reload";

let target = 0;
try {
  target = Number(sessionStorage.getItem(key)) || 0;
} catch {
  // Same as above.
}

if (isReload && target > 0) {
  const events = ["wheel", "touchstart", "keydown"];
  const stop = () => {
    observer.disconnect();
    clearTimeout(timer);
    events.forEach((event) => window.removeEventListener(event, stop));
  };
  const apply = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.min(target, max));
    if (max >= target) stop();
  };

  const observer = new ResizeObserver(apply);
  observer.observe(document.body);
  // Someone scrolling themselves, or a page that never gets tall enough,
  // must not be fought over.
  events.forEach((event) =>
    window.addEventListener(event, stop, { passive: true })
  );
  const timer = setTimeout(stop, 6000);
}
