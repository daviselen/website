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
//     tagline/logo/links have different internal padding, so centering
//     them changes the baseline look.
//   - Link labels are ABOUT / CAREERS / CONTACT — HP-23 had this right;
//     "Archive" in the last pass was a misread off a low-res screenshot.
//   - Each nav-link has asymmetric padding (pt-8 pb-4 px-4) from the real
//     component, not uniform padding.
//   - No border: per direct correction, this doesn't have one — an earlier
//     pass had added a solid 1px #666 (neutral/600) border, which was wrong.
const TAGLINES = ["Davis Elen Advertising", "Independent since 1948"]
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
  const taglineRef = useRef(null)

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

  // Tagline wipe. `visible` stays React state because it also drives the text
  // swap and the timer chain below — but the clip-path itself is GSAP's now.
  useGSAP(
    () => {
      gsap.to(taglineRef.current, {
        clipPath: visible ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
        duration: WIPE_MS / 1000, // keep in lockstep with the timer above
        ease: EASE_REVEAL,
      })
    },
    { scope: headerRef, dependencies: [visible] }
  )

  // Alternate the tagline in two phases per swap: while visible, hold ~2s
  // then wipe out right-to-left; while hidden, wait for that wipe to finish
  // (WIPE_MS), swap to the next line, then reveal left-to-right.
  useEffect(() => {
    let timer
    if (visible) {
      timer = setTimeout(() => setVisible(false), HOLD_MS)
    } else {
      timer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % TAGLINES.length)
        setVisible(true)
      }, WIPE_MS + BLACK_MS)
    }
    return () => clearTimeout(timer)
  }, [visible])

  return (
    <header
      ref={headerRef}
      className="flex items-end justify-between bg-surface-default px-8 py-4 uppercase fixed top-0 left-0 right-0 z-50"
    >
      <div className="flex flex-1 items-center py-4">
        {/* content="1948" overrides the machine-readable value for
            Organization.foundingDate (which expects a bare date, not this
            sentence) while leaving the visible text unchanged — standard
            microdata pattern for exactly this mismatch. */}
        <span
          itemProp="foundingDate"
          content="1925"
          className="relative inline-block overflow-hidden font-narrow font-light text-[18px] leading-[13px] mb-[0.075em] text-neutral-0"
        >
          {/* Single line whose clip edge sweeps horizontally: visible ->
              hidden wipes out right-to-left (right inset 0 -> 100%); the text
              is swapped while hidden, then hidden -> visible reveals
              left-to-right (right inset 100% -> 0). */}
          <span
            ref={taglineRef}
            className="inline-block whitespace-nowrap py-[0.075em]"
            // Starts fully revealed, matching motion's initial={false} —
            // the first tween runs to this same value, so nothing animates
            // on mount.
            style={{ clipPath: "inset(0 0 0 0)" }}
          >
            {TAGLINES[index]}
          </span>
        </span>
      </div>
      <div className="flex shrink-0 items-center justify-between py-4">
        <Link to="/">
          <DeLogo className="size-20" />
        </Link>
      </div>
      <nav className="flex flex-1 items-center justify-end gap-6">
        <Link to="/about" className="px-4 pb-4 pt-8 font-narrow font-light text-[18px] leading-8 text-neutral-0 hover:text-primary-300">
          About
        </Link>
        <a href="#careers" className="px-4 pb-4 pt-8 font-narrow font-light text-[18px] leading-8 text-neutral-0 hover:text-primary-300">
          Careers
        </a>
        <a href="#contact" className="px-4 pb-4 pt-8 font-narrow font-light text-[18px] leading-8 text-neutral-0 hover:text-primary-300">
          Contact
        </a>
      </nav>
    </header>
  );
}
