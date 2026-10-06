// Updated for HP-26 (node 1715:634 in the DE5 file), which rebuilt the
// homepage with real autolayout — children now come in true visual order,
// no more sorting by absolute Y like HP-23 required. "SocialPR" was merged
// into "FromInsideOut" (HP-26 groups them under one "FROM THE INSIDE OUT"
// heading and drops the old "DE Tuesdays" card), so SocialPR.jsx is no
// longer used here — kept in the repo in case a future frame needs it
// standalone again.
import { useEffect, useState } from "react";
import Masthead from "../sections/Masthead.jsx";
import Proof from "../sections/Proof.jsx";
import PortfolioGrid from "../sections/PortfolioGrid.jsx";
import HumanAI from "../sections/HumanAI.jsx";
import FromInsideOut from "../sections/FromInsideOut.jsx";
import NewsAwards from "../sections/NewsAwards.jsx";
import CTABanner from "../sections/CTABanner.jsx";

// Everything below the masthead, in page order. On the first page load these
// mount one per idle callback instead of in the same render as the masthead:
// mounting them all at once (plus each one's GSAP/ScrollTrigger setup) was a
// single ~140ms main-thread task, which is most of PageSpeed's Total Blocking
// Time. Split up, each mount is its own short task. ScrollTrigger positions
// stay correct without help — animation.js re-measures whenever the body's
// height changes, which every one of these mounts does.
const BELOW_FOLD_SECTIONS = [
  Proof,
  PortfolioGrid,
  HumanAI,
  FromInsideOut,
  NewsAwards,
  CTABanner,
];

// Upper bound on how long each step waits for an idle period, so a busy main
// thread still gets the whole page within a few hundred ms.
const IDLE_TIMEOUT_MS = 200;

// Only the very first home render is staged. Returning to Home through the
// page transition renders everything at once, as before, so the transition's
// scroll handling always sees the full page height.
let stagedOnce = false;

function useStagedCount(total) {
  const [count, setCount] = useState(() => (stagedOnce ? total : 0));

  useEffect(() => {
    if (count >= total) {
      stagedOnce = true;
      return undefined;
    }
    // Safari has no requestIdleCallback; a 1ms timeout still yields to
    // paint and input between steps.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setCount((c) => c + 1), {
        timeout: IDLE_TIMEOUT_MS,
      });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setCount((c) => c + 1), 1);
    return () => window.clearTimeout(id);
  }, [count, total]);

  return count;
}

export default function HomePage() {
  const mounted = useStagedCount(BELOW_FOLD_SECTIONS.length);

  return (
    // pb-1800 (144px = Scale/1800) reproduces trailing space below the
    // page's last element. Verified against the real reference: the
    // "160px spaxer" frame wrapping [cta-block, Footer] has its own
    // `pb-[var(--scale/1800,144px)]` after Footer — that's genuinely
    // there in the source, not "whatever felt right" — this page was
    // missing it entirely, so the bottom border sat flush against the
    // end of the page with nothing after it.
    // Root Organization item: the one place schema.org microdata scattered
    // across child sections (NavBar's foundingDate, Masthead's slogan,
    // NewsAwards' award text, Footer's logo/email/telephone/location) all
    // nest under. `name`/`url` have no single matching visible text node
    // on the page to attach itemProp to directly, so they're hidden <meta>
    // tags instead — both values are real, already established elsewhere
    // in this repo (package.json's "description"/"homepage" fields), not
    // invented here.
    //
    // PortfolioGrid's and FromInsideOut's CreativeWork cards are their own
    // separate itemScope items, not nested inside this one — a page is
    // allowed multiple independent schema.org Items, and there's no single
    // schema.org property that correctly expresses "this Organization's
    // list of case studies," so they're left unlinked rather than forcing
    // one.
    <div
      itemScope
      itemType="https://schema.org/Organization"
    >
      <meta itemProp="name" content="Davis Elen Advertising" />
      <meta itemProp="url" content="https://daviselen.com" />

      <Masthead />
      {/* Index keys are stable here: the list only ever grows at the end. */}
      {BELOW_FOLD_SECTIONS.slice(0, mounted).map((Section, i) => (
        <Section key={i} />
      ))}
      {/* Holds the Footer (rendered by Layout, right after this page) at
          least a screen below the masthead while sections are still
          mounting. Without it the Footer starts in view and gets pushed
          down by every mount — a layout shift PageSpeed scored at 0.24. */}
      {mounted < BELOW_FOLD_SECTIONS.length && (
        <div className="h-screen" aria-hidden="true" />
      )}
    </div>
  );
}
