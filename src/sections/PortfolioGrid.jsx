// Rebuilt from get_design_context's real reference for the "FOOTB" group.
//
// Two independent flex columns, split at the startColumn2 boundary. This
// replaced CSS multi-column (`columns-2`): multi-column's default
// `column-fill: balance` rebalances column heights whenever content grows,
// so growing a card on hover (aspect-[11/4] -> aspect-[55/36]) pushed the
// last card of column 1 into column 2. Flex columns pin each card to a
// fixed column, so hover growth stays contained in its own column.
//
// The array below stays grouped (all 4 left-column cards, then all 4
// right-column cards) rather than interleaved reading order — on mobile
// (single stacked column) cards read grouped-by-column. That's a real
// trade-off; if the interleaved mobile order matters, that's a separate ask.
import HeadingReveal from "../design-system/components/HeadingReveal";
import ProjectCard from "../design-system/components/ImageCard";

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
    videoSrc: {
      webm: "/videos/portfolio-hola-mexico-mcdonalds.webm",
      mp4: "/videos/portfolio-hola-mexico-mcdonalds.mp4",
    },
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
  // Split at the startColumn2 boundary into two fixed column groups.
  // Two independent flex columns instead of CSS `columns-2`: multi-column's
  // default `column-fill: balance` rebalances column heights, so growing a
  // card on hover pushed col 1's last card into col 2. Flex columns pin each
  // card to its column, so hover growth stays contained.
  const splitIndex = projects.findIndex((p) => p.startColumn2);
  const columns = [projects.slice(0, splitIndex), projects.slice(splitIndex)];

  return (
    <section id="portfolio-grid" className="px-8 pt-3000 pb-0">
      <div className="flex flex-col gap-x-8 md:flex-row">
        {columns.map((column, i) => (
          <div key={i} className="flex flex-1 flex-col">
            {i === 0 && (
              <HeadingReveal
                as="h2"
                text={`Fresh Out \nof the Box`}
                className="mb-1000 font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-h3"
              />
            )}
            {column.map((p) => (
              <ProjectCard key={p.title + p.client} {...p} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
