import DeLogo from "../design-system/components/DeLogo.jsx";
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  EASE_REVEAL,
} from "../design-system/animation.js";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

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
const WIPE_MS = 600 // must match the clipPath transition duration below
const HOLD_MS = 5000 // how long the text stays fully visible
const BLACK_MS = 400 // extra all-black pause after the wipe, before the reveal

const HIDE_DURATION = 0.3
const HIDE_OFFSET = -144 // header height it slides up by
const HIDE_THRESHOLD = 150 // px scrolled before hiding is allowed

export default function NavBar() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const headerRef = useRef(null)

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
      className="flex items-center justify-between bg-surface-default px-8 py-4 uppercase fixed top-0 left-0 right-0 z-50"
    >
      <div className="flex-1 flex shrink-0 items-center justify-between py-4">
        <Link to="/">
          <DeLogo className="size-20" />
        </Link>
      </div>
      <nav className="flex items-center justify-center gap-6">
        <Link to="/about" className="px-4 py-4 font-narrow font-light text-[24px] leading-8 text-neutral-0 hover:text-primary-300">
          About
        </Link>
        {/* Was a dead <a href="#careers"> pointing at an anchor that has
            never existed on any page. Now a real route. Classes and label are
            byte-identical to the old anchor, so the rendered <a href> differs
            only in its href — design-diff should show zero pixel change. */}
        <Link to="/careers" className="px-4 py-4 font-narrow font-light text-[24px] leading-8 text-neutral-0 hover:text-primary-300">
          Careers
        </Link>
        <a href="#contact" className="px-4 py-4 font-narrow font-light text-[24px] leading-8 text-neutral-0 hover:text-primary-300">
          Contact
        </a>
      </nav>
      <div className="flex flex-1 items-center justify-end py-4">
        <button className="px-5 py-3 font-narrow font-light text-[24px] leading-8 uppercase text-neutral-0 border-2 border-neutral-0 rounded-full hover:text-primary-300">
          Let's Chat
        </button>
      </div>
    </header>
  );
}
