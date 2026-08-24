import HeadingReveal from "../design-system/components/HeadingReveal";
import MastheadVideo from "../design-system/components/MastheadVideo";
import TextReveal from "../design-system/components/TextReveal";

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
    <section id="masthead" className="px-0 md:px-8">
      <MastheadVideo
        src="/videos/davis-elen-masthead.mp4"
        className="h-[calc((100vw - 64px) * .5625)] max-h-[1044px] w-full rounded-md object-cover"
      />
      {/* Image → headline gap is Scale/2300 = 184px (11.5rem) — this was
          py-16 (64px/4rem) before, read off a stale HP-23 guess instead of
          the real itemSpacing on get_design_context's "section-1" frame
          (`gap-[var(--scale/2300,184px)]`), which was sitting right there
          in the reference code. Using the named spacing token (mt-2300)
          instead of a bare mt-[184px] so it's traceable back to Scale/2300.

          No horizontal padding here, on purpose: the real "TITB" node is
          `pr-[480px] ... w-full` — no pl/pr base padding of its own at
          all. The section's own `px-0 md:px-8` already provides the one
          shared edge inset for both the image and this text block (they're
          siblings in Figma too, both direct children of "section-1" with
          no padding of their own). Adding a second px-8 here — which the
          previous pass did, by pattern-matching how other sections open
          with `px-8` instead of checking this specific node — silently
          doubled the left inset on desktop (md:px-8 + px-8) and added an
          inset on mobile that shouldn't be there at all (image is
          edge-to-edge at that breakpoint; the text was not). */}
      <div className="mt-2300">
        {/* itemProp="slogan": real Organization.slogan property, and this
            headline genuinely is the site's tagline — no content=
            override needed since the visible text IS the value. */}
        <HeadingReveal text={`Think Inside \nthe Box`} as="h1" className="font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-h1" />
        {/* Headline → paragraph gap is Scale/700 = 56px, not the mt-8
            (32px) previously guessed. Real node also has pr-[480px] on the
            whole text block (TITB), not a max-w cap — reproduced here as a
            right-side inset on lg+ so the paragraph doesn't span the full
            frame width like the headline. */}
        <TextReveal
          text="Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor."
          as="p"
          delay={0.4}
          className="mt-700 font-narrow text-xl leading-relaxed lg:text-[40px] lg:leading-[48px] lg:pr-[calc(100%-1290px)]"
        />
      </div>
    </section>
  );
}
