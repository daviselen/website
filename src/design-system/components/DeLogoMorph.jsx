import { useId, useRef, useState } from "react";
import DeLogo from "./DeLogo.jsx";
import {
  gsap,
  useGSAP,
  EASE_REVEAL,
  REVEAL_DURATION,
  LINE_DELAY,
} from "../animation.js";

// One-shot header intro, morph variant of <DeLogoIntro />: the full
// "DAVISELEN" wordmark (/icons/de-logo-h-stroked.svg, inlined below as JSX so
// GSAP can target individual letters) plays LEN-out -> AVIS-out -> morph, then
// crossfades to the real static <DeLogo /> ("DE" monogram,
// /icons/de-logo-white.svg).
//
// Where DeLogoIntro condenses with plain translate/scaleX, this version hands
// the kept frame/D/E paths to MorphSVGPlugin and lets their outlines interpolate
// into the monogram's own outlines. Registration lives in ../animation.js — an
// unregistered plugin doesn't throw, it just makes `morphSVG:` a no-op, so the
// import of this module is what guarantees the tween does anything.
//
// AVIS and LEN are NOT morphed — they have no counterpart in the monogram, so
// they drop through the shared baseline clip and vanish (a morph needs a target
// shape; there is none to morph them into).
//
// Both this SVG and de-logo-white.svg share a 132px intrinsic height, so sizing
// everything off `h-16` scales the letterforms identically in both files. The
// wordmark's rendered width at h-16 is ~168px (346 * 64/132), so the root slot
// is reserved at the closest named spacing token that comfortably contains it
// (`w-2300` = 184px) and never resizes.
//
// No `position: absolute` anywhere: the root is a single-cell CSS grid (`grid`,
// one implicit row/column sized by the root's own `h-16 w-2300`) and both the
// animating SVG and the final <DeLogo /> wrapper are placed into that same cell
// with `col-start-1 row-start-1`, so they occupy identical in-flow space and
// simply overlap for the crossfade — nothing in the header (nav links, "Let's
// Chat") ever reflows, on load or at hand-off.
const HOLD = REVEAL_DURATION;

// Where the falling letters get cut off, in this SVG's own user units. The
// seven of them sit on one baseline, so this is ONE number and one <clipPath>
// (defined once in <defs>, referenced by both letter groups) rather than seven
// per-letter clips — each letter dissolves into the line its own bottom rests
// on, and the shared line is the only geometry that has to be right.
//
// 102.362 is the lowest coordinate across all seven paths: six bottom out at
// 101.551, the S overshoots to 102.362 on its terminal curve. Taking the max
// rather than the common 101.551 is deliberate — clipping at 101.551 would
// shave a flat off the resting S before anything moves. The other six start
// 0.811 units (~0.4rendered px at h-16) above the line, i.e. they begin eating
// into it immediately.
//
// The clip CANNOT be a CSS `clip-path: inset()` like the rest of the codebase
// uses: on an SVG element that resolves against the element's own fill-box and
// travels with its transform, so it would ride down with the letter instead of
// staying put. An SVG <clipPath> with a <rect> is fixed in the group's user
// space, which is what a mask-at-the-baseline needs.
const LETTER_CLIP_BOTTOM = 102.362;

// Highest coordinate across the same seven paths (again the S, at 29.6433 —
// the others start at 30.5696).
const LETTER_TOP = 29.6433;

// How far each letter travels down. Derived, not chosen: it's exactly the
// distance that carries a letter's top edge to the clip line, so the tween
// finishes at the same instant the last sliver disappears. Nothing moves after
// it can no longer be seen, and no dead air opens up before the morph beat.
const DROP_DISTANCE = LETTER_CLIP_BOTTOM - LETTER_TOP + 5;

// Gap between one letter starting its drop and the next. LINE_DELAY is the
// existing "offset between sequential elements" token (3.847 frames @ 30fps),
// which is what this is — the same beat the stacked heading lines use, applied
// to letters instead. Seven letters drop, so the last one starts 6 * LINE_DELAY
// (~0.77s) after the first and the whole exit runs ~1.64s, close to the two
// back-to-back group tweens it replaces.
const DROP_STAGGER = LINE_DELAY;

// 1. Physical & Spatial Constants
const GRAVITY = 9.80665; // m/s^2
const M_PER_UNIT = 0.01; // 1 SVG unit = 1 cm (visual spatial scale)

