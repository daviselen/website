import { useEffect, useRef, useState } from "react";
import { useMediaReveal } from "../animation";
import { holdForMedia, useSiteReady } from "../../lib/siteReady.js";

// Longest the masthead waits for the video's first frame before wiping in
// anyway, showing `poster`.
const REVEAL_FALLBACK_MS = 5000;

// A silent clip that plays once and stops on its last frame, which is what a
// <video> does at the end when it isn't looping. Self-hosted, unlike
// MastheadVideo's Vimeo embed, so there is no player to block or to miss.
export default function MastheadClip({ webm, mp4, poster, className = "" }) {
  const wrapRef = useRef(null);
  const maskRef = useRef(null);
  const mediaRef = useRef(null);
  const videoRef = useRef(null);
  // First frame decoded, or we gave up waiting: either way the wipe may play.
  // It is the only thing that un-hides the masthead, so it can't depend on a
  // single success-only event.
  const [ready, setReady] = useState(false);
  const siteReady = useSiteReady();

  useMediaReveal(wrapRef, { maskRef, mediaRef, loaded: ready });

  // The preloader waits on this clip. Released on unmount too, so a clip that
  // goes away can never leave it waiting.
  useEffect(() => {
    const video = videoRef.current;
    const release = holdForMedia();
    const settle = () => {
      setReady(true);
      release();
    };
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) settle();
    else video.addEventListener("loadeddata", settle, { once: true });
    const timer = window.setTimeout(settle, REVEAL_FALLBACK_MS);
    return () => {
      video.removeEventListener("loadeddata", settle);
      window.clearTimeout(timer);
      release();
    };
  }, []);

  // Not the autoplay attribute: the clip is two seconds long, so playing
  // behind the preloader would finish before anyone could see it. A rejected
  // play() (autoplay blocked) just leaves it on its first frame.
  useEffect(() => {
    if (siteReady && ready) videoRef.current.play().catch(() => {});
  }, [siteReady, ready]);

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${className}`}
      style={{ visibility: ready ? "visible" : "hidden" }}
    >
      <div
        ref={maskRef}
        className="relative size-full"
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
      >
        {/* Media layer: useMediaReveal's GSAP tween owns this element's
            transform (scale/yPercent). */}
        <div ref={mediaRef} className="absolute inset-0">
          <video
            ref={videoRef}
            poster={poster}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="absolute inset-0 size-full rounded-md object-cover"
          >
            <source src={webm} type="video/webm" />
            <source src={mp4} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}
