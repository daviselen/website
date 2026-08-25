// Rebuilt from get_design_context's real reference for the "FOOTB" group.
//
// Back to CSS multi-column (`columns-2`) for real per-column masonry flow
// — simpler than two hand-split flex containers, and this actually does
// solve the row-sharing problem that plain grid/flex-wrap can't (see the
// note that used to live here about why those failed; kept here for
// context: both are row-based layout models, every item sharing a row is
// sized against that row's tallest member, so a short item can't make a
// sibling column's next item start earlier — `columns` is genuinely
// column-independent, which is what a masonry stagger needs).
//
// The one thing `columns` doesn't give you for free: which items land in
// which column. Its default (`column-fill: balance`) tries to equalize
// total column height, which is NOT the same goal as "heading + these 4
// specific cards on the left, these other 4 on the right" — so instead of
// trusting the balance algorithm to happen to land there, this forces the
// break explicitly with `break-before-column` on the exact card that's
// supposed to start the second column (verified this utility is real
// Tailwind, not assumed: tailwindcss.com/docs/break-before). That also
// means the array below is grouped (heading + all 4 left-column cards,
// then all 4 right-column cards) rather than the interleaved reading
// order used previously — on mobile (`columns-1`), cards now read
// grouped-by-column instead of interleaved. That's a real trade-off for
// the simpler code, not a free win — if the interleaved mobile order
import HeadingReveal from "../design-system/components/HeadingReveal";
import ProjectCard from "../design-system/components/ImageCard";

// matters, that's worth a separate ask.
const projects = [
  {
    title: "We Got You",
    client: "Toyota",
    src: "/images/portfolio-we-got-you-toyota.jpg",
  },
  {
    title: "Alex in the Wild",
    client: "Smart & Final",
    src: "/images/portfolio-alex-in-the-wild-smart-final.jpg",
  },
  {
    title: "Beyond The Arches",
    client: "McDonald's",
    src: "/images/portfolio-beyond-the-arches-mcdonalds.jpg",
  },
  {
    title: "Keys To Tech",
    client: "DICE",
    src: "/images/portfolio-keys-to-tech-dice.jpg",
  },
  {
    title: "Hola Mexico Film Festival",
    client: "McDonald's",
    src: "/images/portfolio-hola-mexico-mcdonalds.jpg",
    startColumn2: true,
  },
  {
    title: "Let's Admit It",
    client: "Best Buy Health",
    src: "/images/portfolio-lets-admit-it-best-buy-health.jpg",
  },
  {
    title: "Legendary Partners",
    client: "Los Angeles Lakers",
    src: "/images/portfolio-legendary-partners-lakers.jpg",
  },
  {
    title: "Super Snorkel Tours",
    client: "Body Glove Cruises",
    src: "/images/portfolio-super-snorkel-body-glove.jpg",
  },
];

export default function PortfolioGrid() {
  return (
    <section id="portfolio-grid" className="px-8 pt-3000 pb-0">
      <div className="columns-1 gap-x-8 md:columns-2">
        <HeadingReveal
          as="h2"
          text={`Fresh Out \nof the Box`}
          className="mb-2000 font-display text-6xl uppercase leading-none break-inside-avoid md:text-8xl lg:text-display-h2"
          />
        {projects.map((p) => (
          <ProjectCard key={p.title + p.client} {...p} />
        ))}
      </div>
    </section>
  );
}
