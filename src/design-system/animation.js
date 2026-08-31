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
import { CustomEase } from "gsap/CustomEase";

// Registration is idempotent, but doing it here means a component only has
// to import this module — it can't forget a plugin and fail at runtime.
gsap.registerPlugin(useGSAP, ScrollTrigger, CustomEase);

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

/**
 * Reveals a grid's direct children in sequence as it scrolls into view.
 *
 * Replaces motion's parent/child variant propagation: the parent declared
 * `staggerChildren` and each child inherited a `variants` prop. GSAP has no
 * inheritance, so the parent tweens the child DOM nodes itself. Children stay
 * plain, visible-by-default components — the hidden start state is applied
 * here by fromTo, not baked into the child.
 *
 * @param {object} scopeRef       ref to the grid element
 * @param {number} options.amount fraction of the grid visible before firing
 *                                (motion's viewport.amount)
 */
export function useStaggerReveal(scopeRef, { amount = 0.333 } = {}) {
  useGSAP(
    () => {
      const threshold = `${amount * 100}%`;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scopeRef.current,
          // Percentages in the first half of a start/end string measure
          // against the TRIGGER's height, which is what viewport.amount meant.
          start: `top+=${threshold} bottom`,
          end: `bottom-=${threshold} top`,
          // once: false in both scroll directions.
          toggleActions: "play reverse play reverse",
        },
      });

      // The container's own fade. motion gave this no explicit duration, so
      // it ran on the library default (~0.3s).
      tl.fromTo(scopeRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0);

      // ":scope > *" is the direct children only — grandchildren (the card's
      // own image/heading/body, which run their own reveals) must not be
      // swept up by this selector.
      tl.fromTo(
        ":scope > *",
        { opacity: 0, y: ITEM_OFFSET_Y },
        {
          opacity: 1,
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

export { gsap, useGSAP, ScrollTrigger };
