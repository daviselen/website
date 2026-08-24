// Updated for HP-26 (node 1715:634 in the DE5 file), which rebuilt the
// homepage with real autolayout — children now come in true visual order,
// no more sorting by absolute Y like HP-23 required. "SocialPR" was merged
// into "FromInsideOut" (HP-26 groups them under one "FROM THE INSIDE OUT"
// heading and drops the old "DE Tuesdays" card), so SocialPR.jsx is no
// longer used here — kept in the repo in case a future frame needs it
// standalone again.
import NavBar from "../sections/NavBar.jsx";
import Masthead from "../sections/Masthead.jsx";
import Proof from "../sections/Proof.jsx";
import PortfolioGrid from "../sections/PortfolioGrid.jsx";
import HumanAI from "../sections/HumanAI.jsx";
import FromInsideOut from "../sections/FromInsideOut.jsx";
import NewsAwards from "../sections/NewsAwards.jsx";
import CTABanner from "../sections/CTABanner.jsx";
import Footer from "../sections/Footer.jsx";

export default function HomePage() {
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
      <Proof />
      <PortfolioGrid />
      <HumanAI />
      <FromInsideOut />
      <NewsAwards />
      <CTABanner />
    </div>
  );
}
