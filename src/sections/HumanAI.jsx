// From HP-23 "HI/AI" frame. Real structure, per the Figma node tree:
//   - Solid dark green background (#2F5F47, cornerRadius 8 — same green
//     as the CTA button, confirmed a real secondary brand color)
//   - Small badge/lockup: a green "HI" icon mark + two-line tagline
//     "Human Imagination® / x Artificial Intelligence" (NOT the headline)
//   - The actual headline is the lorem-ipsum line: "Quisque fauci ex
//     vitae sem plarat."
//   - A supporting lorem paragraph
//   - A large square illustration ("DEHIAI", 860x860 — the cube/die
//     graphic seen in the PDF render) — drop the real file at
//     public/images/humanai-dehiai-illustration.jpg
//   - A row of 6 small icon badges, layer-named RW / 11 / MJ / MJ /
//     Claude / MJ — almost certainly AI tool logos (Runway, ElevenLabs,
//     Midjourney x3, Claude). Real vector icons weren't exported, so
//     these render as labeled placeholder badges using the raw layer
//     names rather than asserting exact brand logos.
const toolBadges = ["RW", "11", "MJ", "MJ", "Claude", "MJ"];

export default function HumanAI() {
  return (
    <section className="rounded-lg bg-accent-green px-8 py-16">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded bg-[#165238]" aria-label="HI mark" />
        <p className="font-narrow text-sm font-light uppercase leading-tight">
          Human Imagination<span className="align-super text-xs">®</span>
          <br />x Artificial Intelligence
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <img
          src="/images/humanai-dehiai-illustration.jpg"
          alt="DE HI x AI illustration — a die/cube graphic with HI and AI faces"
          className="aspect-square w-full rounded-lg object-cover"
        />
        <div>
          <h2 className="font-narrow text-3xl font-light md:text-5xl">
            Quisque fauci ex vitae sem plarat.
          </h2>
          <p className="mt-6 max-w-md font-narrow text-lg font-medium">
            Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien
            vitae pellentesque sem placerat. In id cursus mi pretium amet tellus duis convallis.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {toolBadges.map((label, i) => (
          <div
            key={label + i}
            className="flex h-14 w-14 items-center justify-center rounded-md bg-black"
          >
            <span className="font-narrow text-[10px] uppercase text-white">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
