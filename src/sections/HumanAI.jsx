// Rebuilt from get_design_context's real reference for the "HI/AI" frame
// (nodeId 1715:746). Corrections vs. the previous pass, which was itself
// built from hand-read raw JSON:
//   - Cyan accent is #00BBDE (named style "Blue"), not #00C4FF — a guess.
//   - Exact copy, not paraphrased: "You point AI at the goal, an idea only
//     a human would have." / "It clears the roadblocks and does the
//     doing, at scale." / "Multiply your bandwidth, free to imagine the
//     next thing."
//   - "THE HI x AI LOOP" is 144px Knockout with extra letter-spacing on
//     the "I" and "x" specifically (a real per-character override).
//   - There's a column of 3 small bordered accent squares (green/cyan/red,
//     22px) next to the copy list that was missing entirely.
//   - Real icon assets (HI mark, 2 DE cube icons, AI cube icon) — see
//     public/icons/README.txt for the fetch script; falls back to a
//     colored-div approximation if those files aren't present yet.
// The dashed-circle/arrow diagram on the right was a simplified CSS
// stand-in, not the real vector chart, on the reasoning that it was small
// decorative arrows, high effort, low payoff to reproduce exactly — real
// asset (`public/images/chart.svg`) has since been provided directly, so
// that's now a plain `<img>` instead of a CSS approximation. The three
// individual DE/AI cube icon images this div used to layer on top of the
// CSS circle are gone too — they were part of approximating the same
// diagram the real chart.svg now replaces outright, not a separate real
// element.
//
// Same bug class as the Footer border: real "HI/AI" (1715:746) is exactly
// 1792px wide — the standard inset content width every other section
// gets from an ancestor wrapper's padding — with its own bg/rounded-8px
// card filling that whole box, floating with a visible margin on both
// sides. `px-8` alone only insets the CONTENT; it doesn't move where the
// background paints or the corners round, so the card was rendering
// edge-to-edge instead of as a floating inset card. `mx-8` fixes that;
// `px-8`/`py-16` stay as the card's own internal content padding
// (approximating the real ~113px inset, not an exact scale-token match).
//
// Re-pulled 1715:746 directly to check reported-off text sizes across the
// whole section (not just the headline, which turned out to already be
// exactly right — 144px/106px leading, 11.52px/14.4px tracking on "I"/"x"
// = 0.08em/0.1em at that size, matching what was already coded). Real
// mismatches found:
//   - The "Human Imagination / x Artificial Intelligence" badge text was
//     one uniform size (text-base/md:text-2xl) for both lines. Real spec
//     has "Human Imagination" at 48px and "x Artificial Intelligence" +
//     "®" at 24px — two different sizes, not one.
//   - The concept list's title and body were two different sizes
//     (text-2xl/24px for both, actually — but see below) when the real
//     spec has both at one uniform 32px/40px-line-height, bold+colored
//     title vs. regular white body via weight, not size.
//   - The "01"/"02"/"03" numbers: confirmed NOT in the design — removed.
//     Per direct confirmation, these were never real. Best explanation:
//     the very first pass at this file was built by hand-reading raw
//     Figma REST JSON (this file's own history above says as much — "the
//     previous pass, which was itself built from hand-read raw JSON"),
//     and a "numbered concept list" was presumably invented at that
//     point as a reasonable-looking structure for 3 sequential ideas.
//     Every rewrite since then — including the "Exact copy, not
//     paraphrased" line above, from the pass that supposedly fixed
//     things by switching to get_design_context — carried it forward and
//     described it with the same confidence as the parts that actually
//     were re-verified, without anyone re-checking this one specific
//     piece against real data until just now. That's the failure mode
//     item #10 in FIGMA_WORKFLOW.md is about: once a claim is written
//     down as "confirmed," it tends to get trusted by the next pass
//     instead of re-checked.
//
// Re-pulled 1715:746 again after a Figma-side restructure (real autolayout
// added specifically to make this frame easier to read) — this is what
// actually fixed the "spacing is still all wrong" report, not another
// round of number-tweaking on the old structure. The old structure's
// fundamental shape was wrong: a shared left-hand column of 3 squares
// next to a separate column of title+body pairs. The real shape (now
// that it's explicit autolayout instead of loose absolute positions) is
// a flat list of 3 self-contained items, each its own [square+title row,
// then body below] — the square lives inline with its OWN title, not in
// a shared column next to all three. That's a structural fix, which is
// why no amount of adjusting gap/margin numbers on the old two-column
// grid was ever going to look right. Real gaps, all confirmed from this
// pull: HI-text-block → headline = 80px (Scale/1000); headline → list =
// 64px (Scale/800); between the 3 items = 56px (bare, no named token);
// within an item, heading-row → body = 24px (Scale/300); within the
// heading row, square → title = 8px (Scale/100).
//
// Chart placement: per direct correction, it belongs beside the copy, not
// below it — matches the real node data too (the badge/headline/list
// wrapper is at left-113px, ~631px wide; the chart's own elements sit in
// the ~844–1584px range of the same 1792px-wide card, vertically centered
// — side by side, not stacked). Restructured into a two-column flex row
// at lg+ (text column, then the chart filling the remaining width),
// stacked on smaller screens since the source is desktop-only and this is
// a responsive adaptation, not something to reverse-engineer an exact
// breakpoint for. Also dropped the chart's old `md:hidden` — that was
// inherited from the CSS-circle placeholder era with no real
// justification for hiding specifically at `md`, and re-checking it
// wasn't part of what was asked; simplified to "visible, stacked below
// the text" until it goes side-by-side at `lg`.
const concepts = [
  {
    title: "What's Possible",
    color: "text-red",
    dot: "border-red",
    copy: "You point AI at the goal, an idea only a human would have.",
  },
  {
    title: "Let Robots Do The Work",
    color: "text-cyan",
    dot: "border-cyan",
    copy: "It clears the roadblocks and does the doing, at scale.",
  },
  {
    title: "Unlock Your Potential",
    color: "text-primary-300",
    dot: "border-primary-300",
    copy: "Multiply your bandwidth, free to imagine the next thing.",
  },
];

