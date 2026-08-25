// Rebuilt from get_design_context's real reference for the "PR /SOCA:"
// group. Real layout, confirmed by y-offsets in the reference code: two
// columns — left column is [heading, then Social Media], right column is
// [Public Relations, then DE Culture] — not a flat 3-card grid like the
// earlier pass, and not two separate sections (Social/PR + Culture) like
// HP-23 had. Real photos, not the generic descriptions guessed before:
// the "Social Media" card's photo is a Toyota UGC shot; "DE Culture"'s is
// a portrait (Corey Hayes) — that's genuinely what's in the source file.
//
// These headings use Figma's "det/heading"/"det/body" text styles, which
// are the exact same spec as "card/heading"/"card/body" (64px/56px
// Bantamweight + 24px/32px Ringside Narrow) — a previous pass gave this
// section its own local component using the wrong Knockout cut and the
// wrong size (80px Featherweight, copied from the portfolio grid's
// different "FootB/heading" style instead). Reusing the shared <Card />
// fixes both the duplication and the mismatch in one move.
//
// Column layout, re-verified directly against get_design_context's real
// y-offsets for the "PR /SOCA:" group (node 1715:724) rather than
// estimating: heading top=0 height=256.244px, SOCIAL top=416.24px — gap
// = 160.0px. PR (right column) top=0, DET top=817.21px; PR's own real
// height (480px image + 56px internal gap + 121.2px copy block) =
// 657.2px, so the gap to DET is also 160.0px. Both columns use the exact
// same 160px vertical gap (Scale/2000) — previously this was `gap-14`
// (56px), which is actually the real *internal* image-to-copy gap inside
// a single card, mistakenly reused as the *between-card* gap too. Also
// removed a `md:mt-[13%]` manual offset on the right column: the real
// data shows PR starts at top=0, flush with the heading — both columns
// start at the same y position, no stagger like the portfolio grid
// needed. That offset was exactly the kind of invented number workflow
// item #9 warns against.
//
// aspect="55/36": this section's card images are 880/480 (55/36), same as
// the portfolio grid — <Card /> defaults to 6/5 (Proof/News), so this is
// the section that needs the override.
//
// mt-3000 (240px): the gap between the HI/AI card above this section and
// this section's own heading. Figma was rate-limited when this was
// reported wrong, so this number is a direct value from the person who
// can see the file, not a get_design_context pull — noting that
// distinction per FIGMA_WORKFLOW.md #10 rather than presenting it with
// the same confidence as a tool-verified value.
//
// (This file went missing from the sandbox between turns — see the "file
// persistence" note in README.md — and was reconstructed from this
// conversation's history rather than re-pulled from Figma. Flagging that
// explicitly in case anything here drifted from what was last verified.)
import Card from "../design-system/components/Card.jsx";
import HeadingReveal from "../design-system/components/HeadingReveal.jsx";

const social = {
  heading: "Social Media",
  body: "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.",
  src: "/images/socialpr-social.jpg",
  alt: "Toyota social media content example",
};
const pr = {
  heading: "Public Relations",
  body: "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.",
  src: "/images/socialpr-public-relations.jpg",
  alt: "Public relations event photo",
};
const culture = {
  heading: "DE Culture",
  body: "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.",
  src: "/images/socialpr-de-culture.jpg",
  alt: "Davis Elen team member portrait",
};

export default function FromInsideOut() {
  return (
    <section id="from-inside-out" className="mt-3000 px-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-2000">
          <HeadingReveal as="h2" className="font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-h2" text={`From the \nInside Out`} />
          {/* Real photographed examples of client work, so these get full
              CreativeWork microdata (name + image), unlike Proof's
              unmarked arbitrary stats. */}
          <Card
            aspect="55/36"
            {...social}
            itemType="https://schema.org/CreativeWork"
            headingItemProp="name"
            imageItemProp="image"
          />
        </div>
        <div className="flex flex-col gap-2000">
          <Card
            aspect="55/36"
            {...pr}
            itemType="https://schema.org/CreativeWork"
            headingItemProp="name"
            imageItemProp="image"
          />
          <Card
            aspect="55/36"
            {...culture}
            itemType="https://schema.org/CreativeWork"
            headingItemProp="name"
            imageItemProp="image"
          />
        </div>
      </div>
    </section>
  );
}
