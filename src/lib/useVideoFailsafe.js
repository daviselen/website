import { useEffect, useState } from "react";

// Backoff before each reload. Once these are used up the video is reported
// failed and the caller shows its still image instead.
const RETRY_DELAYS_MS = [1000, 4000];

// How long a requested play may sit without a frame before it counts as
// stalled. Browsers rarely fire `error` for a connection that just hangs.
const STALL_MS = 10000;

// Reloads a <video> whose source fails or hangs, and resumes playback if it
// was meant to be playing. Returns true once it has given up.
export function useVideoFailsafe(ref) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;
    let attempt = 0;
    let retryTimer;
    let stallTimer;

    const retry = () => {
      window.clearTimeout(stallTimer);
      if (retryTimer) return;
      if (attempt >= RETRY_DELAYS_MS.length) {
        setFailed(true);
        return;
      }
      const wantsPlay = !video.paused || video.autoplay;
      retryTimer = window.setTimeout(() => {
        retryTimer = undefined;
        attempt += 1;
        video.load();
        if (wantsPlay) video.play().catch(() => {});
      }, RETRY_DELAYS_MS[attempt]);
    };

    // A failed <source> fires `error` on itself, not on the <video>, and an
    // early one is just the browser falling through to the next source. Only
    // the last source failing (or a src-attribute video failing) is fatal.
    const onError = (event) => {
      const sources = video.querySelectorAll("source");
      if (event.target === video || event.target === sources[sources.length - 1])
        retry();
    };

    const armStall = () => {
      window.clearTimeout(stallTimer);
      stallTimer = window.setTimeout(() => {
        if (!video.paused && video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA)
          retry();
      }, STALL_MS);
    };
    const onPlaying = () => {
      window.clearTimeout(stallTimer);
      attempt = 0;
      setFailed(false);
    };
    const onPause = () => window.clearTimeout(stallTimer);

    video.addEventListener("error", onError, true);
    video.addEventListener("play", armStall);
    video.addEventListener("waiting", armStall);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    // The last source may already have failed before this effect ran.
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) retry();

    return () => {
      window.clearTimeout(retryTimer);
      window.clearTimeout(stallTimer);
      video.removeEventListener("error", onError, true);
      video.removeEventListener("play", armStall);
      video.removeEventListener("waiting", armStall);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
    };
  }, [ref]);

  return failed;
}
