# Design references

Committed Figma exports used by `design-diff.spec.js` as the source of truth.

## Naming

`<section-name>.png` — matches the `name` in the `SECTIONS` list and the
section's component. Example: `humanai.png` ↔ `src/sections/HumanAI.jsx`.

## Export rules (must match the render or pixelmatch fails)

1. Export the **section** frame at **@1x** (1792px wide).
2. Playwright renders at `viewport.width` 1856 (the full-site design width);
   the `#human-ai` card has `mx-8` (32px) margins, so it renders at
   1856 − 64 = 1792px — matching the section frame. `deviceScaleFactor` is 1.
3. Crop to the exact frame bounds — no surrounding padding.
4. Small height slack (the artboard is a bit taller than the rendered card)
   is auto-handled: both images are cropped to their common top-left region
   before diffing (up to 24px; beyond that the test fails as misconfigured).
5. Commit these PNGs (they are the baseline). Generated diffs land in
   `../output/` and are gitignored.
