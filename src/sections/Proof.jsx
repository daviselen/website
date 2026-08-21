// From HP-26 "Proof" group: 3 stat callouts, each a real "card" component
// instance (Size=Default) — now rendered through the shared <Card />
// primitive instead of duplicating the same markup NewsAwards.jsx also
// needed.
//
// Proof's card images are 576/480 (6/5), same as News/Awards — <Card />
// defaults to 6/5, so no override needed here. (From The Inside Out and
// the portfolio grid are the two sections that use 11/6 instead.)
import Card from "../design-system/components/Card.jsx";
import { motion } from "motion/react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // delay between each item
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 160 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stats = [
  {
    heading: "$18 Billion in Retail Sales",
    body: "Today, Davis Elen's reputation and national footprint are surging like never before.",
    src: "/images/proof-best-buy-health.jpg",
    alt: "Interior of a Best Buy Health retail location",
  },
  {
    heading: "4000+ Retail Locations",
    body: "Including 25% of every McDonald's restaurant in the United States. Scale that speaks for itself.",
    src: "/images/proof-locations-map.jpg",
    alt: "Map showing Davis Elen client retail locations across Southern California",
  },
  {
    heading: "Independent for Over 75 Years",
    body: "No holding company. No conglomerate oversight. Original thinking applied consistently since 1948.",
    src: "/images/proof-founding-partners.jpg",
    alt: "Davis Elen original founding partners photo: Henry Mayers, Bob Colombatto, ?, ?, and Bob Davis",
  },
];

export default function Proof() {
  return (
    <motion.section
      id="proof"
      className="grid gap-8 px-8 pt-3000 pb-0 md:grid-cols-3"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
    >
      {stats.map((s) => (
        <Card key={s.heading} {...s} size="small" variants={item} />
      ))}
    </motion.section>
  );
}
