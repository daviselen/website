Drop real image exports here, named to match what each section references:

- masthead.jpg  → Masthead hero background (red Supra drifting, night bridge)

Every other image slot on the page currently renders as a real <img> tag
pointing at an inline SVG placeholder (see
src/design-system/components/ImagePlaceholder.jsx) — swap those to real
<img src="/images/....jpg"> once assets are exported.
