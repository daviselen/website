// The home page's "What's Happening" 3-up (NewsAwards), filled with the next
// three case studies after the current page in home-page order.
import { useRef } from "react";
import Card from "../design-system/components/Card.jsx";
import HeadingReveal from "../design-system/components/HeadingReveal.jsx";
import { useStaggerReveal } from "../design-system/animation.js";
import { nextWork } from "../data/work.js";

export default function MoreWork({ current }) {
  const gridRef = useRef(null);
  useStaggerReveal(gridRef, { amount: 0.333 });

  return (
    <section id="more-work" className="px-300 pt-1000 md:pt-3000 lg:px-8">
      <HeadingReveal
        as="h2"
        text={`More \nWork`}
        className="mb-400 font-display text-fluid-2xl uppercase leading-none md:text-8xl lg:mb-1000 lg:text-display-h3"
      />
      <div ref={gridRef} className="grid gap-600 md:grid-cols-3 md:gap-1000 lg:gap-8">
        {nextWork(current).map(({ title, client, src, to }) => (
          <Card
            key={to}
            heading={title}
            body={client}
            src={src}
            alt={`${title} for ${client}`}
            to={to}
            size="med"
            aspect="11/10"
          />
        ))}
      </div>
    </section>
  );
}
