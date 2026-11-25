// The home page's "What's Happening" 3-up (NewsAwards), filled with the next
// three case studies after the current page in home-page order.
//
// Below md it is the home page's phone strip instead: a native scroll-snap
// scroller (see PortfolioGrid's static mode) with a sliver of the next card
// showing and a draggable progress bar under it. md and up is the 3-up grid.
import { useRef } from "react";
import Card from "../design-system/components/Card.jsx";
import HeadingReveal from "../design-system/components/HeadingReveal.jsx";
import ScrollIndicator from "../design-system/components/ScrollIndicator.jsx";
import { LINE_DELAY, useStaggerReveal } from "../design-system/animation.js";
import { nextWork } from "../data/work.js";

export default function MoreWork({ current }) {
  const scrollerRef = useRef(null);
  const gridRef = useRef(null);
  useStaggerReveal(gridRef, { amount: 0.333, fadeOnly: true });
  const items = nextWork(current);

  return (
    <section id="more-work" className="px-300 pt-1000 md:pt-3000 lg:px-8">
      <HeadingReveal
        as="h2"
        text={`More \nWork`}
        className="mb-400 font-display text-fluid-2xl uppercase leading-none md:text-8xl lg:mb-1000 lg:text-display-h3"
      />
      {/* -mx-300 pulls the scroller out to the screen edges below md, so cards
          scroll under the page gutter; the strip's own pl-300 puts the first
          card back on it. The right gutter is a 1px `after` item rather than
          padding, which an overflowing flex container does not scroll to.
          Hidden again at md, where the strip becomes the grid. The strip never
          scrolls vertically (overflow-y-hidden), so pb-300 gives the card
          text's descenders room instead of clipping them, and -mb-300 hands
          that room back to the layout. */}
      <div
        ref={scrollerRef}
        className="-mx-300 -mb-300 snap-x snap-mandatory scroll-px-300 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-300 scrollbar-none md:mx-0 md:mb-0 md:snap-none md:overflow-visible md:pb-0"
      >
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- Safari drops list semantics when list-style is none */}
        <ul
          ref={gridRef}
          role="list"
          className="flex gap-x-300 pl-300 after:-ml-px after:block after:w-px after:shrink-0 md:grid md:grid-cols-3 md:gap-1000 md:pl-0 md:after:hidden lg:gap-8"
        >
          {items.map(({ title, client, src, to }, i) => (
            // basis-5/6 of the strip's content box leaves the same ~40px
            // sliver of the next card as the home page's strip.
            <li key={to} className="max-w-lg shrink-0 basis-5/6 snap-start md:max-w-none md:basis-auto">
              <Card
                heading={title}
                body={client}
                src={src}
                alt={`${title} for ${client}`}
                to={to}
                size="med"
                aspect="image-card"
                maskReveal
                maskDelay={i * LINE_DELAY}
              />
            </li>
          ))}
        </ul>
      </div>
      <ScrollIndicator scrollerRef={scrollerRef} count={items.length} className="md:hidden" />
    </section>
  );
}
