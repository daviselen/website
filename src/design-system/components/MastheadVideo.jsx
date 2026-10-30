import { useEffect, useRef, useState } from "react";
import { useMediaReveal } from "../animation";
import Picture from "./Picture";
import { holdForMedia, useSiteReady } from "../../lib/siteReady.js";

// Per-bar animation-delay/-duration (seconds) so the 4 bars don't move in
// lockstep off the single shared `waveform` keyframe (tailwind.config.js) —
// each bar's CSS animation is independently out of phase with the others.
// Plain CSS, not GSAP: this is a purely decorative, state-toggled loop with
// no scroll/gesture coupling, and CSS removes the two things a GSAP tween
// would need careful handling for here — pausing/resuming across React
// StrictMode's dev-only double-mount, and reverting a gsap.context() without
// also reverting the plain `transition` used for the flatten.
const BARS = [
  { delay: 0, duration: 0.5 },
  { delay: 0.12, duration: 0.62 },
  { delay: 0.24, duration: 0.45 },
  { delay: 0.08, duration: 0.7 },
];

// Silent, chromeless embed. Autoplay stays on even though the embed loads
// behind the preloader: Vimeo does not buffer a paused embed (readyState
// stays 0), so it has to start playing to become ready at all. The player
// effect below parks it on its first frame the moment it is playing, and the
// siteReady effect plays it again once the site is released. Looping uses
// Vimeo's background mode, which forces repeat regardless of loop=, so
// play-once drops it and hides the chrome by hand instead. Without background=1 the video fits the iframe
// rather than covering it; the cover crop below still applies.
const embedParams = (loop) =>
  loop
    ? "background=1&autoplay=1&loop=1&muted=1"
    : "autoplay=1&muted=1&controls=0&title=0&byline=0&portrait=0";

