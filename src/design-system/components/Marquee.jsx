import { useLayoutEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "../animation";

// One infinite horizontal row, driven ENTIRELY by scroll position. There is no
// autoplay and no clock: the row's x is a function of where the page is, so it
// is frozen whenever the page is still, and it walks backwards when the user
// scrolls up. Both of those fall out of a scrubbed ScrollTrigger — see the
// tween below — rather than out of any direction/velocity bookkeeping here.

// Row px travelled per px scrolled. THE "somewhat slow" DIAL. At 0.35 a full
// pass of the row through the viewport moves it roughly one and a half logo
// tiles: clearly alive, never a blur. Raise toward 1 for a livelier row, drop
// toward 0.2 for near-static.
const SCROLL_RATIO = 0.35;

// Seconds the row takes to catch up to the scroll position — the same dial as
// ImageCard's SCRUB_DAMPING. `true` would weld it to the scrollbar, which
// feels mechanical on top of ScrollSmoother; this lets it settle. The cost is
// that the row eases for ~half a second after the wheel stops rather than
// halting dead.
const SCRUB_DAMPING = 0.5;

// Scale/400. A number, not a class: the loop geometry needs the value.
const GAP = 32;

// Mirrors the grid this replaced (`sm:grid-cols-3 md:grid-cols-4
// lg:grid-cols-5`), resolved in JS because tile width is a measurement, not a
// class. First matching max width wins; wider containers fall through to 5.
const BREAKPOINTS = [
  { maxWidth: 768, perView: 3 },
  { maxWidth: 1024, perView: 4 },
];
const PER_VIEW_DEFAULT = 5;

function resolvePerView(containerWidth) {
  const match = BREAKPOINTS.find(({ maxWidth }) => containerWidth < maxWidth);
  return match ? match.perView : PER_VIEW_DEFAULT;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * An infinitely looping row of equal-width items.
 *
 * @param {Array}    items         one row's data; its length defines the wrap
 *                                 distance, so every item MUST render at the
 *                                 same width
 * @param {Function} children      (item, index, isClone) => ReactNode. `isClone`
 *                                 is true for the duplicated copies, which are
 *                                 decorative repeats — render them with `alt=""`.
 * @param {string}   direction     "left" | "right". The BASE direction, i.e. the
 *                                 way the row travels on scroll-down; scroll-up
 *                                 is its mirror, handled by scrub.
 * @param {number}   ratio         row px travelled per px scrolled
 * @param {?number}  itemsPerView  null derives it from the container width
 * @param {number}   gap           gutter between items, in px
 */
export default function Marquee({
  items,
  children,
  direction = "left",
  ratio = SCROLL_RATIO,
  itemsPerView = null,
  gap = GAP,
  className = "",
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);

  // Read once, at mount: the whole component renders differently under reduced
  // motion, so this is a render input, not something the tween checks.
  const [reduced] = useState(prefersReducedMotion);

  // Tile width and copy count both depend on the container width, so they are
  // measured state rather than constants.
  const [metrics, setMetrics] = useState({ perView: 0, tile: 0, copies: 1 });

  // Layout effect, not effect: the first measurement has to land before paint
  // or the row flashes at the wrong tile width.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const measure = () => {
      const containerWidth = root.clientWidth;
      if (!containerWidth || !items.length) return;

      const perView = itemsPerView ?? resolvePerView(containerWidth);
      // The width the CSS grid this replaced gave a logo, so logo scale is
      // unchanged.
      const tile = (containerWidth - gap * (perView - 1)) / perView;
      const setWidth = items.length * (tile + gap);

      // The `+ 1` is load-bearing: at the far end of the wrap range the
      // content starts a whole set to the left, so there still has to be a
      // container's worth of items covering the viewport.
      const copies = reduced
        ? // Reduced motion renders ONE set, not the measured count with the
          // tween skipped — otherwise the static fallback would show every
          // logo two or three times over, which is worse than the grid it
          // replaced.
          1
        : Math.max(2, Math.ceil(containerWidth / setWidth) + 1);

      setMetrics((previous) =>
        previous.perView === perView &&
        previous.tile === tile &&
        previous.copies === copies
          ? previous
          : { perView, tile, copies }
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [gap, itemsPerView, items.length, reduced]);

  const { tile, copies } = metrics;
  const step = tile + gap;

  useGSAP(
    () => {
      if (reduced || !tile || !items.length) return;

      const root = rootRef.current;
      const track = trackRef.current;

      // Exactly one content set. This is only exact because the gutter lives
      // INSIDE each item box and the track carries no `gap` — a track of c
      // copies × n items has c·n − 1 gaps, not c·n, so a `gap`-based track
      // would put the wrap boundary a gutter width off and jump once a loop.
      const setWidth = items.length * step;
      const wrapX = gsap.utils.wrap(-setWidth, 0);
      const sign = direction === "left" ? 1 : -1;

      // Scroll px over which the trigger is active, so `ratio` means the same
      // thing at every viewport size. Function-based, and paired with
      // `invalidateOnRefresh` below, because it is read too early otherwise:
      // the logo SVGs carry no intrinsic size until they decode, so the row's
      // height — and therefore this span — is still 0 when the tween is built.
      // Baking that in would silently shrink `ratio` to a load-timing-dependent
      // fraction of what it is documented to be.
      const scrollSpan = () => window.innerHeight + root.offsetHeight;

      gsap.fromTo(
        track,
        { x: 0 },
        {
          // The endpoint is arbitrary — the wrap below, not this value, is
          // what defines the loop.
          x: () => -scrollSpan() * ratio * sign,
          // Scrub already maps progress linearly to scroll; any other ease
          // would double-apply a curve.
          ease: "none",
          // What makes it infinite: the unbounded x is folded back into
          // [-setWidth, 0) every frame. Every copy is identical, so
          // x = -setWidth is pixel-identical to x = 0 and the fold is
          // invisible. In px, not xPercent — `wrap` has to share units with
          // the measured setWidth.
          modifiers: {
            x: gsap.utils.unitize((value) => wrapX(parseFloat(value)), "px"),
          },
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "bottom top",
            // A scrubbed tween's progress IS the scroll position, so the row
            // stops when scrolling stops and reverses when scrolling reverses.
            // That is the whole mechanism: no velocity sampling, no direction
            // state, and no play/pause — a scrubbed tween outside its range
            // does not advance, so there is nothing to pause.
            scrub: SCRUB_DAMPING,
            // Re-evaluates the function-based endpoint above on every refresh,
            // which is when the row's real height finally exists.
            invalidateOnRefresh: true,
          },
        }
      );
    },
    {
      scope: rootRef,
      dependencies: [direction, ratio, copies, step, items.length, reduced],
      // Load-bearing: useGSAP defers its cleanup to unmount when there are
      // dependencies, so without this a re-measure would ADD a tween and a
      // ScrollTrigger to the row rather than replacing them. The stale tweens
      // keep scrubbing the same track with the pre-resize setW baked into
      // their wrap modifier, which is exactly the visible jump at the fold
      // that the measured geometry exists to prevent.
      revertOnUpdate: true,
    }
  );

  return (
    <div ref={rootRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={trackRef}
        className="flex"
        // Measured geometry can't be a Tailwind class: an arbitrary value is
        // an eslint error in this repo, and these numbers only exist at
        // runtime anyway. Same reasoning as HeadingReveal's LINE_BLEED.
        style={{ willChange: "transform" }}
      >
        {Array.from({ length: copies }, (_, copy) =>
          items.map((item, index) => (
            <div
              key={`${copy}-${index}`}
              className="shrink-0 grow-0"
              // The gutter is padding on the item, not a gap on the track, so
              // n items occupy exactly n · step — see setWidth above.
              style={{ width: step, paddingRight: gap }}
              // Copies past the first are decorative repeats of content the
              // first copy already announced.
              aria-hidden={copy > 0 ? "true" : undefined}
            >
              {children(item, index, copy > 0)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