const DROP_UNITS = LETTER_CLIP_BOTTOM - LETTER_TOP; // ~72.72 units
const LIFT_UNITS = 6; // ~3px subtle apex lift upwards

// 2. Exact Kinematic Durations under constant g
// Rise time to apex: t1 = sqrt(2 * h_up / g)
const t1 = Math.sqrt((2 * (LIFT_UNITS * M_PER_UNIT)) / GRAVITY); 
// Fall time from apex: t2 = sqrt(2 * h_total / g)
const t2 = Math.sqrt((2 * ((LIFT_UNITS + DROP_UNITS) * M_PER_UNIT)) / GRAVITY); 

const TOTAL_PHYSICAL_DURATION = t1 + t2; // ~0.51s total trajectory

// 3. Custom Continuous Gravity Ease: y(t) = 0.5*g*t^2 - g*t1*t
// Returns normalized displacement fraction E(p) where p in [0, 1]
const gravityTrajectoryEase = (p) => {
  const t = p * TOTAL_PHYSICAL_DURATION;
  const posMeters = 0.5 * GRAVITY * t * t - GRAVITY * t1 * t;
  return posMeters / (DROP_UNITS * M_PER_UNIT);
};

// The morph targets below are de-logo-white.svg's own path data, rescaled from
// its viewBox="0 0 81 81" into this SVG's viewBox="0 0 346 132". Both files
// render at a 132px intrinsic height (see the header comment), so the factor is
// exactly 132/81 and every coordinate was multiplied through by it — the scale
// is BAKED INTO THE PATH DATA on purpose rather than applied as a `transform`
// on a wrapper <g>, because MorphSVGPlugin interpolates raw `d` coordinates and
// would otherwise morph to the untransformed (81-unit, top-left) geometry and
// only then apply the transform, which reads as a shape that shrinks into the
// corner before snapping back.
//
// Passing the data as strings, not as refs to hidden <path> elements, for the
// same reason: nothing to keep in sync and nothing extra in the DOM. GSAP
// accepts a path-data string as `morphSVG` directly.
//
// Because these ARE the monogram's coordinates, the morph's end state is
// pixel-identical to the static <DeLogo /> underneath, so the closing crossfade
// has nothing left to hide.

// de-logo-white.svg draws its frame as a STROKED <rect> (x=2 y=1.5 w=77 h=77,
// stroke-width=3); the wordmark's frame is a FILLED two-subpath outline. A
// stroke can't morph into a fill, so the rect is restated here as the same
// outer-ring-plus-hole outline the source path uses: the 3-unit stroke sits
// centered on the rect's edge, giving outer bounds x 0.5..80.5 / y 0..80 and
// inner bounds x 3.5..77.5 / y 3..77, all then scaled by 132/81.
//
// Subpath order and direction deliberately mirror the source path (outer ring
// starting bottom-right and running leftward, hole starting bottom-left and
// running rightward). MorphSVGPlugin pairs subpaths in order, so matching the
// winding is what keeps the ring from turning inside out mid-tween.
const FRAME_TARGET =
  "M131.185 130.37H0.815V0H131.185V130.37ZM5.704 125.481H126.296V4.889H5.704V125.481Z";

// The monogram's own D and E, same 132/81 rescale. Each keeps the subpath count
// of the wordmark letter it replaces (D: 2, E: 1) — they're the same letterforms
// at a different size, so the morph resolves to a clean scale-and-slide with no
// `shapeIndex` tuning needed.
const D_TARGET =
  "M56.755 87.1C56.755 91.608 55.841 93.226 53.212 93.226H49.097V35.434H53.212C55.841 35.434 56.755 37.167 56.755 41.675V87.1ZM53.212 28.961H42.695V99.815H53.212C60.299 99.815 63.042 95.307 63.042 85.829V42.831C63.042 33.353 60.299 28.961 53.212 28.961Z";
const E_TARGET =
  "M70.641 99.815H87.673V93.689H77.042V66.411H84.815V60.285H77.042V34.971H87.673V28.961H70.641V99.815Z";

