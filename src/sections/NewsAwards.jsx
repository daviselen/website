// From HP-26 "news" group — same real "card" component as Proof, shared
// via <Card /> rather than a second hand-rolled implementation. Image
// aspect is 6/5, same as Proof, which is <Card />'s default — no
// override needed here.
import Card from "../design-system/components/Card.jsx";

const awards = [
  {
    heading: "Davis Elen Wins 8 Telly Awards",
    body: "Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.",
    src: "/images/news-telly-awards.jpg",
    alt: "Telly Award trophies",
  },
  {
    heading: "Davis Elen Wins a Shorty Award",
    body: "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.",
    src: "/images/news-shorty-award.jpg",
    alt: "Shorty Award trophy",
  },
  {
    heading: "DE Wins a Silver and Bronze Pencil",
    body: "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.",
    src: "/images/news-pencil-award.jpg",
    alt: "Silver and bronze One Show Pencil awards",
  },
];

export default function NewsAwards() {
  return (
    <section id="news-awards" className="px-8 py-16">
      <h2 className="mb-10 font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-h2">
        What's
        <br />
        Happening
      </h2>
      {/* headingItemProp="award": these headings are real awards, so each
          one becomes a value of the page-level Organization item's
          `award` property (a plain Text property — see HomePage.jsx for
          where that Organization itemScope starts). */}
      <div className="grid gap-8 md:grid-cols-3">
        {awards.map((a) => (
          <Card key={a.heading} {...a} headingItemProp="award" size="small" />
        ))}
      </div>
    </section>
  );
}