// Grid-line background: two 1px-line gradients (vertical + horizontal)
// tiled at 40x40px, offset -1px/-1px so the lines land on-pixel instead
// of getting clipped at the edge. Inline style rather than Tailwind
// classes — arbitrary-value utilities don't have a clean way to express
// two background-images plus their own background-size/-position at
// once.
const gridBackground = {
  backgroundSize: "40px 40px",
  backgroundImage:
    "linear-gradient(to right, #2b2b2b 1px, transparent 1px), linear-gradient(to bottom, #2b2b2b 1px, transparent 1px)",
  backgroundPosition: "-1px -1px",
};

export default function HumanAI() {
  return (
    // px-1400/py-1800 (112px/144px): real inline/block padding, per direct
    // correction — was Tailwind's own default px-8/py-16 (32px/64px), never
    // actually tied to a Figma value. mx-8 (the outer floating-card inset)
    // is unrelated and unchanged — that's margin outside the card, not the
    // padding inside it that was reported wrong here.
    <section
      id="human-ai"
      className="mx-8 rounded-md bg-surface-alt px-1400 py-1800 text-neutral-0"
      style={gridBackground}
    >
      <div className="lg:flex lg:items-center lg:justify-between lg:gap-16">
        <div className="lg:max-w-2xl lg:shrink-0">
          <div className="mb-1000 flex items-center gap-6">
            <img src="/icons/hi-mark.svg" alt="" className="size-[104px]" />
            <div className="font-narrow font-light leading-tight mt-[13px]">
              <div>
                <span className="text-2xl md:text-4xl lg:text-[48px] tracking-[0.6667px]">Human Imagination</span>
                <span className="align-super text-xs md:text-base lg:text-[24px]">®</span>
              </div>
              <span className="text-base md:text-lg lg:text-[24px] leading-[40px]">x Artificial Intelligence</span>
            </div>
          </div>

          {/* Kept on one line, deliberately: JSX collapses a line break
              between two tags with only whitespace between them down to
              nothing, not a single space. Split across lines (as this was
              before), "I" and "×" and "AI" all end up jammed together with
              no space at all — not just "less space than expected." */}
          <h2 className="font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-hiai">
            THE <abbr title="Human Imagination">H<span className="tracking-[0.08em]">I</span></abbr><span className="tracking-[0.1em]">x</span><abbr title="Artificial Intelligence">AI</abbr> Loop
          </h2>

          <ul className="mt-800 flex flex-col gap-700">
            {concepts.map((c) => (
              <li key={c.title} className="flex flex-col gap-300">
                <div className="flex w-full items-center gap-100">
                  <div className={`size-[22px] shrink-0 border-4 ${c.dot}`} />
                  <h3
                    className={`flex-1 font-narrow text-xl font-bold uppercase md:text-2xl lg:text-[32px] lg:leading-[40px] ${c.color}`}
                  >
                    {c.title}
                  </h3>
                </div>
                <p className="font-narrow text-xl leading-tight md:text-2xl lg:text-[32px] lg:leading-[40px]">
                  {c.copy}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* lg:w-[44.8276vw]: real spec is 832px wide at a 1856px viewport
            — a fixed px:viewport ratio, not a fixed px value, so it needs
            to scale with the viewport rather than snap to a size at each
            Tailwind breakpoint the way most of this page's type/spacing
            does. Converting to vw is the standard way to reproduce that:
            832/1856 = 0.448275862...; expressed as a percentage of viewport
            width, that ratio holds at any width, not just exactly 1856px.
            Paired with lg:shrink-0 instead of the old lg:flex-1 — an
            explicit width and flex-grow/shrink fighting each other would
            make the real number here meaningless. */}
        <img
          src="/images/chart.svg"
          alt=""
          className="mx-auto mt-16 block w-full max-w-md lg:mx-0 lg:mt-0 lg:w-[44.8276vw] lg:max-w-none lg:shrink-0"
        />
      </div>
    </section>
  );
}
