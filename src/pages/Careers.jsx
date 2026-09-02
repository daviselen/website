import JobOpenings from "../sections/JobOpenings.jsx";
import CTABanner from "../sections/CTABanner.jsx";

// NavBar and Footer are not rendered here: Layout.jsx already mounts both
// around every route, and its wrapper supplies the page background, the
// font-narrow/neutral-0 defaults, and the py-1800 that clears the fixed
// header.
//
// CTABanner stays on the page even when there are no openings, so the empty
// state reads as intentional — it carries real, human-written contact copy
// and a route into a conversation, which is the useful thing to offer someone
// who came here and found nothing listed.
export default function Careers() {
  return (
    <div>
      <JobOpenings />
      <CTABanner />
    </div>
  );
}
