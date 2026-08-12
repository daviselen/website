// From HP-23 "FTIO" group — "From The Inside Out" (culture/agency-life).
// Drop real files into public/images/ using the names below.
const cols = [
  {
    heading: "DE Tuesdays",
    copy: "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.",
    src: "/images/ftio-de-tuesdays.jpg",
    alt: "DE Tuesdays weekly team event photo",
  },
  {
    heading: "DE Culture",
    copy: "Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.",
    src: "/images/ftio-de-culture.jpg",
    alt: "Davis Elen office culture photo",
  },
];

export default function FromInsideOut() {
  return (
    <section className="px-8 py-16">
      <h2 className="mb-10 font-display text-5xl uppercase leading-tight md:text-7xl">
        From The
        <br />
        Inside Out
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        {cols.map((c) => (
          <div key={c.heading}>
            <img
              src={c.src}
              alt={c.alt}
              className="aspect-[880/480] w-full rounded-lg object-cover"
            />
            <h3 className="mt-4 font-display text-xl uppercase">{c.heading}</h3>
            <p className="mt-2 font-narrow text-sm">{c.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
