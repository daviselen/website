# DE5 Website — HP-23 homepage

React + Tailwind build of the **HP-23** frame from the DE5 Figma file
(`tnP43NMbcFkzFKMsdpukDn`, node `1642:454`), pulled via the Figma REST API
(MCP hit a Starter-plan rate limit partway through) and cross-checked
against a raw SVG export and a rendered PDF export.

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

## A note on file persistence

This project has had to be regenerated from scratch a few times during
this session — files placed in this sandbox's output folder don't
reliably persist between turns unless a real folder is connected. If
you're moving files around locally, it's worth keeping your own copy
somewhere durable (or connecting a folder) rather than relying on this
session to still have earlier versions around.
