import DeLogo from "../design-system/components/DeLogo.jsx";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { useState, useEffect } from "react";
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

export default function NavBar() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0
    if (current > previous && current > 150) {
        setHidden(true)
    } else {
        setHidden(false)
    }
  })

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
    <motion.header className="flex items-end justify-between bg-surface-default px-8 py-4 uppercase fixed top-0 left-0 right-0 z-50"
      animate={{
        y: hidden ? -144 : 0,
        opacity: hidden ? 1 : 1,
      }}
      transition={{ duration: 0.3, ease: [0.8, 0, 0.2, 1] }}
    >
      <div className="flex flex-1 items-center py-4">
        {/* content="1948" overrides the machine-readable value for
            Organization.foundingDate (which expects a bare date, not this
            sentence) while leaving the visible text unchanged — standard
            microdata pattern for exactly this mismatch. */}
        <span
          itemProp="foundingDate"
          content="1925"
          className="relative inline-block overflow-hidden font-narrow font-light text-[18px] leading-[13px] text-neutral-0"
        >
          {/* Single line whose clip edge sweeps horizontally: visible ->
              hidden wipes out right-to-left (right inset 0 -> 100%); the text
              is swapped while hidden, then hidden -> visible reveals
              left-to-right (right inset 100% -> 0). */}
          <motion.span
            className="inline-block whitespace-nowrap"
            initial={false}
            animate={{ clipPath: visible ? "inset(0 0 0 0)" : "inset(0 100% 0 0)" }}
            transition={{ duration: 0.6, ease: [0.8, 0, 0.2, 1] }}
          >
            {TAGLINES[index]}
          </motion.span>
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
    </motion.header>
  );
}
