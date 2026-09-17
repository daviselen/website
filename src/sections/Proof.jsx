// From HP-26 "Proof" group: 3 stat callouts, each a real "card" component
// instance (Size=Default) — now rendered through the shared <Card />
// primitive instead of duplicating the same markup NewsAwards.jsx also
// needed.
//
// Proof's card images are 576/480 (6/5), same as News/Awards — <Card />
// defaults to 6/5, so no override needed here. (From The Inside Out and
// the portfolio grid are the two sections that use 55/36 instead.)
import { useRef } from "react";
import Card from "../design-system/components/Card.jsx";
import { useStaggerReveal } from "../design-system/animation.js";

const stats = [
  {
    heading: "$18 Billion in Retail Sales",
    body: "We get results. But don't take our word for it. A number like this speaks volumes.",
    src: "/images/proof-best-buy-health.jpg",
    alt: "Interior of a Best Buy Health retail location",
  },
  {
    heading: "4000+ Retail Locations",
    body: "Including one in four McDonald's in America. We're in more neighborhoods than most agencies have clients.",
    src: "/images/proof-locations-map.jpg",
    alt: "Map showing Davis Elen client retail locations across Southern California",
  },
  {
    heading: "Independent for Over 75 Years",
    body: "No holding company. No quarterly panic. Nobody to ask permission from except the client.",
    src: "/images/proof-founding-partners.jpg",
    alt: "Davis Elen original founding partners photo: Henry Mayers, Bob Colombatto, ?, ?, and Bob Davis",
  },
];

export default function Proof() {
  const gridRef = useRef(null);

  // The stagger lives in the parent now — Card no longer takes a `variants`
  // prop. Same timings as before: 0.25s between items, 0.625s each, from
  // 160px below.
  useStaggerReveal(gridRef, { amount: 0.2 });

  return (
    <section
      ref={gridRef}
      id="proof"
      className="grid gap-800 lg:gap-8 px-2 lg:px-8 pb-0 pt-800 lg:pt-3000 md:grid-cols-3"
    >
      {stats.map((s) => (
        <Card key={s.heading} {...s} size="small" parallax="true" />
      ))}
    </section>
  );
}