export default function MastheadVideo({
  vimeoId,
  className = "",
  // Repeat the video. Off plays it once and holds the last frame.
  loop = true,
  // Still image shown from first paint and faded under the video once it
  // loads. It is the masthead's LCP candidate: the iframe can never be one,
  // and without a poster nothing large paints until the video arrives.
  poster,
  posterAlt = "",
  // Off for silent clips: no sound to toggle, so the mute button is not rendered.
  hasAudio = true,
}) {
  const [loaded, setLoaded] = useState(false);
  // Source aspect ratio (w / h) for the cover sizing below. The default is
  // the home video's 1920×812; replaced with the real one once the player
  // reports it, so a different video doesn't letterbox.
  const [ratio, setRatio] = useState(1920 / 812);
  const [muted, setMuted] = useState(true);
  const wrapRef = useRef(null);
  const maskRef = useRef(null);
  const mediaRef = useRef(null);
  const videoRef = useRef(null);
  const posterRef = useRef(null);
  const playerRef = useRef(null);
  const [posterLoaded, setPosterLoaded] = useState(false);

  // A cached poster can finish before React attaches onLoad.
  useEffect(() => {
    if (posterRef.current?.complete) setPosterLoaded(true);
  }, []);

  // First-frame-gated, not scroll-gated. With a poster the wipe plays as soon
  // as the poster has decoded, so the masthead paints early; the video then
  // fades in over it. Without one it waits for the player's "loaded" event.
  const revealReady = poster ? posterLoaded : loaded;
  useMediaReveal(wrapRef, { maskRef, mediaRef, loaded: revealReady });

  // Defer the embed until window load: the video is ~4.5 MB plus ~350 KB of
  // player JS, and started eagerly it competes with everything that paints.
  // It does not wait for anything past that, because the preloader is itself
  // waiting on this video (holdForMedia below) — gating the embed on the
  // preloader lifting would deadlock. Playback is what waits for the site.
  const siteReady = useSiteReady();
  const [windowLoaded, setWindowLoaded] = useState(
    () => document.readyState === "complete"
  );

  useEffect(() => {
    if (windowLoaded) return undefined;
    const onLoad = () => setWindowLoaded(true);
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, [windowLoaded]);

  // The embed URL, withheld until then. An iframe with no src is inert: no
  // player JS, no video.
  const src = windowLoaded
    ? `https://player.vimeo.com/video/${vimeoId}?${embedParams(loop)}`
    : null;

  // Tell the preloader to wait until the video is actually playing, i.e.
  // buffered enough to start (the player's "loaded" event only means its UI is
  // up). Released on unmount too, so a video that goes away can never leave
  // it waiting.
  const releaseMediaRef = useRef(null);
  useEffect(() => {
    releaseMediaRef.current = holdForMedia();
    return () => releaseMediaRef.current();
  }, []);

  // Until the site is released the video is parked on its first frame. These
  // are refs because the player effect below is keyed on `src` alone
  // and must not re-bind the player when either changes.
  const siteReadyRef = useRef(false);
  const inViewRef = useRef(false);
  const endedRef = useRef(false);
  useEffect(() => {
    siteReadyRef.current = siteReady;
    if (siteReady && inViewRef.current && !endedRef.current) {
      playerRef.current?.play().catch(() => {});
    }
  }, [siteReady]);

  useEffect(() => {
    // Player throws on an iframe that isn't a Vimeo embed yet.
    if (!src) return undefined;

    // Binding Player to the <iframe> already in the JSX below — not handing
    // it an empty container to embed into — on purpose. The container form
    // does an async oEmbed fetch and injects its own iframe, which is its
    // own StrictMode race; see the destroy() note below for the one this
    // iframe form still has to dodge.
    //
    // The SDK is imported here, not at module scope, so it stays out of the
    // entry bundle along with the embed it drives.
    let player;
    let observer;
    endedRef.current = false;
    let cancelled = false;
    import("@vimeo/player").then(({ default: Player }) => {
      if (cancelled) return;
      player = new Player(videoRef.current);
      playerRef.current = player;
      player.on("loaded", () => {
        setLoaded(true);
        Promise.all([player.getVideoWidth(), player.getVideoHeight()])
          .then(([w, h]) => w && h && setRatio(w / h))
          .catch(() => {});
      });
      // First "playing" = buffered and running. Park it back on frame 0 and
      // let the preloader go; if the site is already released (the preloader
      // timed out first) just let it keep playing.
      let primed = false;
      player.on("playing", () => {
        if (primed) return;
        primed = true;
        releaseMediaRef.current?.();
        if (!siteReadyRef.current) {
          player
            .pause()
            .then(() => player.setCurrentTime(0))
            .catch(() => {});
        }
      });

      // Scrolled fully out of view: stop decoding frames, and stop any audio
      // the user unmuted. The `ended` guard is for loop={false}, where the
      // video is meant to hold its last frame — without it, scrolling back
      // would restart a clip that had already finished. Both calls return
      // promises that reject when the player refuses (an autoplay policy
      // block on an unmuted resume, a destroyed player), hence the catches;
      // an unhandled rejection is the only thing that could go wrong here,
      // and the video simply staying paused is the right fallback.
      player.on("ended", () => {
        endedRef.current = true;
      });
      observer = new IntersectionObserver(([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (!entry.isIntersecting) player.pause().catch(() => {});
        else if (!endedRef.current && siteReadyRef.current) {
          player.play().catch(() => {});
        }
      });
      observer.observe(wrapRef.current);
    });

    // Not player.destroy(): it unconditionally removes the iframe from the
    // DOM with a raw removeChild, iframe-owning-container case or not. This
    // iframe is React's, not the player's, so under StrictMode's
    // mount → cleanup → mount, that removeChild rips it out from under
    // React between the two mounts — nothing re-renders afterward to put it
    // back, so the video silently never comes back. Unbinding the listener
    // is all cleanup needs to do; React removes the iframe itself when this
    // component actually unmounts.
    return () => {
      cancelled = true;
      observer?.disconnect();
      player?.off("loaded");
      player?.off("playing");
      player?.off("ended");
    };
  }, [src]);

  const toggleMuted = () => {
    const next = !muted;
    // The click itself is the user gesture autoplay policies require before
    // audio can start, so flipping this from the button handler (rather
    // than on mount, or in response to some later async event) is load-
    // bearing, not just tidy.
    playerRef.current?.setMuted(next);
    setMuted(next);
  };

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        visibility: revealReady ? "visible" : "hidden",
      }}
    >
      <div
        ref={maskRef}
        // A <video>'s auto-height falls back to its intrinsic aspect ratio
        // when an ancestor's height is indefinite, which happened to size
        // this div correctly by accident. An iframe has no such fallback —
        // cross-origin content gives the browser no ratio to compute from —
        // so it collapses to the UA default 150px unless this div is given
        // an explicit size of its own to resolve the iframe's size-full
        // against.
        className="relative size-full"
        style={{
          clipPath: "inset(0% 0% 100% 0%)",
          containerType: "size",
        }}
      >
        {/* Media layer: useMediaReveal's GSAP tween owns this element's
            transform (scale/yPercent), so poster and video zoom together.
            No inline transform: GSAP would read its translateY(-1%) as a
            fixed px `y` and leave it there after yPercent settles to 0. */}
        <div ref={mediaRef} className="absolute inset-0">
        {poster && (
          <Picture
            ref={posterRef}
            src={poster}
            alt={posterAlt}
            loading="eager"
            // Lowercase: React 18 has no fetchPriority prop and passes
            // unknown lowercase attributes through untouched.
            fetchpriority="high"
            onLoad={() => setPosterLoaded(true)}
            className="absolute inset-0 size-full rounded-md object-cover"
          />
        )}
        <iframe
          ref={videoRef}
          src={src ?? undefined}
          // Both embed modes fit the video inside the iframe (background
          // mode included) rather than covering it, so the iframe is sized
          // to cover the mask (cqw/cqh = its size via containerType above)
          // and centered, with the clip-path/overflow cropping the excess.
          // `ratio` is the video source's w / h; the 16px overscan (8px a
          // side) pushes the player's own bright 1px bottom-edge line, and
          // any fractional-size sliver of poster, out past the clip.
          className="absolute block rounded-md"
          style={{
            width: `calc(max(100cqw, 100cqh * ${ratio}) + 16px)`,
            height: `calc(max(100cqh, 100cqw / ${ratio}) + 16px)`,
            left: `calc((100cqw - max(100cqw, 100cqh * ${ratio})) / 2 - 8px)`,
            top: `calc((100cqh - max(100cqh, 100cqw / ${ratio})) / 2 - 8px)`,
            // Over a poster, fade in once the first frame is ready instead
            // of popping in.
            opacity: poster && !loaded ? 0 : 1,
            transition: "opacity 0.6s ease-out",
          }}
          allow="autoplay; fullscreen"
          title="Davis Elen masthead video"
        />
        </div>
      </div>
      {hasAudio && (
        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? "Unmute video" : "Mute video"}
          aria-pressed={!muted}
          className="absolute bottom-300 right-300 flex size-500 items-center justify-center rounded-full border-1.5 border-neutral-0 bg-neutral-1000/40 text-neutral-0 transition-colors hover:bg-neutral-1000/70"
        >
          <span className="flex h-5 items-center gap-50" aria-hidden="true">
            {BARS.map((bar, i) => (
              <span
                key={i}
                className={`block h-5 w-50 rounded-full bg-neutral-0 transition-transform duration-200 ${muted ? "" : "animate-waveform reduced-motion:animate-none"}`}
                style={{
                  transformOrigin: "center",
                  transform: muted ? "scaleY(0.15)" : undefined,
                  animationDelay: `${bar.delay}s`,
                  animationDuration: `${bar.duration}s`,
                }}
              />
            ))}
          </span>
        </button>
      )}
    </div>
  );
}
