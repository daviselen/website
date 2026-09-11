# Repository Guidelines

React 18 + Vite + Tailwind rebuild of the DE5 Figma file (`tnP43NMbcFkzFKMsdpukDn`). Figma is the source of truth; the code chases it.

## Project Structure & Module Organization

- `./src/main.jsx` — `createBrowserRouter` routes (`/`, `/about`) wrapped by `./src/components/Layout.jsx`.
- `./src/sections/` — one component per Figma section frame, each rendering a stable `id` (`#masthead`, `#human-ai`, …) that the visual tests select on. Renaming an id breaks `./tests/visual/design-diff.spec.js`.
- `./src/design-system/components/` — components that exist because a Figma component (`card`, `button`, `de-logo`) is used by more than one section. Check here before writing new markup.
- `./DESIGN.md` is the token reference; `./tailwind.config.js` is its implementation. The two are synced **by hand** — neither generates the other, so change both.
- `./src/index.css` holds the `@font-face` blocks. Knockout ships as separate family-named cuts (Featherwt/Bantamweight), not one family with a weight axis.

## Build, Test, and Development Commands

```bash
npm run dev                       # vite dev server on :5173
npm run build                     # production build (CI gate)
npm run lint                      # eslint .; lint:fix to autofix
npm run test:visual               # playwright; auto-boots dev server
npm run test:visual -- design-diff # pixel diff vs committed Figma exports (CI)
npx playwright test -g masthead   # single section
npm run test:visual:report        # open last HTML report
```

## Coding Style & Naming Conventions

Prettier: double quotes, semicolons, trailing commas, 80 cols, 2-space indent. ESLint flat config layers react, react-hooks, jsx-a11y, and tailwindcss; `react/prop-types` is off (plain JS, no PropTypes anywhere).

`tailwindcss/no-arbitrary-value` and `no-custom-classname` are **errors**. The file lists in `./eslint.config.js` downgrade them to warn for pre-existing files only — new files get no exemption. Name tokens after real Figma variables (`surface.alt`, `spacing["400"]` ↔ `Scale/400`), never hex or raw px.

## Testing Guidelines

`./tests/visual/design-diff.spec.js` diffs each section against a committed `./tests/visual/design/<name>.png` export via pixelmatch. Exports must be @1x at 1792px, cropped to exact frame bounds (see `./tests/visual/design/README.md`); >24px size drift fails as misconfiguration. Regression snapshots tolerate a 2% pixel ratio and are macOS baselines — CI runs design-diff only.

## Figma Pulls

Run `/figma-pull` (`./.claude/skills/figma-pull/SKILL.md` → `./.claude/workflows/figma-pull.js`). Manual fallback and the rationale for each rule live in `./FIGMA_WORKFLOW.md`: use `get_design_context` over raw REST JSON, always call `get_variable_defs`, and close every pull with a `get_screenshot` side-by-side.

## Commit & Pull Request Guidelines

Short imperative subjects, sentence case, no prefix or scope: `Build About page`, `Fix image card expansion bug`. No PR template; CI runs build on every PR and uploads visual diff artifacts.
