import { useRef } from "react";
import {
  gsap,
  useGSAP,
  SplitText,
  REVEAL_DURATION,
  LINE_DELAY,
  EASE_REVEAL,
} from "../animation";

// The clip-path is measured against the line's own border box, so a box that
// hugs the glyphs makes the reveal edge shave ascenders and descenders on its
// way through. LINE_BLEED pads that box out to give the clip somewhere to
// travel that isn't across the type.
//
// The pull-back is twice the padding, not equal to it, so the pair nets -0.15em
// per line rather than cancelling. These headings run negative leading
// (Headings/H-hi-ai is 144/104, H3 is 184/128); splitting them turns one
// flowing block into separate line boxes, and that reclaims the spacing the
// split would otherwise add. Both em, not px, so they track font-size across
// the display sizes.
const LINE_BLEED = "0.075em";
const LINE_BLEED_PULLBACK = "-0.15em";

// On the heading itself, and only in the split path. Two jobs: it stops the
// first and last line's negative margin-block from collapsing out through the
// heading's own edges — parent/child margins collapse only when nothing sits
// between them, so any padding here blocks it — and it puts the block back on
// the position the design has it.
//
// Block axis only. The shorthand would inset the text horizontally too, and
// these headings sit in a 5-column measure whose left edge is a grid line —
// ~11px of inline padding at the 144px display size would visibly break the
// heading's alignment with the copy under it.
//
// The non-split path is left alone: RevealLine has its own padding for this,
// and every existing heading on the site is positioned against that geometry.
const HEADING_BLEED = "0.075em";

// Bottom-edge viewport inset, in px — the surviving half of motion's viewport
// margin "0px 0px -100px 0px". Shared by both start strategies so the two stay
// the same distance off the fold.
const VIEWPORT_INSET = 100;

// Default: fire as soon as the heading's top edge clears the inset fold. Right
// for the body-copy-sized headings, which are short enough that "top enters"
// and "all of it is visible" are nearly the same scroll position.
const START_ON_ENTER = `top bottom-=${VIEWPORT_INSET}`;

// Opt-in (`fullyInView`): wait for the heading's BOTTOM edge to clear the fold,
// i.e. the whole block is on screen before the first line unmasks. Display type
// needs this — the masthead h1 is 360px/line and hand-broken onto two lines, so
// with START_ON_ENTER the reveal was already finishing while only the first
// line's ascenders had made it past the fold.
//
// A function, not a string, because it depends on a measurement: the check has
// to re-run on every ScrollTrigger.refresh() (font swap, resize), and at
// 360px/line this heading genuinely can be taller than a short viewport — where
// "bottom" never reaches the fold and a `once: true` trigger would simply never
// fire. In that case fall back to the enter-based start, which always does.
const startFullyInView = (root) => () =>
  root.getBoundingClientRect().height + VIEWPORT_INSET >= window.innerHeight
    ? START_ON_ENTER
    : `bottom bottom-=${VIEWPORT_INSET}`;

// Both split strategies below animate identically — only the set of elements
// they hand in differs — so the timeline is built in one place and they can't
// drift apart.
//
// Two levels, exactly as the motion version split them: the parent carries ONE
// unified Y-translation for the whole block, and each line carries only its own
// staggered clip-path mask. Keeping them as separate tweens on a shared
// timeline preserves that split — the block slides as a unit while the masks
// fire in sequence.
function buildReveal(root, lines, fullyInView) {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: fullyInView ? startFullyInView(root) : START_ON_ENTER,
      // once: true — play on first enter; never re-hide or replay.
      once: true,
    },
  });

  // Parent Y. GSAP converts the em unit against the element's own
  // font-size, matching how motion resolved "0.25em" here.
  tl.fromTo(
    root,
    { y: "0.25em" },
    { y: "0em", duration: REVEAL_DURATION, ease: EASE_REVEAL },
    0
  );

  // Per-line masks. `stagger` replaces the hand-computed
  // `delay={index * LINE_DELAY}` the old RevealLine child took as a prop
  // — same arithmetic, but GSAP owns the indexing now.
  tl.fromTo(
    lines,
    { clipPath: "inset(100% 0 0 0)" },
    {
      clipPath: "inset(0% 0 0 0)",
      duration: REVEAL_DURATION,
      ease: EASE_REVEAL,
      stagger: LINE_DELAY,
    },
    0
  );

  return tl;
}

