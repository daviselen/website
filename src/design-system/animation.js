// Single source for GSAP plugin registration and the shared motion tokens.
// Before this, eight files each re-declared `26.153 / 30` and
// `[0.8, 0, 0.2, 1]` locally, so retiming the site meant editing all eight.
//
// The odd-looking fractions are frame counts over 30fps, straight off the
// Figma prototype timings — kept in that form on purpose so they stay
// checkable against the design file instead of being rounded to decimals.
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { CustomEase } from "gsap/CustomEase";

// Registration is idempotent, but doing it here means a component only has
// to import this module — it can't forget a plugin and fail at runtime.
//
// ScrollSmoother ships in the public `gsap` package as of 3.13 (it was a Club
// plugin before Webflow made the whole library free), so this is a plain
// import off the dependency already in package.json — no extra install, and
// no third-party smooth-scroll library to keep in sync with ScrollTrigger.
gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother, CustomEase);

// ScrollTrigger caches every start/end as a pixel offset when it first
// measures, and auto-refreshes on resize and on window "load". On this app
// "load" is useless: the bundle is a module, so React hasn't mounted yet when
// it fires — measured on the home page, `load` AND `document.fonts.ready`
// both resolve at ~60ms against a still-empty body, while the real layout
// only exists from ~500ms. Every trigger therefore cached offsets from a
// zero-height page, off by the height of everything above it (~670px for the
// first portfolio card, i.e. its heading).
//
// Toggling states that was survivable — a reveal firing early still reveals.
// Pinning is not: a pin whose start is 670px early yanks the element from
// flow into position:fixed, so the card visibly teleports up the page.
//
// Chasing that with a timer or a rAF-after-mount doesn't hold — it just moves
// the guess. Instead, re-measure whenever the document's height actually
// changes, which is the observable event every one of those causes shares:
// React mounting, Knockout swapping in, media resolving.
//
// Safe to hang off body height specifically because nothing this site
// animates changes it. Verified across the whole home page scroll: pinned
// cards resize inside a pin-spacer whose height ScrollTrigger holds fixed, so
// document height stays put (11577px at every scroll offset) and this never
// fires mid-pin. The height comparison makes it self-limiting anyway — a
// refresh that doesn't change the height can't schedule another one.
if (typeof window !== "undefined") {
  let lastHeight = 0;
  let queued = false;

  const refresh = () => {
    queued = false;
    const height = document.body.scrollHeight;
    if (height === lastHeight) return;
    lastHeight = height;
    ScrollTrigger.refresh();
  };

  // Coalesce to one refresh per frame: a font swap and an image landing in
  // the same frame are one layout change, not two.
  const queueRefresh = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(refresh);
  };

  new ResizeObserver(queueRefresh).observe(document.body);
  window.addEventListener("load", queueRefresh);
  document.fonts?.ready.then(queueRefresh);
}

// 26.153 frames @ 30fps — the standard clip-path reveal.
export const REVEAL_DURATION = 26.153 / 30;

// 3.847 frames @ 30fps — offset between stacked heading lines.
export const LINE_DELAY = 3.847 / 30;

// The curve motion expressed as [0.8, 0, 0.2, 1]. GSAP has no named ease
// with this shape, so it's rebuilt as a CustomEase from the same two
// control points — identical curve, different notation.
export const EASE_REVEAL = CustomEase.create("deReveal", "M0,0 C0.8,0 0.2,1 1,1");

// motion's "easeOut" keyword is cubic-bezier(0, 0, 0.58, 1) — CSS ease-out.
// GSAP's "power1.out" is close but not the same curve, so this is rebuilt
// exactly rather than approximated.
export const EASE_OUT = CustomEase.create("deEaseOut", "M0,0 C0,0 0.58,1 1,1");

// Card-grid stagger, shared by Proof and NewsAwards — both previously
// declared byte-identical `container`/`item` variant objects locally.
const STAGGER_STEP = 0.25; // delay between each item
const ITEM_DURATION = 0.625;
const ITEM_OFFSET_Y = 160;

// Only the Y axis is scrubbed; the fade stays on the clock. That split is
// load-bearing, not stylistic.
//
// Each card's heading runs its own <HorizontalReveal /> — a 0.87s clip-path
// wipe on a separate `once: true` ScrollTrigger, firing on the wall clock.
// When the fade was scrubbed too, the card's opacity was stretched across a
// whole viewport of scrolling while that wipe still took its fixed 0.87s, so
// the wipe ran to completion behind a card that was still translucent.
// Measured mid-scroll: card 3's heading was fully unwiped
// (`inset(0% 0.335% 0% 0%)`) at `opacity: 0.62`. The animation wasn't gone,
// it had already happened where nobody could see it.
//
// Keeping opacity on its original played timeline restores the overlap the
// wipe depends on — the card is opaque by the time its heading is triggered —
// while Y still tracks the scroll position. Anything added here that a child
// component's own clock-based reveal has to line up with belongs on the
// played timeline, not the scrubbed one.
//
// Distance the Y scrub is spread over, starting from the trigger's start.
// Deliberately viewport-relative rather than tied to the grid's own bounds:
// these grids are one card tall at md+ but three stacked cards tall on
// mobile, so a grid-relative end ("bottom bottom") would make the same
// animation crawl over ~3 viewports of scrolling on a phone. One viewport of
// travel reads the same at every breakpoint.
const STAGGER_DISTANCE = "100%";

