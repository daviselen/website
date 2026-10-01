import MastheadImage from "../design-system/components/MastheadImage";
import HeadingReveal from "../design-system/components/HeadingReveal";
import TextReveal from "../design-system/components/TextReveal";
import CTABanner from "../sections/CTABanner.jsx";
import { Field } from "@headlessui/react";
import StyledField from "../design-system/components/Field";
import StyledLabel from "../design-system/components/Label.jsx";
import StyledCombobox from "../design-system/components/Combobox.jsx";
import StyledTextarea from "../design-system/components/Textarea.jsx";
import LocationRow from "../design-system/components/LocationRow.jsx";

const locations = [
  {
    id: 1,
    name: "Los Angeles",
    address: (
      <>
        865 S. Figueroa St. Suite 1200
        <br />
        Los Angeles, CA 90017
      </>
    ),
    // Placeholder — swap for the real per-location export once it's pulled
    // from Figma.
    image: "/images/contact-location-los-angeles.jpg",
  },
  {
    id: 2,
    name: "San Diego",
    address: (
      <>
        7750 El Camino Real, Suite 2F
        <br />
        Carlsbad, CA 92009
      </>
    ),
    // Placeholder — swap for the real per-location export once it's pulled
    // from Figma.
    image: "/images/contact-location-los-angeles.jpg",
  },
  {
    id: 3,
    name: "Seattle",
    address: (
      <>
        2033 6th Ave., Suite 600
        <br />
        Seattle, WA 98121
      </>
    ),
    // Placeholder — swap for the real per-location export once it's pulled
    // from Figma.
    image: "/images/contact-location-los-angeles.jpg",
  },
  {
    id: 4,
    name: "Denver",
    address: (
      <>
        1801 California St., #2400
        <br />
        Denver, CO 80202
      </>
    ),
    // Placeholder — swap for the real per-location export once it's pulled
    // from Figma.
    image: "/images/contact-location-los-angeles.jpg",
  },
  {
    id: 5,
    name: "Arlington",
    address: (
      <>
        4201 Wilson Blvd., Floor 3
        <br />
        Arlington, VA 22203
      </>
    ),
    // Placeholder — swap for the real per-location export once it's pulled
    // from Figma.
    image: "/images/contact-location-los-angeles.jpg",
  },
  {
    id: 6,
    name: "Kansas City",
    address: (
      <>
        420 Nichols Rd.
        <br />
        Kansas City, MO 64112
      </>
    ),
    // Placeholder — swap for the real per-location export once it's pulled
    // from Figma.
    image: "/images/contact-location-los-angeles.jpg",
  },
];

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
        <MastheadImage src="/images/contact-masthead.jpg" alt="Contact Davis Elen Advertising" />
        <div className="px-2 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-400">
            <HeadingReveal
              as="h2"
              text={`Find out \nwhat’s inside`}
              className="mb-100 font-display text-5xl uppercase md:text-7xl lg:col-span-6 lg:col-start-7 lg:text-display-h4"
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
        className="mt-1000 flex flex-col gap-600 lg:gap-1000 px-2 lg:px-8 md:mt-3000"
      >
        <HeadingReveal
          as="h2"
          text={`Locations`}
          className="font-display text-5xl uppercase leading-none md:text-7xl lg:text-display-h3"
        />
        <ul className="flex flex-col">
          {locations.map((location) => (
            <LocationRow key={location.id} {...location} />
          ))}
        </ul>
      </section>
      <section
        id="form"
        className="mt-1000 flex flex-col gap-600 lg:gap-1000 px-2 lg:px-8 md:mt-3000"
      >
        <form className="flex flex-col gap-600" action="" method="">
          <StyledField type="text" label="Name" name="full_name" />
          <StyledField type="tel" label="Phone" name="phone" />
          <StyledField type="email" label="E-mail" name="email" />
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
          <Field className="flex flex-col gap-2">
            <StyledLabel>Message</StyledLabel>
            <StyledTextarea></StyledTextarea>
          </Field>
        </form>
      </section>
    </main>
  );
}
