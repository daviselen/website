// From HP-23 "FOOTB" group — the case-study card grid. Real client/project
// pairs pulled straight from the Figma text nodes.
//
// Confirmed from a rendered PDF export: this is a 2-column MASONRY layout
// (cards of varying height, staggered independently per column), not a
// uniform grid — matches the Figma data too, which only has 2 distinct
// column x-offsets (32px apart) but no shared row heights. Built with CSS
// columns; aspect ratios approximate what's visible in the PDF render.
// Drop real files into public/images/ using the names below.
const projects = [
  {
    title: "Hola Mexico Film Festival",
    client: "McDonald’s",
    aspect: "aspect-square",
    src: "/images/portfolio-hola-mexico-mcdonalds.jpg",
  },
  {
    title: "We Got You",
    client: "Toyota",
    aspect: "aspect-[3/4]",
    src: "/images/portfolio-we-got-you-toyota.jpg",
  },
  {
    title: "Let’s Admit It",
    client: "Best Buy Health",
    aspect: "aspect-square",
    src: "/images/portfolio-lets-admit-it-best-buy-health.jpg",
  },
  {
    title: "Alex in the Wild",
    client: "Smart & Final",
    aspect: "aspect-square",
    src: "/images/portfolio-alex-in-the-wild-smart-final.jpg",
  },
  {
    title: "Legendary Partners",
    client: "Los Angeles Lakers",
    aspect: "aspect-video",
    src: "/images/portfolio-legendary-partners-lakers.jpg",
  },
  {
    title: "Beyond The Arches",
    client: "McDonald’s",
    aspect: "aspect-[4/3]",
    src: "/images/portfolio-beyond-the-arches-mcdonalds.jpg",
  },
  {
    title: "Super Snorkel Tours",
    client: "Body Glove Cruises",
    aspect: "aspect-square",
    src: "/images/portfolio-super-snorkel-body-glove.jpg",
  },
  {
    title: "Keys To Tech",
    client: "DICE",
    aspect: "aspect-video",
    src: "/images/portfolio-keys-to-tech-dice.jpg",
  },
];

export default function PortfolioGrid() {
  return (
    <section className="px-8 py-16">
      <h2 className="mb-10 font-display text-5xl uppercase leading-tight md:text-7xl">
        Fresh Out
        <br />
        Of The Box
      </h2>
      <div className="columns-1 gap-8 md:columns-2">
        {projects.map((p) => (
          <article key={p.title + p.client} className="mb-8 break-inside-avoid">
            <img
              src={p.src}
              alt={`${p.title} — ${p.client} project photo`}
              className={`w-full rounded-lg object-cover ${p.aspect}`}
            />
            <h3 className="mt-4 font-display text-xl uppercase">{p.title}</h3>
            <p className="font-narrow text-sm uppercase tracking-wide">{p.client}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
