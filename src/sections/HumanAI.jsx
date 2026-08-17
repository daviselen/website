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
// The dashed-circle/arrow diagram on the right is still a simplified CSS
// stand-in, not the real vector chart — that one genuinely wasn't worth
// reproducing exactly (small decorative arrows, high effort, low payoff)
// and is called out here rather than silently passed off as real.
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
const concepts = [
  {
    title: "What's Possible",
    color: "text-red",
    dot: "border-red",
    copy: "You point AI at the goal, an idea only a human would have.",
  },
  {
    title: "Let Robots Do The Work",
    color: "text-blue",
    dot: "border-blue",
    copy: "It clears the roadblocks and does the doing, at scale.",
  },
  {
    title: "Unlock Your Potential",
    color: "text-primary-300",
    dot: "border-primary-300",
    copy: "Multiply your bandwidth, free to imagine the next thing.",
  },
];

export default function HumanAI() {
  return (
    <section className="mx-8 rounded-md bg-surface-alt px-8 py-16 text-neutral-0">
      <div className="mb-16 flex h-[104px] items-center gap-4">
        <img src="/icons/hi-mark.svg" alt="" className="size-[104px]" />
        <p className="font-narrow text-base font-light leading-tight md:text-2xl">
          Human Imagination<span className="align-super text-sm">®</span>
          <br />x Artificial Intelligence
        </p>
      </div>

      <h2 className="font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-hiai">
        THE H<span className="tracking-[0.08em]">I</span>
        <span className="tracking-[0.1em]">x</span>AI LoOP
      </h2>

      <div className="mt-16 grid gap-10 md:grid-cols-[auto_1fr] md:items-start">
        <div className="flex gap-4 md:flex-col">
          {concepts.map((c) => (
            <div key={c.n} className={`size-[22px] shrink-0 border-4 ${c.dot}`} />
          ))}
        </div>

        <ol className="space-y-10">
          {concepts.map((c) => (
            <li key={c.n} className="flex gap-6">
              <span className={`font-narrow text-lg font-bold ${c.color}`}>{c.n}</span>
              <div>
                <h3 className={`font-narrow text-2xl font-bold uppercase ${c.color}`}>
                  {c.title}
                </h3>
                <p className="mt-1 font-narrow text-2xl leading-tight">{c.copy}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative mx-auto mt-16 flex aspect-square w-full max-w-md items-center justify-center rounded-full border border-dashed border-neutral-0/30 md:hidden lg:flex">
        <img src="/icons/de-cube-icon-1.svg" alt="" className="absolute left-4 top-8 h-16 w-16" />
        <img src="/icons/de-cube-icon-2.svg" alt="" className="absolute bottom-8 right-1/2 h-16 w-16 translate-x-1/2" />
        <img src="/icons/ai-cube-icon.svg" alt="" className="absolute right-4 top-1/2 h-16 w-16 -translate-y-1/2" />
      </div>
    </section>
  );
}
