import { prefersReducedMotion } from "../lib/reducedMotion.js";
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  ScrollSmoother,
  EASE_REVEAL,
  REVEAL_DURATION,
  LINE_DELAY,
} from "../design-system/animation.js";
import { useEffect, useRef, useState } from "react";
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

// The inline nav (md+). Below md the same links are the drawer's stacked
// list, so every pill class is md-prefixed and `menuLink` carries the drawer
// look; neither set leaks into the other breakpoint.
const pillLink = "md:relative md:m-0 md:inline-flex md:h-600 md:cursor-pointer md:items-center md:justify-center md:overflow-hidden md:whitespace-nowrap md:rounded-full md:font-narrow md:text-base md:font-light md:leading-8 md:text-neutral-0 md:light:text-neutral-1000 md:light:hover:text-neutral-0 md:will-change-transform md:before:absolute md:before:-inset-1 md:before:block md:before:translate-y-full md:before:bg-surface-primary-default md:before:transition-all md:before:duration-500 md:before:ease-in-out md:hover:before:translate-y-0"

// The drawer's stacked list (below md).
const menuLink = "max-md:block max-md:py-200 max-md:font-display max-md:text-fluid-lg max-md:uppercase max-md:text-neutral-0 max-md:light:text-neutral-1000 max-md:hover:text-primary-300 max-md:light:hover:text-primary-800"

