# Figma → code workflow

Checklist for pulling any DE5 frame into this codebase, written after a
pass that got most of the way there but missed real things — each item
below exists because of a specific miss, noted in parens.

## 0. Before touching a single tool call

Load the `figma-design-to-code` skill (`skill://figma/figma-design-to-code/SKILL.md`)
first, every time, even if it feels like overhead for a "quick" pull. It's
a mandatory gate for a reason: skipping it once this project led straight
to hand-parsing raw REST JSON for an entire session instead of using the
tool actually built for this. (Miss: the whole first pass at HP-26.)

## 1. Pull design context — don't hand-read raw JSON

Call `get_design_context` on the target node. It returns reference
React+Tailwind code, a screenshot, and resolved values in one call — treat
the code as a reference to adapt, not something to paste verbatim, but
trust its resolved sizes/colors/text over anything hand-derived from the
Figma REST API. Only fall back to the raw REST API (`/v1/files/:key/nodes`)
if MCP is genuinely unreachable, and say so explicitly rather than quietly
treating the fallback as equivalent — it isn't; it's why fonts, sizes, and
structure all drifted the first time.

## 2. Always call get_variable_defs — don't infer from fallback values

`get_design_context`'s arbitrary-value classes embed a CSS var with a
fallback, e.g. `var(--scale/400,32px)`. It's tempting to just use the
fallback number and skip the variable. Don't — call `get_variable_defs`
on the same node and name Tailwind tokens after the *real* variable/style
names (`tailwind.config.js` in this repo does this: `surface.alt`,
`neutral.500`, `Scale/400` → `spacing["400"]`, etc.). If a variable gets
redefined in Figma later, a token named after it is the thing that should
change; a bare `#1F1F1F` with no name isn't. (Miss: colors and the button
green were guessed from raw fills instead of resolved variables for most
of this project's history.)

## 3. Check for reusable components before writing new markup