export default function DeLogoMorph({ className = "size-16", onComplete }) {
  // Lazy initializer so this resolves during the very first render, before
  // paint — matching useSmoothScroll's reduced-motion check (same matchMedia
  // query), but synchronous here so a reduced-motion visitor never sees the
  // animated markup at all, not even for one frame.
  const [reducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [showIntro, setShowIntro] = useState(!reducedMotion);

  // SVG <clipPath> is referenced by id, and ids are document-global — a second
  // instance (a mobile nav, a style page rendering the logo twice) would emit a
  // duplicate and both groups would resolve to whichever came first. useId is
  // the cheap guard against that.
  const clipId = useId();

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

      // The letters drop one at a time, L-E-N then A-V-I-S — no opacity
      // anywhere on them. They stay fully opaque the whole way down and are
      // eaten by the shared baseline <clipPath>, so each one reads as sinking
      // through the line it was sitting on rather than dissolving in place.
      //
      // Tweening the group CHILDREN (each <path> is one letter), not the two
      // <g>s, is what makes a per-letter stagger possible — a group can only
      // move as one block. They're passed as a single flat array in exit order
      // rather than as two staggered tweens so the L->S cadence is one evenly
      // spaced run; two tweens would restart the stagger clock at A and put a
      // seam in the middle. Array order, not DOM order, drives the stagger, so
      // LEN leading despite AVIS coming first in the markup costs nothing.
      tl.to(
        [...lenRef.current.children, ...avisRef.current.children],
        {
          y: DROP_UNITS,
          duration: TOTAL_PHYSICAL_DURATION,
          ease: gravityTrajectoryEase, // Single continuous parabola
          stagger: DROP_STAGGER,
        },
        HOLD
      )
        // The morph beat: kept "D" and "E" and the frame around them all
        // interpolate into the monogram's outlines at the same time.
        .to(dRef.current, {
          morphSVG: D_TARGET,
          duration: REVEAL_DURATION,
          ease: EASE_REVEAL,
        })
        .to(
          eRef.current,
          {
            morphSVG: E_TARGET,
            duration: REVEAL_DURATION,
            ease: EASE_REVEAL,
          },
          "-=1"
        )
        .to(
          frameRef.current,
          {
            morphSVG: FRAME_TARGET,
            duration: REVEAL_DURATION,
            ease: EASE_REVEAL,
          },
          "<"
        )
        // Hand off to the real <DeLogo /> img, already mounted underneath at
        // opacity 0. No `repeat`/`yoyo` on this timeline: it has to reach
        // onComplete for the hand-off above to fire, or the static logo stays
        // at opacity 0 forever behind a wordmark that never settles.
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
          {/* One clip for all seven falling letters — they share a baseline,
              so they share this line. Deliberately NOT wrapped around the
              frame or the kept D/E: the frame runs to y=132 and would lose its
              bottom edge, and the D/E morph downward to y=99.815 with no need
              to be cut at all. */}
          <defs>
            <clipPath id={clipId}>
              <rect x="0" y="0" width="346" height={LETTER_CLIP_BOTTOM} />
            </clipPath>
          </defs>
          <path
            ref={frameRef}
            fill="currentColor"
            d="M346.116 132.121H0V0H346.116V132.121ZM6.73423 125.405H339.266V6.71603H6.73423V125.405Z"
          />
          {/* D — kept, morphs into the "D" of the final DE monogram. */}
          <path
            ref={dRef}
            fill="currentColor"
            d="M44.5852 88.8137C44.5852 93.3297 43.6563 94.9508 40.9858 94.9508H36.806V37.054H40.9858C43.6563 37.054 44.5852 38.7909 44.5852 43.3069V88.8137ZM40.9858 30.5696H30.304V101.551H40.9858C48.1845 101.551 50.9711 97.0351 50.9711 87.54V44.4648C50.9711 34.9697 48.1845 30.5696 40.9858 30.5696Z"
          />
          {/* AVIS — drops through the baseline last (see the tween's array
              order; markup order and exit order are independent). */}
          <g ref={avisRef} clipPath={`url(#${clipId})`}>
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
          {/* E — kept, morphs into the "E" of the final DE monogram. */}
          <path
            ref={eRef}
            fill="currentColor"
            d="M201.911 101.551H219.211V95.414H208.413V68.0867H216.308V61.9496H208.413V36.5908H219.211V30.5696H201.911V101.551Z"
          />
          {/* LEN — drops through the baseline first, same shared clip. */}
          <g ref={lenRef} clipPath={`url(#${clipId})`}>
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
      <span
        ref={finalRef}
        className="col-start-1 row-start-1 justify-self-start opacity-0"
      >
        <DeLogo className={className} />
      </span>
    </span>
  );
}
