import { useEffect, useRef, useState } from "react";
import { useMediaReveal } from "../animation";

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

// background mode: Vimeo's silent, looping, autoplaying, chromeless embed.
const EMBED_PARAMS = "background=1&autoplay=1&loop=1&muted=1";

// How long after window load to start the embed. Long enough to clear the
// masthead copy's reveal (TextReveal delay 0.75 s + stagger), which is the
// LCP element on mobile.
const EMBED_DELAY_MS = 2000;

export default function MastheadVideo({
  vimeoId,
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);
  // The embed URL, withheld until the page has painted (see the deferral
  // effect below). An iframe with no src is inert: no player JS, no video.
  const [src, setSrc] = useState(null);
  const [muted, setMuted] = useState(true);
  const wrapRef = useRef(null);
  const maskRef = useRef(null);
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // First-frame-gated, not scroll-gated — the player's "loaded" event below
  // flips `loaded`, which is what gates the shared reveal below.
  useMediaReveal(wrapRef, { maskRef, mediaRef: videoRef, loaded });

  // Defer the embed until after window load plus EMBED_DELAY_MS. The video
  // is ~4.5 MB plus ~350 KB of player JS; started eagerly, all of it lands
  // before the masthead copy finishes revealing, and Lighthouse's simulated
  // throttling bills every one of those bytes to LCP (9.7 s on mobile). The
  // wrapper stays hidden until "loaded" either way, so nothing visible
  // changes except that the video arrives a beat later.
  useEffect(() => {
    let timer;
    const start = () => {
      timer = window.setTimeout(
        () => setSrc(`https://player.vimeo.com/video/${vimeoId}?${EMBED_PARAMS}`),
        EMBED_DELAY_MS
      );
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      window.clearTimeout(timer);
    };
  }, [vimeoId]);

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
    let cancelled = false;
    import("@vimeo/player").then(({ default: Player }) => {
      if (cancelled) return;
      player = new Player(videoRef.current);
      playerRef.current = player;
      player.on("loaded", () => setLoaded(true));
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
      player?.off("loaded");
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
        visibility: loaded ? "visible" : "hidden",
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
        <iframe
          ref={videoRef}
          src={src ?? undefined}
          // background mode is Vimeo's silent/looping/autoplay/chromeless
          // embed, but it letterboxes the 16:9 video inside the iframe
          // rather than covering it. So the iframe itself is sized to cover
          // the mask (cqw/cqh = the mask's size via containerType above) and
          // centered, with the clip-path/overflow cropping the excess.
          className="absolute block rounded-md"
          style={{
            width: "max(100cqw, calc(100cqh * 16 / 9))",
            height: "max(100cqh, calc(100cqw * 9 / 16))",
            // Centered via offsets, not translate(-50%): useMediaReveal's
            // GSAP tween owns this element's transform (scale/yPercent).
            left: "calc((100cqw - max(100cqw, 100cqh * 16 / 9)) / 2)",
            top: "calc((100cqh - max(100cqh, 100cqw * 9 / 16)) / 2)",
            transform: "scale(1.04) translateY(-1%)",
          }}
          allow="autoplay; fullscreen"
          title="Davis Elen masthead video"
        />
      </div>
      <button
        type="button"
        onClick={toggleMuted}
        aria-label={muted ? "Unmute video" : "Mute video"}
        aria-pressed={!muted}
        className="absolute bottom-300 right-300 flex size-600 items-center justify-center rounded-full border border-neutral-0 bg-neutral-1000/40 text-neutral-0 transition-colors hover:bg-neutral-1000/70"
      >
        <span className="flex h-300 items-center gap-50" aria-hidden="true">
          {BARS.map((bar, i) => (
            <span
              key={i}
              className={`block h-300 w-50 rounded-full bg-neutral-0 transition-transform duration-200 ${muted ? "" : "animate-waveform"}`}
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
    </div>
  );
}
