// From HP-23 "News" group — "What's Happening" awards roundup.
// Drop real files into public/images/ using the names below.
const awards = [
  {
    title: "DE Wins 8 Telly Awards",
    copy: "Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.",
    src: "/images/news-telly-awards.jpg",
    alt: "Telly Award trophies",
  },
  {
    title: "DE Wins A Shorty Award",
    copy: "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.",
    src: "/images/news-shorty-award.jpg",
    alt: "Shorty Award trophy",
  },
  {
    title: "DE Wins A Silver And Bronze Pencil",
    copy: "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.",
    src: "/images/news-pencil-award.jpg",
    alt: "Silver and bronze One Show Pencil awards",
  },
];

export default function NewsAwards() {
  return (
    <section className="px-8 py-16">
      <h2 className="mb-10 font-display text-5xl uppercase leading-tight md:text-7xl">
        What’s
        <br />
        Happening
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {awards.map((a) => (
          <div key={a.title}>
            <img
              src={a.src}
              alt={a.alt}
              className="aspect-[576/480] w-full rounded-lg object-cover"
            />
            <h3 className="mt-4 font-display text-lg uppercase">{a.title}</h3>
            <p className="mt-2 font-narrow text-sm">{a.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
