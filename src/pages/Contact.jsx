import MastheadImage from "../design-system/components/MastheadImage";
import HeadingReveal from "../design-system/components/HeadingReveal";
import TextReveal from "../design-system/components/TextReveal";
import CTABanner from "../sections/CTABanner.jsx";
import StyledField from "../design-system/components/Field";

// NavBar and Footer are not rendered here: Layout.jsx already mounts both
// around every route, and its wrapper supplies the page background, the
// font-narrow/neutral-0 defaults, and the py-1800 that clears the fixed
// header.
//
// CTABanner stays on the page even when there are no openings, so the empty
// state reads as intentional — it carries real, human-written contact copy
// and a route into a conversation, which is the useful thing to offer someone
// who came here and found nothing listed.
export default function Contact() {
  return (
    <main
      className="min-h-screen bg-surface-default pb-1800 font-narrow font-light text-neutral-0 flex flex-col gap-0"
    >
      <section id="top">
        {/* Was `class=`, a plain HTML attribute React silently drops — none
            of px-8/pb-1000/rounded-md/overflow-hidden were ever applying. */}
        <div className="px-8 pb-1000 rounded-md overflow-hidden">
          <MastheadImage src="/images/contact-masthead.jpg" alt="Contact Davis Elen Advertising" title={`Open \nthe \nBox`} />
        </div>
        <div className="px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-400">
            <HeadingReveal
              as="h2"
              text={`Find out \nwhat’s inside`}
              className="lg:col-span-6 lg:col-start-7 font-display text-5xl md:text-7xl lg:text-display-h3 uppercase mb-100"
            />
            <div className="lg:col-span-6 lg:col-start-7 lg:pr-600">
              <TextReveal className="text-3xl md:text-5xl lg:text-display-stat mb-300"
                text="contact@daviselen.com"
              />
              <TextReveal className="text-3xl md:text-5xl lg:text-display-stat"
                text="213-688-7000"
              />
            </div>
          </div>
        </div>
      </section>
      <section
        id="locations"
        className="flex flex-col gap-1000 px-8 mt-1000 md:mt-3000"
      >
        <HeadingReveal
          as="h2"
          text={`Locations`}
          className="font-display text-5xl md:text-7xl lg:text-display-h2 uppercase leading-none"
        />
        <StyledField type="text" label="Name" />
        <StyledField type="tel" label="Phone" />
        <StyledField type="email" label="E-mail" />
      </section>
    </main>
  );
}
