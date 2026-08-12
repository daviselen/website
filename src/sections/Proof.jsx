// From HP-23 "Proof" group: 3 stat callouts + supporting image tiles.
// Real column gap (measured from x-offsets: Group54 → Map → Group51,
// each 32px apart after the 576px column width) is 32px — gap-8.
// Drop real files into public/images/ using the names below.
const stats = [
  {
    label: "$18 Billion in retail sales",
    copy: "Including 25% of every McDonald's restaurant in the United States. Scale that speaks for itself.",
    src: "/images/proof-best-buy-health.jpg",
    alt: "Interior of a Best Buy Health retail location",
  },
  {
    label: "4,000+ retail locations",
    copy: "No holding company. No conglomerate oversight. Original thinking applied consistently since 1948.",
    src: "/images/proof-locations-map.jpg",
    alt: "Map showing Davis Elen client retail locations across Southern California",
  },
  {
    label: "Independent for 78 years",
    copy: "Today, Davis Elen's reputation and national footprint are surging like never before.",
    src: "/images/proof-founding-partners.jpg",
    alt: "Davis Elen original founding partners photo",
  },
];

export default function Proof() {
  return (
    <section className="grid gap-8 px-8 py-16 md:grid-cols-3">
      {stats.map((s) => (
        <div key={s.label}>
          <img
            src={s.src}
            alt={s.alt}
            className="mb-6 aspect-[6/5] w-full rounded-lg object-cover"
          />
          <h3 className="font-display text-2xl uppercase">{s.label}</h3>
          <p className="mt-3 font-narrow text-base">{s.copy}</p>
        </div>
      ))}
    </section>
  );
}
