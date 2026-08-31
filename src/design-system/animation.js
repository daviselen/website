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
