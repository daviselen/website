// Case studies in home-page order. Drives the home "Fresh Out of the Box"
// strip (PortfolioGrid) and the "More Work" cards under each case study, which
// show the next three entries and wrap back to the start.
export const work = [
  {
    title: "We Got You",
    client: "Toyota",
    src: "/images/portfolio-we-got-you-toyota.jpg",
    to: "/work/we-got-you",
  },
  {
    title: "Hola Mexico Film Festival",
    client: "McDonald's",
    src: "/images/portfolio-hola-mexico-mcdonalds.jpg",
    to: "/work/hola-mexico-film-festival",
    // videoSrc: {
    //   webm: "/videos/portfolio-hola-mexico-mcdonalds.webm",
    //   mp4: "/videos/portfolio-hola-mexico-mcdonalds.mp4",
    // },
  },
  {
    title: "Let's Admit It",
    client: "Best Buy Health",
    src: "/images/portfolio-lets-admit-it-best-buy-health.jpg",
    to: "/work/lets-admit-it",
  },
  {
    title: "Alex in the Wild",
    client: "Smart & Final",
    src: "/images/portfolio-alex-in-the-wild-smart-final.jpg",
    to: "/work/alex-in-the-wild",
  },
  {
    title: "Legendary Partners",
    client: "Los Angeles Lakers",
    src: "/images/portfolio-legendary-partners-lakers.jpg",
    to: "/work/lakers-and-toyota-legendary-partners",
  },
  {
    title: "Beyond The Arches",
    client: "McDonald's",
    src: "/images/portfolio-beyond-the-arches-mcdonalds.jpg",
    to: "/work/beyond-the-arches",
  },
  {
    title: "Keys To Tech",
    client: "DICE",
    src: "/images/portfolio-keys-to-tech-dice.jpg",
    to: "/work/dice-branding",
  },
  {
    title: "Super Snorkel Tours",
    client: "Body Glove Cruises",
    src: "/images/portfolio-super-snorkel-body-glove.jpg",
    to: "/work/super-snorkel-tours",
  },
];

// The `count` entries after the one linking to `to`, wrapping past the end.
// A page that isn't in the list (Shaquelicious) starts from the top.
export function nextWork(to, count = 3) {
  const index = work.findIndex((item) => item.to === to);
  return Array.from({ length: Math.min(count, work.length - 1) }, (_, i) =>
    work[(index + 1 + i) % work.length],
  );
}