// Seconds the timeline takes to catch up to the scroll position — same dial
// as ImageCard's SCRUB_DAMPING. `true` would weld it to the scrollbar, which
// feels mechanical on top of ScrollSmoother; this lets it settle.
const STAGGER_SCRUB = 0.5;

// How long the viewport takes to catch up to the real scroll position, in
// seconds. This is the page-wide counterpart to ImageCard's SCRUB_DAMPING:
// that one softens the card's height, this one softens the scroll itself, so
// a wheel notch arrives as a glide instead of a step.
const SMOOTH_DURATION = 1;

/**
 * Installs page-wide smooth scrolling. Call once, from the app shell.
 *
 * ScrollSmoother works by pinning a wrapper to the viewport and translating
 * the content inside it, so two things follow for callers:
 *
 * 1. The markup must be `#smooth-wrapper > #smooth-content > …page…`.
 * 2. Anything `position: fixed` has to live OUTSIDE `#smooth-content`. A
 *    transformed ancestor makes a fixed child position against that ancestor
 *    instead of the viewport, so a fixed navbar inside the content would
 *    scroll away with the page.
 *
 * ScrollTrigger needs no changes — it detects the smoother and switches pins
 * to transform-based positioning by itself.
 */
export function useSmoothScroll() {
  useGSAP(() => {
    // Smooth scrolling overrides how far a gesture travels, which is exactly
    // what someone asking for reduced motion is asking not to happen. Skip
    // the smoother entirely and leave native scrolling alone.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: SMOOTH_DURATION,
      // No data-speed/data-lag parallax anywhere yet; leaving this off skips
      // the per-element effect scan on every refresh.
      effects: false,
      // Keep the wheel/touch handling on the main thread so scroll position
      // and the pinned cards can't tear apart on fast gestures.
      normalizeScroll: true,
    });

    return () => smoother.kill();
  });
}

/**
 * Reveals a grid's direct children in sequence as it scrolls into view.
 *
 * Replaces motion's parent/child variant propagation: the parent declared
 * `staggerChildren` and each child inherited a `variants` prop. GSAP has no
 * inheritance, so the parent tweens the child DOM nodes itself. Children stay
 * plain, visible-by-default components — the hidden start state is applied
 * here by fromTo, not baked into the child.
 *
 * The Y translation is scrubbed — its progress is bound to scroll position
 * over STAGGER_DISTANCE, so the cards rise exactly as far as the user has
 * scrolled and walk back down on a reversed gesture. The fade stays on a
 * played timeline; see the note above STAGGER_DISTANCE for why the two can't
 * both be scrubbed.
 *
 * @param {object} scopeRef       ref to the grid element
 * @param {number} options.amount fraction of the grid visible before firing
 *                                (motion's viewport.amount)
 */
export function useStaggerReveal(scopeRef, { amount = 0.333 } = {}) {
  useGSAP(
    () => {
      const threshold = `${amount * 100}%`;

      // Percentages in the first half of a start/end string measure against
      // the TRIGGER's height, which is what viewport.amount meant. Both
      // timelines share this start so the fade and the rise begin together.
      const start = `top+=${threshold} bottom`;

      // 1. Opacity, played. Unchanged from before the scrub existed:
      //    once: false in both scroll directions.
      const fade = gsap.timeline({
        scrollTrigger: {
          trigger: scopeRef.current,
          start,
          end: `bottom-=${threshold} top`,
          toggleActions: "play reverse play reverse",
        },
      });

      // The container's own fade. motion gave this no explicit duration, so
      // it ran on the library default (~0.3s).
      fade.fromTo(scopeRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);

      // ":scope > *" is the direct children only — grandchildren (the card's
      // own image/heading/body, which run their own reveals) must not be
      // swept up by this selector. Same on both timelines.
      fade.fromTo(
        ":scope > *",
        { opacity: 0 },
        {
          opacity: 1,
          duration: ITEM_DURATION,
          ease: EASE_OUT,
          stagger: STAGGER_STEP,
        },
        0
      );

      // 2. Y, scrubbed. "+=" measures from the START, not from the trigger —
      //    this is the scroll travel the timeline maps onto. No
      //    `toggleActions`: scrub supersedes it, since there are no discrete
      //    play/reverse events left to toggle, only a progress value.
      const rise = gsap.timeline({
        scrollTrigger: {
          trigger: scopeRef.current,
          start,
          end: `+=${STAGGER_DISTANCE}`,
          scrub: STAGGER_SCRUB,
        },
      });

      rise.fromTo(
        ":scope > *",
        { y: ITEM_OFFSET_Y },
        {
          y: 0,
          duration: ITEM_DURATION,
          ease: EASE_OUT,
          stagger: STAGGER_STEP,
        },
        0
      );
    },
    { scope: scopeRef }
  );
}

export { gsap, useGSAP, ScrollTrigger, ScrollSmoother };