Before implementing a section, check whether Figma's `card`/`button`/
`Nav`/`de-logo` components (or new ones you've added) are used by more
than one part of the frame you're building. If so, write ONE React
component matching it and reuse it — don't let two sections duplicate the
same markup because they were built in separate passes. `Card.jsx` and
`DeLogo.jsx` in `src/design-system/components/` exist because Proof and
News/Awards both use Figma's `card` component, and Nav and Footer both
use `de-logo`, but each originally got its own hand-rolled copy.

If Code Connect is available on the Figma plan/seat (`get_code_connect_suggestions`
— on this account it currently returns "you need a Dev or Full seat on an
Organization or Enterprise plan"), use it to get a maintained, explicit
mapping instead of the manual reuse-check above. Check this every time a
new component gets added in Figma, since plan/seat status can change.

## 4. Real assets, not approximations — and know the actual constraint

`download_assets` returns real exported URLs (flattened single-file
exports for icons are the easiest to consume — ask for a whole node's
`export`, not its raw layer fragments, for anything built from masks/
clip-paths). The actual limitation is narrower than "can't get images":
this sandbox's network proxy blocks `figma.com` entirely, so those URLs
can't be fetched from here — but `get_screenshot`'s `enableBase64Response`
flag *does* work for visual verification (it renders inline, viewable,
even though the bytes can't be saved from here). Concretely:

- Use `get_screenshot(enableBase64Response: true)` to actually look at an
  asset before approximating it in code.
- Package every real asset URL into one fetch script (see
  `fetch_hp26_assets.py`) for the person to run locally — URLs expire in
  ~7 days, so flag that explicitly and don't let it sit.
- Never ship a colored `<div>` standing in for a real icon/illustration
  without saying so in a comment. One is fine as a deliberate, called-out
  simplification (see `HumanAI.jsx`'s dashed-circle diagram); a whole page
  of them without disclosure is what happened the first time.

## 5. Decorative/illustration groups: ask for Export Settings, don't decompose

If a group is a complex diagram (arrows, charts, many small vector pieces)
rather than a real layout, don't try to reproduce every piece in CSS.
Ask whoever owns the file to add Export Settings on that group (bottom of
the right panel in Figma → Export → add a preset, SVG for anything with
type in it) — `download_assets` explicitly prefers a node's configured
export settings when present. Once that's set, pull it as one flattened
asset instead of guessing at geometry.

## 6. Type scale and text-box-trim

- Check every headline's real font-size/line-height against
  `get_variable_defs`/the reference code before capping it at a default
  Tailwind step. This codebase's big headlines are 360/184/144/80/64px —
  all bigger than Tailwind's largest default (`text-9xl` = 128px). Add
  named `fontSize` tokens in `tailwind.config.js` rather than reaching for
  the closest default class.
- Copy `[text-box-edge:cap_alphabetic] [text-box-trim:trim-both]` (or the
  global rule in `src/index.css`) onto text rather than dropping it because
  it looks unfamiliar — it's real CSS matching exactly how Figma measures
  its own text boxes. It's not Baseline yet, but it's a no-risk progressive
  enhancement (unsupported browsers just ignore it).

## 7. Never infer a class from a sibling's pattern — check the actual node

Don't add padding/margin/etc. to an element because a similar-looking
element elsewhere in the file has it. Find that specific element's node in
the reference code and use what's actually there. (Miss: Masthead's text
block got a `px-8` added to it because other sections open with `px-8` —
but the real "TITB" node has no horizontal padding of its own at all; it
relies on the shared section-level inset like its sibling, the hero image,
does. Pattern-matching instead of checking doubled the padding on desktop
and added an inset on mobile that wasn't supposed to be there.) If the
reference code for that exact node isn't in hand, that's a sign to go
re-check it, not to extrapolate.

## 8. Padding doesn't move a border or background — margin/width does

If an element has its own background color or border (a card, a footer
rule, anything that's supposed to look "inset" or "floating" relative to
the page edge), check whether that inset comes from the element's own
padding or from an ancestor further up shrinking the available width.
Figma models most of this page's sections as relying on a shared ancestor
wrapper's padding, not their own — so a section with no bg/border just
needs its own `px-8` to look right (padding and "an ancestor already
shrank my box" produce the same visual result for plain content). But a
section that DOES have its own bg/border/rounded-corners needs that inset
reproduced as margin (or a width constraint), because padding only
repositions the content inside the box — it never moves where the box's
own background, border, or corners render. (Miss: both the Footer's
top/bottom rule and the HI/AI section's rounded dark card were using
`px-8` for this and rendering edge-to-edge; the one exception — Nav — is
correctly `px-8` because Nav's bg/border really are meant to span
edge-to-edge in the source file. Check the specific node, per #7, rather
than assuming every bg/border/rounded box behaves the same way.)

## 9. A "masonry" stagger needs column-independent flow — not grid, not flex-wrap

CSS Grid and flexbox `flex-wrap` are both ROW-based: every item sharing a
grid row (or a wrapped flex line) is sized against that row's tallest
member, so a short item just leaves blank space in its own cell — it
can't let a sibling column's next item start earlier than the row's
tallest item does. Tried plain CSS Grid first, on the theory that
auto-placement would let a short first item (a heading) shift its own
column down relative to the other one; it doesn't, because grid doesn't
work that way. `flex-wrap` + `gap` has the identical row-based
limitation. The CSS multi-column module (`columns: 2`) is the one that's
actually column-independent — but by default (`column-fill: balance`) it
assigns items to columns itself, trying to equalize total column height,
which is a different goal than "this specific heading + these 4 specific
cards on the left, these other 4 on the right." Don't trust balance mode
to happen to land on a specific real assignment — force it explicitly
with `break-before-column` (real Tailwind utility, verified against
tailwindcss.com/docs/break-before before using it) on the exact item that
should start the second column. That's simpler than manually splitting
content into two separate flex containers, but note the trade-off: forcing
a specific column split means the source order has to be grouped (all of
column 1's items, then all of column 2's items) rather than the nicer
interleaved reading order — which is also what a single-column mobile
layout falls back to. Don't invent a `-mt-[Npx]` offset to fake any of
this from outside a layout that doesn't naturally produce it — that
number is just "height of what came before + the gap," and silently
drifts out of sync the moment either of those things changes.

## 10. Know what "verify" actually means here — I can't see the file

Everything in this doc about "check the real node" means check the data
a tool returned (JSON, reference code, a screenshot) — not that I've
looked at the Figma file itself the way a person with it open can. That
matters most for anything involving repeated/near-identical values across
several similar nodes (e.g. a gradient overlay repeated on 8 portfolio
cards): raw per-node numbers can look like meaningful per-item variation
when they're actually measurement noise (e.g. percentages computed
relative to a mask's bounding box that isn't quite the same as the
visible crop, across otherwise-identical elements). Don't present a
"there's real per-item variation here" conclusion with the same
confidence as something read directly off one unambiguous field — flag
the uncertainty, and treat a direct correction from someone who can
actually see the file as higher-confidence than a pattern spotted in raw
exported numbers.

## 11. Verify before calling it done

End every pull with `get_screenshot` on the same node and a visual
side-by-side against the rebuilt page — not just "the JSON says X."
Structural mistakes (masonry vs. grid, which section a headline belongs
to, footer column layout) have consistently been the kind that raw JSON
reading alone doesn't catch but a screenshot does immediately.
