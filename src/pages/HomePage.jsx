// HP-23, built section-by-section from the real Figma node tree
// (fileKey tnP43NMbcFkzFKMsdpukDn, node 1642:454), in real page order
// (sorted by absolute Y position — the Figma frame uses free-form
// canvas placement, not auto-layout, so order isn't implicit in the
// children array), cross-checked against a rendered PDF export.
import NavBar from "../sections/NavBar.jsx";
import Masthead from "../sections/Masthead.jsx";
import Proof from "../sections/Proof.jsx";
import PortfolioGrid from "../sections/PortfolioGrid.jsx";
import HumanAI from "../sections/HumanAI.jsx";
import SocialPR from "../sections/SocialPR.jsx";
import NewsAwards from "../sections/NewsAwards.jsx";
import FromInsideOut from "../sections/FromInsideOut.jsx";
import CTABanner from "../sections/CTABanner.jsx";
import Footer from "../sections/Footer.jsx";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink font-narrow text-paper">
      <NavBar />
      <Masthead />
      <Proof />
      <PortfolioGrid />
      <HumanAI />
      <SocialPR />
      <NewsAwards />
      <FromInsideOut />
      <CTABanner />
      <Footer />
    </div>
  );
}
