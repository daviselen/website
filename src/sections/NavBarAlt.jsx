import {
  gsap,
  useGSAP,
  ScrollTrigger,
  EASE_REVEAL,
  REVEAL_DURATION,
  LINE_DELAY,
} from "../design-system/animation.js";
import { useRef } from "react";
import { Link } from "react-router-dom";
import DeLogoMorph from "../design-system/components/DeLogoMorph.jsx";

// Rebuilt from get_design_context's real reference code for the "Nav"
// component instance (nodeId 1961:180) — not hand-read from raw JSON this
// time. Corrections vs. the previous pass:
//   - Logo is 80x80 (size-20), not 40x40 — a real, visible-size miss.
//   - Alignment is items-end (bottom-aligned), not items-center — the
//     logo/links have different internal padding, so centering
//     them changes the baseline look.
//   - Link labels are ABOUT / CAREERS / CONTACT — HP-23 had this right;
//     "Archive" in the last pass was a misread off a low-res screenshot.
//   - Each nav-link has asymmetric padding (pt-8 pb-4 px-4) from the real
//     component, not uniform padding.
//   - No border: per direct correction, this doesn't have one — an earlier
//     pass had added a solid 1px #666 (neutral/600) border, which was wrong.

// Tallest the header ever renders (logo cell 64px + its own py-4 wrapper +
// the header's px-8/py-4 padding, rounded up). Both the scroll hide and the
// intro's drop distance are expressed against it, so neither can be left
// behind if the header's height changes.
const HEADER_HEIGHT = 144

const HIDE_DURATION = 0.3
const HIDE_OFFSET = -HEADER_HEIGHT // slides up by its own height
const HIDE_THRESHOLD = 150 // px scrolled before hiding is allowed

// Where each item starts its intro. A whole header height above its resting
// place puts every item past the top edge of the viewport (the header is
// fixed at top: 0), so nothing is visible until it has entered the header's
// own opaque band — the items read as dropping in from off-screen rather
// than sliding out from behind the bar. Duration/easing/stagger are the
// global motion tokens; only the distance is local.
const DROP_OFFSET = -HEADER_HEIGHT

