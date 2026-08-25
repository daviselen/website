---
version: alpha
name: Davis Elen
description: >
  Design tokens for the Davis Elen Advertising website, built from the DE5
  Figma file (tnP43NMbcFkzFKMsdpukDn). Every value here traces to a real
  Figma variable, named style, or a direct get_design_context pull — see
  FIGMA_WORKFLOW.md for how these get pulled and re-verified, and
  tailwind.config.js for the Tailwind-side implementation of these same
  tokens (kept in sync by hand; this file is the reference, not generated
  from the config or vice versa).
colors:
  surface: "#000000"
  surface-alt: "#1f1f1f"
  surface-primary: "#1e5631"
  neutral-0: "#ffffff"
  neutral-500: "#818181"
  neutral-700: "#4d4d4d"
  primary: "#a4de02"
  red: "#D71602"
  cyan: "#00C3FF"
  brick: "#B8483D"
typography:
  h1:
    fontFamily: "Knockout 68 Full Featherwt"
    fontSize: 360px
    lineHeight: 256px
  h2:
    fontFamily: "Knockout 68 Full Featherwt"
    fontSize: 184px
    lineHeight: 128px
  hiai:
    fontFamily: "Knockout 68 Full Featherwt"
    fontSize: 144px
    lineHeight: 106px
  card-brand:
    fontFamily: "Knockout 68 Full Featherwt"
    fontSize: 80px
    lineHeight: 56px
  stat:
    fontFamily: "Knockout 67 Full Bantamweight"
    fontSize: 64px
    lineHeight: 56px
  body:
    fontFamily: "Ringside Narrow"
    fontSize: 32px
    lineHeight: 40px
    fontWeight: 400
  link-social:
    fontFamily: "Ringside Narrow"
    fontSize: 18px
    lineHeight: 18px
    fontWeight: 400
rounded:
  md: 8px
spacing:
  100: 8px
  200: 16px
  300: 24px
  400: 32px
  600: 48px
  700: 56px
  800: 64px
  1000: 80px
  1600: 128px
  1800: 144px
  2000: 160px
  2300: 184px
  2400: 192px
  3000: 240px
components:
  button-primary:
    backgroundColor: "{colors.surface-primary}"
    textColor: "{colors.neutral-0}"
    rounded: "{rounded.md}"
    typography: "{typography.body}"
    padding: 64px
    width: 480px
  button-primary-hover:
    backgroundColor: "{colors.neutral-0}"
    textColor: "{colors.surface}"
  card:
    rounded: "{rounded.md}"
  nav:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral-0}"
---

## Overview

Dark, high-contrast, condensed-type-driven. Nearly the entire site sits on
black or near-black (`surface`, `surface-alt`), with white text and a small
set of saturated accents (`red`, `cyan`, `primary` green) reserved for
callouts rather than general decoration. Headlines lean on two commercial
display cuts — Knockout Featherwt and Knockout Bantamweight — set very
large and always uppercase; body copy is Ringside Narrow throughout. The
overall effect is closer to an editorial/broadsheet feel than a typical
soft-UI marketing site: hard corners are rare (one 8px radius token covers
every rounded surface on the page), spacing is generous, and type does most
of the visual work.

## Colors

