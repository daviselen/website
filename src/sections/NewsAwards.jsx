// From HP-26 "news" group — same real "card" component as Proof, shared
// via <Card /> rather than a second hand-rolled implementation. Image
// aspect is 6/5, same as Proof, which is <Card />'s default — no
// override needed here.
import { useRef } from "react";
import Card from "../design-system/components/Card.jsx";
import HeadingReveal from "../design-system/components/HeadingReveal.jsx";
import { useStaggerReveal } from "../design-system/animation.js";
import { newsHighlights } from "../data/newsHighlights.js";

export default function NewsAwards() {
  const gridRef = useRef(null);

  // Note the ref goes on the inner grid, NOT the <section> — the section also
  // contains the HeadingReveal, which runs its own reveal and must not be
  // caught by the stagger's direct-child selector.
  useStaggerReveal(gridRef, { amount: 0.333 });

  return (
    <section id="news-awards" className="mt-1000 px-2 lg:mt-0 lg:px-8">
      <HeadingReveal
        as="h2"
        text={`What's \nHappening`}
        className="mb-400 font-display text-6xl uppercase leading-none md:text-8xl lg:mb-1000 lg:text-display-h3"
        />
      {/* headingItemProp="award": these headings are real awards, so each
          one becomes a value of the page-level Organization item's
          `award` property (a plain Text property — see HomePage.jsx for
          where that Organization itemScope starts). */}
      <div ref={gridRef} className="grid gap-1000 md:grid-cols-3 lg:gap-8">
        {newsHighlights.map((a) => (
          <Card key={a.heading} {...a} headingItemProp="award" size="med" />
        ))}
      </div>
    </section>
  );
}
