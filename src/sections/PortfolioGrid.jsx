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

function ProjectCard({ title, client, src, startColumn2 }) {
  return (
    <div
      // Aspect is 11/6 (880/480), same as From The Inside Out, per direct
      // correction — not the 879/576 (≈1.526, noticeably narrower) this
      // had before.
      className={`relative mb-2000 aspect-[11/6] w-full overflow-hidden rounded-md break-inside-avoid ${
        startColumn2 ? "break-before-column" : ""
      }`}
    >
      <img
        src={src}
        alt={`${title} — ${client} project photo`}
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Corrected per direct confirmation (I can't see the actual Figma
          component myself — no way to view it beyond what get_design_context
          returns, and that data was ambiguous enough that I misread it as
          per-card variation last time). It's ONE unified gradient across
          every card, not per-photo tuning: angled (not straight vertical),
          and — the important bit — the darkest stop sits OUTSIDE the
          visible image, so the bottom edge never actually reaches full
          solid black, only a partial shade. The raw values I'd pulled
          earlier (angles clustering ~191–199deg; a couple of end stops at
          100.3%/105.2%, i.e. already past the visible edge) partially
          supported this and I didn't weight it correctly — treated those
          as per-card noise instead of the real, consistent shape.
          195deg / 60% / 130% below are my best approximation of "angled,
          ends past 100%" — if you can read the exact angle/stop values off
          the Figma inspector, give me those and I'll use them exactly
          instead. */}
      <div className="absolute inset-0 bg-[linear-gradient(195deg,transparent_60%,black_130%)]" />
      <div className="absolute inset-x-8 bottom-8 flex flex-col gap-300 text-neutral-0">
        <p className="font-narrow text-base leading-6 md:text-2xl md:leading-8">{title}</p>
        <p className="font-display text-4xl uppercase leading-none md:text-6xl lg:text-display-card">
          {client}
        </p>
      </div>
    </div>
  );
}

export default function PortfolioGrid() {
  return (
    <section className="px-8 py-16">
      <div className="columns-1 gap-x-8 md:columns-2">
        <h2 className="mb-2000 font-display text-6xl uppercase leading-none break-inside-avoid md:text-8xl lg:text-display-h2">
          Fresh Out
          <br />
          Of The Box
        </h2>
        {projects.map((p) => (
          <ProjectCard key={p.title + p.client} {...p} />
        ))}
      </div>
    </section>
  );
}
