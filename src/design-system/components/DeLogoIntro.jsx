import { useRef, useState } from "react";
import DeLogo from "./DeLogo.jsx";
import { gsap, useGSAP, EASE_REVEAL, REVEAL_DURATION } from "../animation.js";

// One-shot header intro: the full "DAVISELEN" wordmark
// (/icons/de-logo-h-stroked.svg, inlined below as JSX so GSAP can target
// individual letters) plays AVIS-out -> LEN-out -> condense, then crossfades
// to the real static <DeLogo /> ("DE" monogram, /icons/de-logo-white.svg).
//
// The wordmark's 10 paths (frame, D, A, V, I, S, E, L, E, N — see
// de-logo-h-stroked.svg) are regrouped here into the buckets the timeline
// needs: `frame` (squeezes), the kept D/E letters (both translate into their
// de-logo-white.svg-derived positions), and the two fading letter groups
// (AVIS, LEN). No path morphing — every letterform is already its own path,
// so "condensing" is plain opacity/translate/scaleX, no MorphSVGPlugin
// needed.
//
// Both this SVG and de-logo-white.svg share a 132px intrinsic height, so
// sizing everything off `h-16` scales the D/E letterforms identically in
// both files — that's what makes the final crossfade land without a size
// pop. The wordmark's rendered width at h-16 is ~168px
// (346 * 64/132), so the root slot is reserved at the closest named spacing
// token that comfortably contains it (`w-2300` = 184px) and never resizes.
//
// No `position: absolute` anywhere: the root is a single-cell CSS grid
// (`grid`, one implicit row/column sized by the root's own `h-16 w-2300`)
// and both the animating SVG and the final <DeLogo /> wrapper are placed
// into that same cell with `col-start-1 row-start-1`, so they occupy
// identical in-flow space and simply overlap for the crossfade — nothing in
// the header (nav links, "Let's Chat") ever reflows, on load or at
// hand-off.
const HOLD = REVEAL_DURATION * 0.3;

// Derived (not eyeballed) from the two source files' actual coordinates, so
// the animated end state lines up with the static <DeLogo /> it crossfades
// into instead of relying on the crossfade to paper over a bad guess.
//
// de-logo-white.svg is viewBox="0 0 81 81"; the wordmark below is
// viewBox="0 0 346 132". Both share a 132px intrinsic render height (see the
// header comment), so the scale factor from the square's coordinate space
// into the wordmark's is exactly 132/81:
const SCALE_TO_WORDMARK = 132 / 81;

// de-logo-white.svg's frame <rect> is width="77" (x="2" to x="79") ->
// 77 * (132/81) ~= 125.48 wordmark units wide. (Previously guessed at 90.)
const FRAME_TARGET_WIDTH = 77 * SCALE_TO_WORDMARK;

// de-logo-white.svg's D path spans x~26.20..38.69 and its E path spans
// x~43.35..53.80. Normalized into wordmark units that's D~42.70..63.04 and
// E~70.64..87.67. The wordmark's own kept D (x~30.30..50.97) and kept E
// (x~201.91..219.21) need a plain translate (no rescale — the letterform
// widths already match within ~2%) to land on those targets; the deltas
// below are each target's center minus the wordmark letter's own center.
// (Previously D didn't move at all and E was eyeballed at -141, which left
// a visible pop at the handoff crossfade.)
const D_TRANSLATE_X = 52.87 - 40.64; // ~= 12.23
const E_TRANSLATE_X = 79.16 - 210.56; // ~= -131.4

