See [FIGMA_WORKFLOW.md](./FIGMA_WORKFLOW.md) for the checklist to follow
when pulling any frame from this file — written to prevent the specific
mistakes documented below from recurring. See [DESIGN.md](./DESIGN.md) for
the design tokens themselves (colors, type scale, spacing, components) in
the [DESIGN.md format](https://github.com/google-labs-code/design.md) —
the reference for *what the system is*, as opposed to FIGMA_WORKFLOW.md's
process for pulling it out of Figma.

# DE5 Website — HP-26 homepage

React + Tailwind build of the DE5 Figma file's homepage frame
(`tnP43NMbcFkzFKMsdpukDn`), pulled via the Figma REST API (MCP hit a
Starter-plan rate limit partway through). Originally built from **HP-23**
(node `1642:454`), then updated to match **HP-26** (node `1715:634`) — a
redesign pass that rebuilt the frame with real autolayout, bound
variables, and reusable components (Nav, card, button, de-logo), pulled
with `fetch_figma_frame.py` and cross-checked against a screenshot render.

## HP-23 → HP-26 changes applied

- **Nav:** type size 18px → 24px; alignment changed from a forced
  3-column center to real `justify-between` (flex now matches Figma's
  `SPACE_BETWEEN` autolayout exactly); added the 1px bottom border the
  real Nav component has; link set is Archive/Careers/Contact.
- **Colors:** the CTA/button green is `#1E5631` (HP-26's real bound-variable
  fill), not `#2F5F47` as HP-23 approximated. The HI/AI section background
  is a dark neutral `#1F1F1F`, not green — that was a misread carried over
  from HP-23. Added a `hiai` color set (red `#D71602`, cyan `#00C4FF`,
  green `#A4DE02`, coral `#B8483D`) for the section's new content.
- **Proof:** third stat's copy changed from "Independent for 78 years" to
  "Independent for Over 75 Years"; other two are now title case.
- **HI/AI:** substantially expanded in HP-26 — a new "THE HI x AI LOOP"
  headline replaces the old lorem-ipsum "headline," and the body is now a
  numbered 01/02/03 concept list (What's Possible / Let Robots Do The Work
  / Unlock Your Potential) instead of a single paragraph. The 6-icon AI
  tool row (RW/11/MJ/MJ/Claude/MJ) is marked `visible: false` in the
  source file now, so it's been removed. A simplified CSS circle diagram
  stands in for the real vector illustration (not exported).
- **Social/PR + culture merged:** HP-23 had two separate sections ("Get On
  The Soap Box" and "From The Inside Out"); HP-26 merges them under one
  "From The Inside Out" heading. "Social" is renamed "Social Media," and
  the "DE Tuesdays" card is now `visible: false` in the source file
  (dropped). `SocialPR.jsx` is no longer used on the homepage; kept in the
  repo in case a future frame needs it standalone.
- **News/Awards:** copy updated to "Davis Elen Wins 8 Telly Awards" /
  "Davis Elen Wins a Shorty Award" / "DE Wins a Silver and Bronze Pencil."
- **Footer:** HP-23's footer is now `visible: false, locked: true` in the
  file, replaced by a new one built from real components. Restructured
  from a 3-column grid to the real 2-column layout (logo + contact +
  social stacked on the left, cities on the right); social link label
  "X" → "X (Twitter)".

The sections below describe the original HP-23 pull methodology and are
still accurate for what hasn't changed (fonts, overall approach).

## Redone properly with get_design_context (this pass)

The pass above was built by hand-reading raw Figma REST API JSON — that
turned out to be the wrong tool for the job and is why several things
were "close but not quite." This pass used the actual purpose-built
workflow instead (`figma-design-to-code` skill → `get_design_context`),
which returns real reference React+Tailwind code, a screenshot, and
resolved design-token values in one call, then adapted that reference
into this project's conventions. Concrete fixes this caught:

- **Every big headline was rendered far too small.** Real desktop sizes:
  360px (Masthead h1), 184px (section headlines — Fresh Out Of The Box,
  What's Happening, From The Inside Out, the CTA), 144px (THE HI x AI
  LOOP), 80px (portfolio card brand name), 64px (Proof/News stat
  headline). The previous pass capped out around 72–96px (Tailwind's
  `text-7xl`) — this was the single biggest source of visual drift, since
  oversized condensed Knockout type is this site's dominant visual
  signature. Added a real `fontSize` scale to `tailwind.config.js`
  (`display-h1` / `display-h2` / `display-hiai` / `display-card` /
  `display-stat`) instead of guessing at Tailwind's default steps.
- **Portfolio cards were structurally wrong.** Text sits ON the image
  (bottom-anchored, over a dark gradient scrim), not below it as a
  separate caption — and every card is the same ~879×576 image; the
  masonry look comes from each column starting at a different vertical
  offset, not from varying image aspect ratios (which the previous pass
  invented).
- **Nav logo was half real size** (40px vs. real 80px), items were
  bottom-aligned not centered, and the border was a solid `#666`, not a
  translucent gray.
- **The button component was roughly a third its real size** —
  `min-w-[480px]`, 64px padding, 32px text, not `px-8 py-4 text-sm`.
- **HI/AI cyan accent corrected** from a guessed `#00C4FF` to the real
  named style value `#00BBDE`, and the concept-list copy is now the exact
  source text, not a paraphrase.
- **From The Inside Out's real layout** is two columns (heading + Social
  Media on the left; Public Relations + DE Culture on the right), not a
  flat 3-card row.
- **Footer** logo is 192×200 (not 64–80px), has a white border on both
  top *and* bottom (not just top), and cities use a deliberately loose
  130px line-height.
- **Real vector icons** (logo, HI badge mark, 3 cube icons) were pulled
  via `download_assets` as flattened single-SVG exports instead of being
  approximated with colored `<div>`s — see `fetch_hp26_assets.py` and
  `public/icons/README.txt`.
- One deliberate remaining simplification, called out rather than passed
  off as real: the small dashed-circle/arrow chart graphic in the HI/AI
  section is a plain CSS circle, not the exact vector diagram (a lot of
  tiny decorative pieces for very little visual payoff at this pass's
  scope).

`fetch_hp26_assets.py` (next to this project's parent folder) downloads
every one of these real assets straight to the filenames the code
expects — the URLs it uses expire in ~7 days, so run it soon.

## What's real here

- **Copy:** every headline, stat, project title/client, city, and contact
  detail is the actual text from the Figma file (lorem-ipsum body
  paragraphs included — that's placeholder copy in the source design
  itself, not something added here).
- **Colors:** `ink` #000000, `paper` #ffffff, `accent-tan` #896E5F,
  `accent-blue` #005697, `accent-green` #2F5F47 (CTA button + the HI/AI
  section background), `placeholder` #D9D9D9 — pulled from Figma fills,
  cross-checked against the raw fill values in an SVG export, both match.
- **Spacing/radius:** 32px horizontal content padding and an 8px corner
  radius on every image/card container are measured from the real
  `cornerRadius` and x/y offset fields in the Figma node tree.
- **Fonts:** Knockout (display/all-caps headlines) and Ringside Narrow
  (body/UI) throughout, Ringside Regular once for the "Think Inside The
  Box" hero headline. **Both are commercial fonts** — not on Google
  Fonts. License them and drop files in `public/fonts/`, then fill in the
  `@font-face` rules stubbed out in `src/index.css`.
- **Section order:** HP-23 is a free-form canvas (no auto-layout), so
  order was derived by sorting top-level frames/groups by absolute Y
  position: Nav → Masthead → headline → Proof (stats) → Fresh Out Of The
  Box (portfolio masonry grid) → HI/AI (green section) → Get On The Soap
  Box (PR/social) → What's Happening (awards) → From The Inside Out
  (culture) → CTA → Footer.
- **Portfolio grid is a real masonry layout** (2-column CSS `columns`,
  varying card heights), confirmed from the rendered PDF — not a uniform
  grid.
- **HI/AI section**: solid green card, not a photo background. The big
  headline is the lorem-ipsum line ("Quisque fauci ex vitae sem
  plarat."); "Human Imagination® x Artificial Intelligence" is a small
  badge/tagline, not the headline. There's a row of 6 icon badges
  layer-named RW / 11 / MJ / MJ / Claude / MJ in the source file — almost
  certainly AI tool logos (Runway, ElevenLabs, Midjourney ×3, Claude),
  rendered here as labeled placeholders since the real vector icons
  weren't exported.
- **Nav order/alignment:** real order left→right is "Independent Since
  1948" → DE logo (exactly centered on the frame, not left-aligned) →
  About/Careers/Contact. Built as a 3-column grid so the logo stays
  centered regardless of side-text width.

## What's still placeholder

- **Every image is a plain `<img src="..." alt="...">` tag**, written
  directly in each section file — no wrapper component. Every `src`
  already points at the exact filename it needs in `public/images/`
  (full list in `public/images/README.txt`); drop files in with those
  names and they just work, no code changes needed. Each has real `alt`
  text describing the intended photo.
- **Masthead is the one real photo** — place the file at
  `public/images/masthead.jpg` (code already points there).
- One duplicate/hidden draft footer in the file was skipped in favor of
  the visible one.
- Logo mark (Nav + Footer) is a plain square outline, not the real
  vector mark — needs the actual icon exported.

## How this was built (for future frames)

MCP hit Figma's Starter-plan tool-call limit partway through, so this was
pulled via the plain Figma REST API instead, using a personal access
token, run from your machine (this sandbox can't reach api.figma.com
directly):

1. `GET /v1/files/:key?depth=2` → shallow page/frame tree, to find
   HP-23's node id (`1642:454`) without pulling the whole 70,910×13,232px
   DE5 canvas at once (that's what caused the original MCP timeout).
2. `GET /v1/files/:key/nodes?ids=1642:454` → full node tree for just that
   frame: text content, fills, fonts, layout, `cornerRadius`, x/y offsets,
   component instance refs.
3. Cross-checked colors against a raw SVG export, then cross-checked
   layout/structure against a rendered PDF export (much easier to render
   than the SVG, which was 200MB+ and choked this sandbox's SVG parser).

To pull another frame (ABOUT, CONTACT, SOCIAL, ARCHIVE — all siblings of
HP-23 on the DE5 page), repeat step 2 with the frame's node id from the
step-1 tree, then translate the node JSON into `src/sections/*.jsx` the
same way as here — and get a rendered PDF/PNG export early if possible,
it catches structural mistakes (masonry vs. grid, wrong section content,
wrong nav order) that the raw JSON alone doesn't make obvious.

## Next steps

1. Export real images (Figma `GET /v1/images/:key?ids=...&format=png`
   per image node, or the MCP `download_assets` tool once quota resets)
   and drop them into `public/images/` using the exact filenames listed
   in `public/images/README.txt`.
2. License Knockout + Ringside, add font files, wire up `@font-face`.
3. Export the real logo/icon vectors (Nav, Footer, HI/AI icon row).
4. Build out the other DE5 frames (ABOUT, CONTACT, SOCIAL) as additional
   pages using the same `src/design-system/` primitives.

## Running locally

```
npm install
npm run dev
```

## Versioning

Standard semver (`Major.Minor.Patch`) in `package.json`'s `version` field,
starting from `5.0.0-alpha`. Bump it whenever a change warrants it:

- **Patch** — bug fixes and corrections to already-built sections (wrong
  spacing/aspect-ratio/color fixes, copy corrections, etc.).
- **Minor** — new sections/features added.
- **Major** — breaking changes.

No automation for this yet; it's a manual judgment call made alongside
whatever change prompted it.

## A note on file persistence

This project has had to be regenerated from scratch a few times during
this session — files placed in this sandbox's output folder don't
reliably persist between turns unless a real folder is connected. If
you're moving files around locally, it's worth keeping your own copy
somewhere durable (or connecting a folder) rather than relying on this
session to still have earlier versions around.
