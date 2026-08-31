import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap, useGSAP, EASE_OUT } from "../animation";

// ONE overlay instance lives at the app root and is driven through context.
// The alternative — each section holding its own `isOpen` state and rendering
// its own <VideoOverlay> — would duplicate the escape handling, scroll lock,
// focus restore, and z-index in every caller, and would let two overlays open
// at once. Callers here only ever say WHAT to play, never how to present it:
//
//   const { openVideo } = useVideoOverlay();
//   <MediaObject onClick={() => openVideo({ src, title })} />
//
// Nothing about this is MediaObject-specific: a Button, a Card, or a bare
// <button> triggers it identically.

const VideoOverlayContext = createContext(null);

export function useVideoOverlay() {
  const ctx = useContext(VideoOverlayContext);
  if (!ctx) {
    throw new Error("useVideoOverlay must be used inside <VideoOverlayProvider>");
  }
  return ctx;
}

// Fast enough to feel responsive to a click, slower than an instant cut.
// Not one of the Figma-derived reveal timings — this is chrome, not content.
const OVERLAY_DURATION = 0.3;

export function VideoOverlayProvider({ children }) {
  const [video, setVideo] = useState(null);

  const openVideo = useCallback((next) => setVideo(next), []);
  const closeVideo = useCallback(() => setVideo(null), []);

  // Memoised so consumers don't re-render on every provider render.
  const value = useMemo(
    () => ({ openVideo, closeVideo, isVideoOpen: Boolean(video) }),
    [openVideo, closeVideo, video]
  );

  return (
    <VideoOverlayContext.Provider value={value}>
      {children}
      <VideoOverlay video={video} onClose={closeVideo} />
    </VideoOverlayContext.Provider>
  );
}

function VideoOverlay({ video, onClose }) {
  // `video` clears the instant close is requested, but the exit animation
  // still needs its src for a few hundred ms — so the last payload is held
  // here until the tween finishes. Same mount-through-exit pattern the
  // PixelCurtain uses for its phases.
  const [rendered, setRendered] = useState(null);
  const isOpen = Boolean(video);

  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const videoRef = useRef(null);
  const closeRef = useRef(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    if (video) setRendered(video);
  }, [video]);

  // Escape to close, plus a scroll lock while open. Both belong here rather
  // than in the caller — that's the whole point of centralising the overlay.
  useEffect(() => {
    if (!isOpen) return;

    lastFocusedRef.current = document.activeElement;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      // Send focus back where it came from, so a keyboard user who opened
      // this from a MediaObject lands on that MediaObject again.
      lastFocusedRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  useGSAP(
    () => {
      if (!rendered) return;

      if (isOpen) {
        closeRef.current?.focus();
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: OVERLAY_DURATION, ease: EASE_OUT }
        );
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: OVERLAY_DURATION, ease: EASE_OUT }
        );
        return;
      }

      // Closing: play the exit, THEN drop the payload so the <video> unmounts
      // (which is what actually stops playback and frees the buffer).
      gsap.to([backdropRef.current, panelRef.current], {
        opacity: 0,
        duration: OVERLAY_DURATION,
        ease: EASE_OUT,
        onComplete: () => setRendered(null),
      });
    },
    { scope: rootRef, dependencies: [isOpen, rendered] }
  );

  if (!rendered) return null;

  // A string src or the { webm, mp4 } pair PortfolioGrid already uses for
  // ImageCard — same shape, so video data can move between the two without
  // reshaping it.
  const sources =
    typeof rendered.src === "string" ? null : rendered.src ?? null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={rendered.title ?? "Video player"}
      className="fixed inset-0 z-50 flex items-center justify-center p-400"
    >
      {/* A real <button>, not a div with onClick: it gives the backdrop a
          keyboard-reachable, screen-reader-announced way to dismiss, and
          satisfies jsx-a11y without a bespoke keydown handler. */}
      <button
        ref={backdropRef}
        type="button"
        aria-label="Close video"
        onClick={onClose}
        className="absolute inset-0 size-full cursor-default bg-surface-default/90"
      />

      <div ref={panelRef} className="relative w-full max-w-5xl">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-0 top-0 -translate-y-full p-200 font-narrow text-base uppercase text-neutral-0 hover:text-primary-300"
        >
          Close
        </button>

        <video
          ref={videoRef}
          poster={rendered.poster}
          controls
          autoPlay
          playsInline
          className="block aspect-video w-full rounded-md"
          {...(sources ? {} : { src: rendered.src })}
        >
          {sources?.webm ? <source src={sources.webm} type="video/webm" /> : null}
          {sources?.mp4 ? <source src={sources.mp4} type="video/mp4" /> : null}
        </video>
      </div>
    </div>
  );
}