export default function DeLogoIntro({ className = "size-16", onComplete }) {
  // Lazy initializer so this resolves during the very first render, before
  // paint — matching useSmoothScroll's reduced-motion check (same
  // matchMedia query), but synchronous here so a reduced-motion visitor
  // never sees the animated markup at all, not even for one frame.
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [showIntro, setShowIntro] = useState(!reducedMotion);

  const rootRef = useRef(null);
  const svgRef = useRef(null);
  const frameRef = useRef(null);
  const avisRef = useRef(null);
  const lenRef = useRef(null);
  const dRef = useRef(null);
  const eRef = useRef(null);
  const finalRef = useRef(null);

  useGSAP(
    () => {
      // Reduced motion never builds a timeline at all — the component
      // renders the static <DeLogo /> straight away (see below) and this
      // effect has nothing to animate.
      if (reducedMotion) return;

      const tl = gsap.timeline({
        onComplete: () => {
          setShowIntro(false);
          onComplete?.();
        },
      });

      tl.to(
        avisRef.current,
        { opacity: 0, duration: REVEAL_DURATION, ease: EASE_REVEAL },
        HOLD
      )
        .to(lenRef.current, {
          opacity: 0,
          duration: REVEAL_DURATION,
          ease: EASE_REVEAL,
        })
        // Kept "D" and "E" both shift into their de-logo-white.svg-derived
        // positions and the frame squeezes around them at the same time —
        // the "condense" beat.
        .to(dRef.current, {
          x: D_TRANSLATE_X,
          duration: REVEAL_DURATION,
          ease: EASE_REVEAL,
        })
        .to(
          eRef.current,
          {
            x: E_TRANSLATE_X,
            duration: REVEAL_DURATION,
            ease: EASE_REVEAL,
          },
          "<"
        )
        .to(
          frameRef.current,
          {
            scaleX: FRAME_TARGET_WIDTH / 346,
            transformOrigin: "left center",
            duration: REVEAL_DURATION,
            ease: EASE_REVEAL,
          },
          "<"
        )
        // Hand off to the real <DeLogo /> img, already mounted underneath
        // at opacity 0.
        .to(svgRef.current, {
          opacity: 0,
          duration: REVEAL_DURATION,
          ease: EASE_REVEAL,
        })
        .to(
          finalRef.current,
          { opacity: 1, duration: REVEAL_DURATION, ease: EASE_REVEAL },
          "<"
        );
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  if (reducedMotion) {
    return <DeLogo className={className} />;
  }

  return (
    <span ref={rootRef} className="grid h-16 w-2300">
      {showIntro && (
        <svg
          ref={svgRef}
          viewBox="0 0 346 132"
          className="col-start-1 row-start-1 h-16 w-auto justify-self-start text-neutral-0"
          aria-hidden="true"
          focusable="false"
        >
          <path
            ref={frameRef}
            fill="currentColor"
            d="M346.116 132.121H0V0H346.116V132.121ZM6.73423 125.405H339.266V6.71603H6.73423V125.405Z"
          />
          {/* D — kept, becomes the "D" in the final DE monogram. */}
          <path
            ref={dRef}
            fill="currentColor"
            d="M44.5852 88.8137C44.5852 93.3297 43.6563 94.9508 40.9858 94.9508H36.806V37.054H40.9858C43.6563 37.054 44.5852 38.7909 44.5852 43.3069V88.8137ZM40.9858 30.5696H30.304V101.551H40.9858C48.1845 101.551 50.9711 97.0351 50.9711 87.54V44.4648C50.9711 34.9697 48.1845 30.5696 40.9858 30.5696Z"
          />
          {/* AVIS — fades out first. */}
          <g ref={avisRef}>
            <path
              fill="currentColor"
              d="M71.0585 80.824L74.4257 47.9386L76.98 80.824H71.0585ZM71.0585 30.5696L63.0471 101.551H68.9686L70.478 87.1926H77.5606L78.6055 101.551H85.3398L77.7928 30.5696H71.0585Z"
            />
            <path
              fill="currentColor"
              d="M105.426 84.4136L101.362 30.5696H94.6282L101.943 101.551H108.793L116.689 30.5696H110.651L105.426 84.4136Z"
            />
            <path
              fill="currentColor"
              d="M135.846 30.5696H129.344V101.551H135.846V30.5696Z"
            />
            <path
              fill="currentColor"
              d="M155.933 41.4543C155.933 37.6331 157.674 35.7804 160.461 35.7804C162.783 35.7804 164.06 37.7489 164.06 42.0332V52.1073H170.098V41.8016C170.098 34.5066 166.383 29.6433 160.461 29.6433C152.914 29.6433 149.663 35.5488 149.663 43.6543C149.663 50.9493 154.307 61.7181 157.791 68.7815C161.622 76.7713 164.06 83.3715 164.06 90.5507C164.06 94.4877 162.783 96.6878 159.416 96.6878C156.978 96.6878 155.236 94.0245 155.236 90.5507V80.5925H149.083V90.3191C149.083 97.4983 153.03 102.362 159.648 102.362C163.944 102.362 170.214 99.8142 170.214 88.698C170.214 81.2872 166.847 73.0659 162.783 64.3814C158.487 55.2337 155.933 49.6756 155.933 41.4543Z"
            />
          </g>
          {/* E — kept, becomes the "E" in the final DE monogram. */}
          <path
            ref={eRef}
            fill="currentColor"
            d="M201.911 101.551H219.211V95.414H208.413V68.0867H216.308V61.9496H208.413V36.5908H219.211V30.5696H201.911V101.551Z"
          />
          {/* LEN — fades out second. */}
          <g ref={lenRef}>
            <path
              fill="currentColor"
              d="M239.182 30.5698H232.68V101.551H249.632V95.0668H239.182V30.5698Z"
            />
            <path
              fill="currentColor"
              d="M262.635 101.551H279.935V95.414H269.021V68.0867H276.916V61.9496H269.021V36.5908H279.935V30.5696H262.635V101.551Z"
            />
            <path
              fill="currentColor"
              d="M315.581 30.5696H309.543V78.6239L307.569 67.6235L299.442 30.5696H293.172V101.551H299.209V54.0757L301.416 64.8445L310.82 101.551H315.581V30.5696Z"
            />
          </g>
        </svg>
      )}
      {/* Real static mark, mounted from the start at opacity 0 so the
          crossfade above has something to fade into — never re-mounted, so
          there's no img decode/flash at hand-off. */}
      <span
        ref={finalRef}
        className="col-start-1 row-start-1 justify-self-start opacity-0"
      >
        <DeLogo className={className} />
      </span>
    </span>
  );
}