// Single-element responsive nav, modelled on Bootstrap v6's navbar + drawer
// (twbs/bootstrap main, 6.0.0-alpha.1): one native <dialog> that is a modal
// drawer below the expand breakpoint and is reset to an inline flex row at it.
// What that buys, from the platform instead of from us: top layer, a focus
// trap, an inert page behind it, Esc, and focus handed back to the toggler.
// What we add, as Bootstrap's Drawer does: backdrop click to dismiss, an exit
// transition before close(), a scroll lock, and closing when the viewport
// crosses the breakpoint with the drawer open.
//
// shortcut: Bootstrap expands on the navbar's own width (container queries);
// this uses the viewport `md` breakpoint because the navbar is full-width.
const MENU_ID = "site-menu"
const MENU_MS = 300 // must match the drawer's duration-300 below
const EXPAND_QUERY = "(min-width: 768px)"

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
  const dialogRef = useRef(null)
  const togglerRef = useRef(null)
  const closeTimerRef = useRef(null)

  // `shown` is the drawer's visual state and drives aria-expanded. The
  // dialog's own `open` outlives it by one transition, because close() takes
  // it out of the top layer and would cut the exit short.
  const [shown, setShown] = useState(false)

  const lockScroll = () => {
    document.body.style.overflow = "hidden"
    // ScrollSmoother + normalizeScroll own wheel/touch scrolling, so body
    // overflow alone doesn't stop the page moving behind the drawer.
    ScrollSmoother.get()?.paused(true)
  }

  const unlockScroll = () => {
    document.body.style.overflow = ""
    ScrollSmoother.get()?.paused(false)
  }

  // Only `transform` transitions, never `visibility`: the dialog stays [open]
  // for the whole exit, so `open:visible` already covers it, and a visibility
  // transition would leave the content hidden at the instant showModal()
  // looks for something to focus.
  const openMenu = () => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    // Flush the closed-state styles (drawer off-screen, backdrop clear)
    // before flipping to the open ones, or the transition has nothing to
    // start from.
    void dialog.offsetWidth
    lockScroll()
    setShown(true)
  }

  const closeMenu = ({ instant = false } = {}) => {
    const dialog = dialogRef.current
    if (!dialog?.open) return
    setShown(false)

    const finish = () => {
      closeTimerRef.current = null
      if (!dialog.open) return
      dialog.close()
      unlockScroll()
      // Native close() restores focus too; this covers browsers that don't.
      if (togglerRef.current?.offsetParent) togglerRef.current.focus({ preventScroll: true })
    }

    clearTimeout(closeTimerRef.current)
    if (instant || prefersReducedMotion()) {
      finish()
    } else {
      closeTimerRef.current = setTimeout(finish, MENU_MS)
    }
  }

  // Crossing the expand breakpoint with the drawer open: the dialog stops
  // being an overlay, so drop it at once rather than leave a modal behind.
  // Also releases the scroll lock if the nav unmounts while open.
  useEffect(() => {
    const dialog = dialogRef.current
    const query = window.matchMedia(EXPAND_QUERY)
    const onChange = () => query.matches && closeMenu({ instant: true })
    query.addEventListener("change", onChange)

    // Backdrop click: only the backdrop is the dialog element itself, since
    // the content fills it. A listener, not onClick, because the lint rules
    // rightly refuse a mouse-only handler on a JSX element — the keyboard
    // equivalent (Esc) is the `cancel` handler above.
    const onBackdropClick = (event) => event.target === dialog && closeMenu()
    dialog?.addEventListener("click", onBackdropClick)

    return () => {
      query.removeEventListener("change", onChange)
      dialog?.removeEventListener("click", onBackdropClick)
      clearTimeout(closeTimerRef.current)
      if (dialog?.open) {
        dialog.close()
        unlockScroll()
      }
    }
    // closeMenu/unlockScroll only touch refs and setters, never stale state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      if (prefersReducedMotion()) return

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
      className="fixed inset-x-0 top-0 z-50 box-border flex w-auto items-center justify-between bg-surface-default light:bg-neutral-0 px-300 py-100 uppercase md:p-4 lg:px-8"
    >
      {/* Every `data-nav-item` below is a flex item of its own container, so
          it is blockified — a bare inline <a> would ignore the intro's
          transform entirely. Keep that true for anything added here. */}
      <div className="flex flex-1 shrink-0 items-center justify-between py-0 md:py-4">
        <Link to="/" data-nav-item="">
          <DeLogoMorph className="size-12 sm:size-14 md:size-16" />
        </Link>
      </div>
      {!logoOnly && (
        <button
          ref={togglerRef}
          type="button"
          data-nav-item=""
          aria-label="Menu"
          aria-haspopup="dialog"
          aria-controls={MENU_ID}
          aria-expanded={shown}
          onClick={() => (shown ? closeMenu() : openMenu())}
          className="inline-flex size-12 items-center justify-center text-neutral-0 light:text-neutral-1000 md:hidden"
        >
          {/* Figma: three 28x2 bars, 7px apart, rounded ends. */}
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden="true">
            <path d="M1 1H27M1 10H27M1 19H27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {/* The one element. Below md: a right drawer (modal <dialog>). At md+:
          static, transparent, inline — the old centred pill row. */}
      {!logoOnly && (
        <dialog
          ref={dialogRef}
          id={MENU_ID}
          aria-labelledby={`${MENU_ID}-title`}
          // Esc fires `cancel` on a modal dialog; take over so the exit plays.
          onCancel={(event) => {
            event.preventDefault()
            closeMenu()
          }}
          className={`max-md:invisible max-md:fixed max-md:inset-200 max-md:open:visible max-md:m-0 max-md:ms-auto max-md:flex max-md:size-auto max-md:max-w-sm max-md:flex-col max-md:overflow-hidden max-md:rounded-md max-md:bg-surface-alt max-md:text-neutral-0 max-md:light:bg-neutral-100 max-md:light:text-neutral-1000 max-md:transition-transform max-md:duration-300 max-md:ease-in-out max-md:reduced-motion:transition-none max-md:backdrop:transition-all max-md:backdrop:duration-300 md:static md:m-0 md:flex md:size-auto md:max-w-none md:items-center md:justify-center md:overflow-visible md:bg-transparent md:p-0 md:text-inherit ${
            shown
              ? "max-md:translate-x-0 max-md:backdrop:bg-surface-default/50 max-md:light:backdrop:bg-neutral-0/50 max-md:backdrop:backdrop-blur-sm"
              : "max-md:translate-x-full max-md:backdrop:bg-transparent"
          }`}
        >
          <div className="flex items-center justify-between py-100 ps-300 pe-100 md:hidden">
            <h2
              id={`${MENU_ID}-title`}
              className="font-narrow text-small font-light uppercase text-neutral-400 light:text-neutral-600"
            >
              Menu
            </h2>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => closeMenu()}
              className="inline-flex size-12 items-center justify-center text-neutral-0 light:text-neutral-1000"
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M5 5L23 23M23 5L5 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="px-300 pb-300 md:p-0">
            <nav aria-label="Main" className="flex flex-col md:flex-row md:items-center md:justify-center md:gap-6">
              <Link to="/about" data-nav-item="" onClick={() => closeMenu({ instant: true })} className={`${menuLink} ${pillLink} md:px-6 md:py-2`}>
                <span className="relative">About</span>
              </Link>
              <Link to="/careers" data-nav-item="" onClick={() => closeMenu({ instant: true })} className={`${menuLink} ${pillLink} md:px-[25.5px] md:py-[9.5px]`}>
                <span className="relative">Careers</span>
              </Link>
              <Link to="/contact" data-nav-item="" onClick={() => closeMenu({ instant: true })} className={`${menuLink} ${pillLink} md:px-[25.5px] md:py-[9.5px]`}>
                <span className="relative">Contact</span>
              </Link>
            </nav>
          </div>
        </dialog>
      )}
      {!logoOnly && (
      <div className="hidden md:flex flex-1 items-center justify-end py-2 md:py-4">
        <Link to="/contact" data-nav-item="" className="relative m-0 inline-flex h-400 cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-full border-[1.5px] border-neutral-0 light:border-neutral-1000 p-2 font-narrow text-link-social font-light uppercase leading-none text-neutral-0 light:text-neutral-1000 light:hover:text-neutral-0 transition-colors duration-500 will-change-transform before:absolute before:-inset-1 before:block before:translate-y-full before:bg-surface-primary-default before:transition-all before:duration-300 before:ease-in-out hover:border-surface-primary-default hover:before:translate-y-0 md:h-600 md:px-6 md:py-2 md:text-base md:leading-8">
          <span className="relative">Let&apos;s Chat</span>
        </Link>
      </div>
      )}
    </header>
  );
}