- **`surface` (#000000):** Page background. Everything sits on this by
  default (set once, on the root wrapper in `HomePage.jsx`).
- **`surface-alt` (#1f1f1f):** The one section that breaks from pure black —
  the HI/AI card. Signals "this is a distinct, elevated panel," not a
  literal elevation/shadow system (there isn't one on this site).
- **`surface-primary` (#1e5631):** CTA button fill (the "solid" `Button`
  variant). The only place this dark green is used — don't reach for it as
  a general accent.
- **`neutral-0` (#ffffff):** Primary text and logo color. Since the whole
  page defaults to this on a black background, most text needs no color
  utility at all.
- **`neutral-500` / `neutral-700` (#818181 / #4d4d4d):** Named "Gray" and
  "Dark Gray" in Figma. Used sparingly for de-emphasized text.
- **`primary` (#a4de02), `red` (#D71602), `cyan` (#00C3FF):** The three
  accent colors used together exactly once, as the HI/AI concept list's
  color-coding (green/red/cyan square + matching title color per item).
  Treat this trio as a set — if a fourth concept is ever added, it needs a
  fourth real accent from Figma, not an invented one.
- **`brick` (#B8483D):** Named style "Brick." Currently only present inside
  `chart.svg` (a flattened real asset), not as a live CSS color anywhere in
  the codebase — kept here so it's still traceable if that ever changes.

## Typography

Two families, never mixed within one text role:

- **Knockout** — display headlines, always uppercase, always one of the
  named sizes below. Ships as separate family-named cuts rather than one
  family with a weight axis: **Featherwt** (`h1`/`h2`/`hiai`/`card-brand`)
  is airier and used for every big headline; **Bantamweight** (`stat`) is
  heavier and reserved for the Proof/News/culture card headlines. Don't
  substitute one cut for the other, and don't reach for a Tailwind default
  size step (`text-7xl`, etc.) instead of one of these named tokens — every
  one of these sizes is bigger than Tailwind's largest default.
- **Ringside Narrow** — everything else: body copy, nav, footer, buttons.
  Ships in four real weights (300/400/500/700), each its own font file
  sharing one CSS `font-family` name — see `src/index.css` for the
  `@font-face` setup. `body` (32px/40px) is the size used for the HI/AI
  concept list; most other body text is smaller (see individual sections
  in code — this file lists the named tokens, not every ad hoc size).
- **`link-social`:** the one deliberately tiny, tight-leading text style
  (footer social links) — 18px/18px, not the default body line-height.

## Layout

- **`rounded.md` (8px)** is the only corner radius on the entire site —
  every image, card, and button uses it. There is no small/large radius
  scale because none exists in the source.
- **Spacing scale** is keyed to Figma's own `Scale/*` variables (e.g.
  `spacing.800` = `Scale/800` = 64px), not an arbitrary 8px grid invented
  for this build. Prefer these named values over a bare pixel number when
  a gap/margin has been confirmed against real Figma data; a bare
  `mt-[64px]` should be treated as provisional until it's traced back to
  one of these.
- **1792px** is the standard inset content width nearly every section
  resolves to (full viewport minus the shared 32px/`spacing.400` edge
  padding). Sections with their own background/border (HI/AI's card, the
  Footer's rule) need that inset reproduced as margin, not padding —
  padding only repositions content *inside* a box, it doesn't move where
  the box's own background or border paints. See FIGMA_WORKFLOW.md #8 for
  the specific bugs this caused when gotten backwards.

## Shapes

No shape system beyond `rounded.md`. Squares, circles, and card
silhouettes are all just that one radius (or none) applied to a
rectangle — there's no separate pill/circle/blob token set in this design.

## Components

- **`card`** — the shared image + heading (`stat` typography) + body
  primitive (`src/design-system/components/Card.jsx`), reused by Proof,
  News/Awards, and From The Inside Out rather than each section
  hand-rolling its own markup. Its image aspect ratio is NOT one constant:
  `6/5` for Proof/News, `55/36` for From The Inside Out (and the portfolio
  grid, which doesn't use `<Card>` but shares the same ratio) — pass the
  `aspect` prop rather than assuming the default fits every section.
- **`button-primary`** — real spec is much larger than a typical button:
  480px minimum width, 64px horizontal padding, 32px type, 112px
  line-height (that's what vertically centers the label, not flex
  centering at normal line-height). Two variants exist in code
  (`primary`/`solid`); `button-primary-hover` inverts fill and text color
  rather than just changing opacity/shade.
- **`nav`** — solid black background with a real 1px `#666` border (not a
  translucent gray), bottom-aligned content rather than centered.

## Do's and Don'ts

- **Do** treat a value with a comment tracing it to a real Figma pull as
  settled, and a bare arbitrary value (`mt-[64px]`, no comment) as
  provisional — re-verify before trusting it, especially if it's driving a
  layout decision.
- **Do** check whether a new UI need matches an existing component
  (`card`, `button`, `nav`, `de-logo`) before hand-rolling new markup —
  this codebase has had real duplication bugs from skipping that check.
- **Don't** invent a color, spacing value, or type size that isn't backed
  by something in this file or a fresh Figma pull — every token here
  exists because a specific real value was confirmed, not because it
  looked reasonable.
- **Don't** assume one section's structure (a two-column grid, a shared
  left-hand marker column, a particular gap) generalizes to a
  similar-looking section elsewhere. This design's most persistent bugs
  were exactly this kind of pattern-matching instead of checking the
  specific node.
- **Don't** use Knockout below the sizes listed under Typography, or
  substitute Featherwt for Bantamweight (or vice versa) — they read as
  distinctly different weights side by side, not interchangeable cuts of
  "the same font."
