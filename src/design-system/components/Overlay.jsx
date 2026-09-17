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
// its own <Overlay> — would duplicate the escape handling, scroll lock,
// focus restore, and z-index in every caller, and would let two overlays open
// at once. Callers here only ever say WHAT to show, never how to present it:
//
//   const { openOverlay } = useOverlay();
//   <MediaObject onClick={() => openOverlay({ src, title })} />
//
// Nothing about this is MediaObject-specific: a Button, a Card, or a bare
// <button> triggers it identically.

const OverlayContext = createContext(null);

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) {
    throw new Error("useOverlay must be used inside <OverlayProvider>");
  }
  return ctx;
}

// Fast enough to feel responsive to a click, slower than an instant cut.
// Not one of the Figma-derived reveal timings — this is chrome, not content.
const OVERLAY_DURATION = 0.3;

export function OverlayProvider({ children }) {
  const [payload, setPayload] = useState(null);

  const openOverlay = useCallback((next) => setPayload(next), []);
  const closeOverlay = useCallback(() => setPayload(null), []);

  // Memoised so consumers don't re-render on every provider render.
  const value = useMemo(
    () => ({ openOverlay, closeOverlay, isOverlayOpen: Boolean(payload) }),
    [openOverlay, closeOverlay, payload]
  );

  return (
    <OverlayContext.Provider value={value}>
      {children}
      <Overlay payload={payload} onClose={closeOverlay} />
    </OverlayContext.Provider>
  );
}

function Overlay({ payload, onClose }) {
  // `payload` clears the instant close is requested, but the exit animation
  // still needs its src for a few hundred ms — so the last payload is held
  // here until the tween finishes. Same mount-through-exit pattern the
  // PixelCurtain uses for its phases.
  const [rendered, setRendered] = useState(null);
  const isOpen = Boolean(payload);

  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const videoRef = useRef(null);
  const closeRef = useRef(null);
  const lastFocusedRef = useRef(null);

  // Adjusted during render rather than in an effect. Setting state in an
  // effect body makes every open cost a second render pass, which
  // react-hooks/set-state-in-effect (new in v7) flags; React handles a
  // render-phase setState by re-running this component before it commits,
  // so the held-payload behaviour is identical with one fewer commit.
  // https://react.dev/learn/you-might-not-need-an-effect
  if (payload && payload !== rendered) {
    setRendered(payload);
  }

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

  // `embed` is a third payload shape, for videos hosted off-site (Vimeo,
  // YouTube). A player URL can't feed <video> — it serves an HTML page, not a
  // media file — so it needs an <iframe>. Everything around it (backdrop,
  // escape, focus restore, exit tween) is identical; only the player swaps.
  // Unmounting the iframe on close is what stops playback, same as <video>.
  //
  // `content` is the fourth shape and the only non-video one: any React node,
  // for things that are interactive rather than playable (the /about retail
  // map). It exists so a second modal host — with its own copy of the escape
  // key handling, scroll lock, focus restore and z-index — never has to be
  // written. Unmounting on close still does the teardown: the map's own
  // effect cleanup runs `map.remove()` and frees the WebGL context, exactly
  // as unmounting <video> stops playback.
  const { embed, content } = rendered;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={rendered.title ?? (content ? "Dialog" : "Video player")}
      className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center"
    >
      {/* A real <button>, not a div with onClick: it gives the backdrop a
          keyboard-reachable, screen-reader-announced way to dismiss, and
          satisfies jsx-a11y without a bespoke keydown handler. */}
      <button
        ref={backdropRef}
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 size-full cursor-default bg-surface-default/75 backdrop-blur-sm"
      />

      <div ref={panelRef} className="relative w-full">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-10 top-10 p-200 font-narrow text-base uppercase text-neutral-0 hover:text-primary-300"
        >
          <span className="sr-only">Close</span>
          {/* Decorative: the adjacent sr-only "Close" span already gives the
              button its accessible name. */}
          <img src="/icons/close.svg" alt="" width={24} height={24} />
        </button>

        {/* Players are top-aligned and sized by their own aspect ratio, so
            they only need the top inset. `content` instead STRETCHES: the
            same 8dvh is mirrored onto the bottom and the row switches to
            items-stretch, which hands the child an exact height (100 - 16dvh)
            to fill rather than a ceiling to overflow. */}
        <div
          className={`flex h-dvh justify-center pt-[8dvh] ${
            content ? "items-stretch pb-[8dvh]" : "items-start"
          }`}
        >
        {content ? (
          // min-h-0 undoes the flex item's `min-height: auto`, which would
          // otherwise let a tall child (the map's intrinsic 16/9 box) push
          // this past the height it was just given — the exact overflow the
          // stretch is here to prevent.
          <div className="min-h-0 w-[90vw]">{content}</div>
        ) : embed ? (
          <iframe
            src={embed}
            title={rendered.title ?? "Video player"}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            
            className="block aspect-[16/10] h-auto max-h-[80dvh] w-[90vw] rounded-md bg-surface-default shadow-lg"
          />
        ) : (
          <video
            ref={videoRef}
            poster={rendered.poster}
            controls
            autoPlay
            playsInline
            className="block aspect-video w-full rounded-md"
            {...(sources ? {} : { src: rendered.src })}
          >
            {sources?.webm ? (
              <source src={sources.webm} type="video/webm" />
            ) : null}
            {sources?.mp4 ? <source src={sources.mp4} type="video/mp4" /> : null}
          </video>
        )}
        </div>
      </div>
    </div>
  );
}
