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
// aspect="11/6": this section's card images are 880/480 (11/6), same as
// the portfolio grid — <Card /> defaults to 6/5 (Proof/News), so this is
// the section that needs the override.
import Card from "../design-system/components/Card.jsx";

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
    <section className="px-8 py-16">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-2000">
          <h2 className="font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-h2">
            From The
            <br />
            Inside Out
          </h2>
          <Card aspect="11/6" {...social} />
        </div>
        <div className="flex flex-col gap-2000">
          <Card aspect="11/6" {...pr} />
          <Card aspect="11/6" {...culture} />
        </div>
      </div>
    </section>
  );
}
