// From HP-23 "Masthead" (hero image, 1792x900), "Think Inside The Box"
// headline (Ringside Regular 360px — the one place that font is used),
// and the lorem-ipsum lede paragraph (literal placeholder copy left in
// the source design, not something added here).
//
// Masthead image: red Supra drifting on a bridge at night (matches the
// Toyota "We Got You" case study in the portfolio grid) — a real file,
// place it at public/images/masthead.jpg.
//
// Per design: 8px corner radius, edge-to-edge on mobile, inset with a
// 32px margin on either side from md up.
export default function Masthead() {
  return (
    <section className="px-0 md:px-8">
      <img
        src="/images/masthead.jpg"
        alt="Red Toyota Supra drifting on a bridge at night"
        className="h-[56vw] max-h-[900px] w-full rounded-lg object-cover"
      />
      <div className="px-8 py-16">
        <h1 className="max-w-4xl font-hero text-6xl uppercase leading-none md:text-8xl">
          Think Inside
          <br />
          The Box
        </h1>
        <p className="mt-8 max-w-2xl font-narrow text-xl font-medium leading-relaxed">
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien
          vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.
          Tempus leo eu aenean sed diam urna tempor.
        </p>
      </div>
    </section>
  );
}
