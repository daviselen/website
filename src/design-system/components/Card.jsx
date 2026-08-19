// Matches Figma's "card" component (nodeId 1918:727, componentSet "card"
// 1918:748, variant Size=Default) — real text styles "card/heading" and
// "det/heading" (64px/56px, weight 395, "Knockout 67 Full Bantamweight" —
// NOT the same Knockout cut as the big page headlines) and "card/body"/
// "det/body" (24px/32px, Ringside Narrow). This one Figma component is
// reused for the Proof stats, News/Awards items, AND the From The Inside
// Out cards (Social Media/Public Relations/DE Culture) — all three
// previously either hand-rolled their own near-identical markup or used
// the wrong Knockout cut/size, so a Figma-side edit to "card" wouldn't
// have had one obvious place in code to apply it.
//
// No gradient overlay on this component's image, on purpose: that
// treatment only applies to cards where the text sits ON TOP of the
// image (the portfolio grid) — these cards have the heading/body BELOW
// the image, a plain photo with no scrim. Added an `overlay` prop here
// briefly on a misreading of a data-only clue (a gradient value in the
// raw JSON that turned out to be Figma's own placeholder-image fill, not
// real art direction) — reverted.
//
// Internal gaps corrected from real data already pulled from a live
// instance of this exact component (get_design_context on 1715:724,
// "PR /SOCA:" group): image→copy gap is 56px, not 32px (gap-8) —
// confirmed by the "DET"/"SOCIAL"/"PR" wrapper divs' real
// `gap-[56px]`, all three matching. Heading→body gap is 32px, not 24px
// (gap-6) — confirmed by the "copy" div's real `gap-[32px]`, also
// matching across all three instances. Neither number had a comment
// tying it to real data before this; both were carried over from an
// earlier guess. Not yet re-verified against the base "card" component
// (1918:727) itself, only against these three instances of it, because
// the Figma MCP tool hit its Starter-plan rate limit mid-audit — flagging
// that explicitly rather than presenting this as fully closed out.
//
// Image aspect ratio is NOT one fixed number across every use of this
// component, per direct correction: Proof's cards are 11/6 (880/480) —
// the ratio actually measured via get_design_context on 1715:724 — while
// News/Awards and the From The Inside Out cards are 576/480 (6/5), the
// original hardcoded value here (correct for those, not for Proof — had
// this backwards for a moment before the swap). So this needs to be a
// per-instance prop, not a single constant; defaulting to 6/5 since two
// of the three call sites use it. Written as explicit, fully-spelled-out
// classes (not a template-string class name) because Tailwind's JIT
// scanner needs the literal class text present somewhere in a source
// file to generate it — an interpolated `aspect-[${x}]` wouldn't
// reliably get picked up.
const aspectClasses = {
  "11/6": "aspect-[11/6]",
  "6/5": "aspect-[6/5]",
};

// Figma's "card" component has a Size variant. The two sizes differ by the
// image→copy outer gap: the large size (≥ half the row width, e.g. the
// From The Inside Out 2-up cards) uses gap-700 (56px); the small size
// (≤ a third of the row, e.g. the Proof / News-Awards 3-up cards) uses
// gap-400 (32px). The heading→body inner gap (gap-400) is the same in both.
// Explicit, fully-spelled class names so Tailwind's JIT scanner picks them
// up (an interpolated `gap-[${n}]` wouldn't reliably be generated).
const gapClasses = {
  default: "gap-700",
  small: "gap-400",
};

// schema.org microdata is opt-in via these three props, all undefined by
// default — Card is shared by three sections whose content maps to three
// different (or no) schema.org properties, so the mapping can't be
// hardcoded here without mislabeling one of them:
//   - Proof's cards are arbitrary marketing stats ("$18 Billion in Retail
//     Sales") — no schema.org property fits that cleanly, so Proof passes
//     none of these and gets no microdata at all.
//   - NewsAwards' cards are real awards — passes headingItemProp="award"
//     only (Organization.award is a plain Text property, no itemType/
//     itemScope needed on the card itself).
//   - FromInsideOut's cards are real photographed examples of client work —
//     passes itemType="https://schema.org/CreativeWork" plus
//     headingItemProp="name" and imageItemProp="image".
export default function Card({
  src,
  alt,
  heading,
  body,
  aspect = "6/5",
  size = "default",
  itemType,
  headingItemProp,
  imageItemProp,
}) {
  return (
    <div
      className={`flex flex-col ${gapClasses[size] ?? gapClasses.default}`}
      {...(itemType ? { itemScope: true, itemType } : {})}
    >
      <img
        src={src}
        alt={alt}
        className={`${aspectClasses[aspect] ?? aspectClasses["6/5"]} w-full rounded-md object-cover`}
        {...(imageItemProp ? { itemProp: imageItemProp } : {})}
      />
      <div className="flex flex-col gap-400">
        <h3
          className="font-stat text-3xl uppercase leading-none md:text-5xl lg:text-display-stat"
          {...(headingItemProp ? { itemProp: headingItemProp } : {})}
        >
          {heading}
        </h3>
        <p className="font-narrow text-lg leading-relaxed md:text-2xl md:leading-8">{body}</p>
      </div>
    </div>
  );
}