// `logoOnly` renders the bare variant used by full-bleed pages (e.g. the
// retail map), which own the whole viewport and get no footer either: the
// links and the "Let's Chat" button are dropped, leaving just the logo. The
// intro/hide animations are untouched — they select `[data-nav-item]`, so
// they simply have fewer items to stagger.
export default function NavBar({ logoOnly = false }) {
  const headerRef = useRef(null)

  // One-shot intro: every header item drops into place from above, in DOM
  // order (logo -> About -> Careers -> Contact -> Let's Chat), which is also
  // left-to-right on screen.
  //
  // `[data-nav-item]` rather than `":scope > *"`: the header's direct
  // children are three flex wrappers, and the middle one holds all three nav
  // links — selecting children would drop the whole <nav> as a single item
  // instead of staggering the links inside it. The attribute marks the items
  // the design treats as items, independent of how they're grouped for
  // layout.
  //
  // Runs on mount only, and NavBarAlt is mounted by the persistent Layout, so
  // this plays once per full page load and never on client-side navigation —
  // same lifecycle the logo's own intro already relies on.
  useGSAP(
    () => {
      // Same query as useSmoothScroll and DeLogoIntro. Bailing before the
      // tween exists leaves every item at its resting position — there is no
      // hidden start state to undo, because `from` is what would have
      // applied it.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

      // `from`, not `fromTo`: the resting position is whatever the flex
      // layout computed, so the tween must not hardcode an end value.
      // useGSAP runs in useLayoutEffect, so the offset start state is written
      // before the first paint — the items never flash in place first.
      gsap.from("[data-nav-item]", {
        y: DROP_OFFSET,
        duration: REVEAL_DURATION,
        ease: EASE_REVEAL,
        stagger: LINE_DELAY,
      })
    },
    { scope: headerRef }
  )

  // Scroll-direction hide/show. The `hidden` React state is GONE: it existed
  // only to feed motion's `animate` prop, so every direction change forced a
  // re-render of the whole header. GSAP writes the transform directly, and
  // the current state is tracked in a local closure variable instead.
  useGSAP(
    () => {
      let hidden = false

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          // self.direction === 1 is scrolling down, which is what the old
          // `current > previous` comparison against getPrevious() meant.
          const shouldHide = self.direction === 1 && self.scroll() > HIDE_THRESHOLD

          // Only tween on an actual change — onUpdate fires on every scroll
          // frame, and re-firing an identical tween each frame would fight
          // itself.
          if (shouldHide === hidden) return
          hidden = shouldHide

          gsap.to(headerRef.current, {
            y: hidden ? HIDE_OFFSET : 0,
            duration: HIDE_DURATION,
            ease: EASE_REVEAL,
          })
        },
      })
    },
    { scope: headerRef }
  )

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 box-border flex w-auto items-center justify-between bg-surface-default px-4 py-2 uppercase md:px-8 md:py-4"
    >
      {/* Every `data-nav-item` below is a flex item of its own container, so
          it is blockified — a bare inline <a> would ignore the intro's
          transform entirely. Keep that true for anything added here. */}
      <div className="flex flex-1 shrink-0 items-center justify-between py-2 md:py-4">
        <Link to="/" data-nav-item="">
          <DeLogoMorph className="size-10 md:size-16" />
        </Link>
      </div>
      {/* Below md: shrink to fit — smaller pills (height, padding, gaps,
          type) rather than a hamburger, per direct decision. Real spec
          (h-600, px-6/py-2, text-base) is untouched at md+. */}
      {!logoOnly && (
      <nav className="flex items-center justify-center gap-1 md:gap-6">
        <Link to="/about" data-nav-item="" className="relative m-0 inline-flex h-400 cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-3 py-1 font-narrow text-xs font-light leading-none text-neutral-0 will-change-transform before:absolute before:-inset-1 before:block before:translate-y-full before:bg-surface-primary-default before:transition-all before:duration-500 before:ease-in-out hover:before:translate-y-0 md:h-600 md:px-6 md:py-2 md:text-base md:leading-8">
          <span className="relative">About</span>
        </Link>
        <Link to="/careers" data-nav-item="" className="relative m-0 inline-flex h-400 cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-3 py-1 font-narrow text-xs font-light leading-none text-neutral-0 will-change-transform before:absolute before:-inset-1 before:block before:translate-y-full before:bg-surface-primary-default before:transition-all before:duration-500 before:ease-in-out hover:before:translate-y-0 md:h-600 md:px-[25.5px] md:py-[9.5px] md:text-base md:leading-8">
          <span className="relative">Careers</span>
        </Link>
        <a href="/contact" data-nav-item="" className="text-neutral-00 relative m-0 inline-flex h-400 cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full px-3 py-1 font-narrow text-xs font-light leading-none will-change-transform before:absolute before:-inset-1 before:block before:translate-y-full before:bg-surface-primary-default before:transition-all before:duration-500 before:ease-in-out hover:before:translate-y-0 md:h-600 md:px-[25.5px] md:py-[9.5px] md:text-base md:leading-8">
          <span className="relative">Contact</span>
        </a>
      </nav>
      )}
      {!logoOnly && (
      <div className="flex flex-1 items-center justify-end py-2 md:py-4">
        <button data-nav-item="" className="overflow-hidden whitespace-nowrap rounded-full border-[1.5px] border-neutral-0 px-3 py-1 font-narrow text-xs font-light uppercase leading-none text-neutral-0 transition-colors duration-500 will-change-transform before:absolute before:-inset-1 before:block before:translate-y-full before:bg-surface-primary-default before:transition-all before:duration-300 before:ease-in-out hover:border-surface-primary-default hover:before:translate-y-0 md:px-6 md:py-2 md:text-base md:leading-8">
          <span className="relative">Let&apos;s Chat</span>
        </button>
      </div>
      )}
    </header>
  );
}
