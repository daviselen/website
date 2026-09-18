import MastheadImage from "../design-system/components/MastheadImage";
import HeadingReveal from "../design-system/components/HeadingReveal";
import TextReveal from "../design-system/components/TextReveal";
import CTABanner from "../sections/CTABanner.jsx";
import { Field } from "@headlessui/react";
import StyledField from "../design-system/components/Field";
import StyledLabel from "../design-system/components/Label.jsx";
import StyledCombobox from "../design-system/components/Combobox.jsx";

const topics = [
  { id: 1, name: 'New Business Inquiry' },
  { id: 2, name: 'Public Relations' },
  { id: 3, name: 'Media Planning' },
  { id: 4, name: 'Media Buying' },
  { id: 5, name: 'Careers' },
]

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
      className="flex min-h-screen flex-col gap-0 bg-surface-default pb-1800 font-narrow font-light text-neutral-0"
    >
      <section id="top">
        <MastheadImage src="/images/contact-masthead.jpg" alt="Contact Davis Elen Advertising" title={`Open \nthe \nBox`} />
        <div className="px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-400">
            <HeadingReveal
              as="h2"
              text={`Find out \nwhat’s inside`}
              className="mb-100 font-display text-5xl uppercase md:text-7xl lg:col-span-6 lg:col-start-7 lg:text-display-h3"
            />
            <div className="lg:col-span-6 lg:col-start-7 lg:pr-600">
              <TextReveal className="mb-300 text-3xl md:text-5xl lg:text-display-stat"
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
        className="mt-1000 flex flex-col gap-1000 px-8 md:mt-3000"
      >
        <HeadingReveal
          as="h2"
          text={`Locations`}
          className="font-display text-5xl uppercase leading-none md:text-7xl lg:text-display-h2"
        />
        <form className="flex flex-col gap-600">
          <StyledField type="text" label="Name" />
          <StyledField type="tel" label="Phone" />
          <StyledField type="email" label="E-mail" />
          <Field className="flex flex-col gap-2">
            <StyledLabel className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Subject
            </StyledLabel>
            
            <StyledCombobox
              options={topics}
              label="Subject"
              placeholder="Select a subject&hellip;"
            />
          </Field>
        </form>
      </section>
    </main>
  );
}