/**
 * @param {boolean} splitLines  Stagger by RENDERED line instead of by authored
 *   `\n`. Off by default: most headings here are short, hand-broken display
 *   type (`Think Inside \nthe Box`) where the newlines already are the lines.
 *   Turn it on for headings that are real sentences and wrap at a width the
 *   markup doesn't know — those have exactly one authored line, so without
 *   this they reveal as one block no matter how many lines they occupy.
 * @param {boolean} fullyInView  Hold the reveal until the entire heading is in
 *   the viewport, instead of firing as its top edge crosses the fold. For
 *   display type tall enough that the difference is visible — see
 *   startFullyInView above.
 */
export default function HeadingReveal({
  text,
  as: Tag = "h2",
  itemProp,
  className = "",
  splitLines = false,
  fullyInView = false,
}) {
  const rootRef = useRef(null);
  const lines = text.split("\n");

  useGSAP(
    () => {
      const root = rootRef.current;

      if (!splitLines) {
        buildReveal(root, "[data-reveal-line]", fullyInView);
        return;
      }

      // Where the lines fall is a measurement, not a fact about the text, so
      // SplitText has to do it against real rendered geometry. `autoSplit`
      // re-runs the split (and, via onSplit, rebuilds the timeline) on resize
      // and on font load — the second matters here because Knockout swaps in
      // after first paint and re-breaks every one of these headings.
      //
      // No `mask: "lines"`: the clip-path IS the mask, and a wrapper with
      // overflow:hidden would clip the glyphs that LINE_BLEED exists to
      // protect — the same reason RevealLine below pads its own inner span.
      let tl;
      const split = SplitText.create(root, {
        type: "lines",
        autoSplit: true,
        onSplit: (self) => {
          // Applied here rather than via `linesClass` because SplitText
          // rebuilds these divs on every re-split, and eslint's tailwind
          // config rejects both a custom classname and an arbitrary value.
          gsap.set(self.lines, {
            paddingBlock: LINE_BLEED,
            marginBlock: LINE_BLEED_PULLBACK,
          });

          tl = buildReveal(root, self.lines, fullyInView);
          // Returned so SplitText kills it before each re-split; otherwise
          // every font load and resize would leave a live ScrollTrigger
          // pointed at detached line elements.
          return tl;
        },
      });

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        split.revert();
      };
    },
    { scope: rootRef, dependencies: [text, splitLines, fullyInView] }
  );

  // SplitText reads the element's text and rebuilds it into line divs, so in
  // that mode the per-line wrappers must NOT be pre-rendered — it would split
  // markup it's about to replace, and React would own DOM GSAP is mutating.
  return (
    <Tag
      ref={rootRef}
      itemProp={itemProp}
      className={className}
      style={splitLines ? { paddingBlock: HEADING_BLEED } : undefined}
    >
      {splitLines
        ? text
        : lines.map((line, index) => (
            <RevealLine key={index}>{line}</RevealLine>
          ))}
    </Tag>
  );
}

function RevealLine({ children }) {
  return (
    <span
      className="relative block"
      style={{
        overflow: "hidden",
        padding: "0.0333333em 0",
        margin: "-0.0333333em 0",
      }}
    >
      <span
        // Selected by the parent's timeline. A data attribute rather than a
        // class because eslint's tailwindcss plugin errors on any classname
        // it doesn't recognize, and this is a JS hook, not styling.
        data-reveal-line=""
        className="block w-full pt-[0.0125em] pb-[0.02em]"
        style={{
          clipPath: "inset(100% 0 0 0)",
          willChange: "clip-path",
          transform: "translateZ(0)",
        }}
      >
        {children}
      </span>
    </span>
  );
}
