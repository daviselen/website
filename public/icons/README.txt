Real vector icon exports (flattened single SVGs, pulled via the Figma
MCP's download_assets tool — actual geometry, not the colored-div
approximations used in earlier passes). Run ../../fetch_hp26_assets.py
from inside public/ to fill these in; the URLs expire in ~7 days.

de-logo.svg           Nav + Footer "DE" logo mark (same file, two places)
hi-mark.svg            "Human Imagination x AI" badge icon (HumanAI.jsx)
de-cube-icon-1.svg     Green cube icon, decorative HI/AI diagram
de-cube-icon-2.svg     Red cube icon, decorative HI/AI diagram
ai-cube-icon.svg       Cyan cube icon, decorative HI/AI diagram

Not fetched (deliberately simplified instead — see the comment at the top
of HumanAI.jsx): the dashed-circle/arrow chart graphic in the HI/AI
section. That's a lot of tiny decorative vector pieces for very little
visual payoff; a plain CSS circle + the 3 cube icons above stands in for
it. Ask Claude to pull the real "Chart" group (nodeId 1715:749) if you
want it exact.
