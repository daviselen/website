import { useState } from "react";
import MastheadImage from "../design-system/components/MastheadImage";
import HeadingReveal from "../design-system/components/HeadingReveal";
import TextReveal from "../design-system/components/TextReveal";
import CTABanner from "../sections/CTABanner.jsx";
import { Button } from "@headlessui/react";
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
    streetAddress: "865 S. Figueroa St. Suite 1200",
    addressLocality: "Los Angeles",
    addressRegion: "CA",
    postalCode: "90017",
    latitude: 34.04677624710386,
    longitude: -118.262972794232,
    phone: "(213) 688-7000",
    mapUrl: "https://maps.google.com/?q=865+S.+Figueroa+St.+Suite+1200+Los+Angeles+CA+90017",
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
    streetAddress: "7750 El Camino Real, Suite 2F",
    addressLocality: "Carlsbad",
    addressRegion: "CA",
    postalCode: "92009",
    latitude: 33.082276406297,
    longitude: -117.26650509742225,
    phone: "(213) 688-7000",
    mapUrl: "https://maps.google.com/?q=7750+El+Camino+Real+Suite+2F+Carlsbad+CA+92009",
    image: "/images/contact-location-san-diego.jpg",
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
    streetAddress: "2033 6th Ave., Suite 600",
    addressLocality: "Seattle",
    addressRegion: "WA",
    postalCode: "98121",
    latitude: 47.614824486545736,
    longitude: -122.33964785782985,
    phone: "(213) 688-7000",
    mapUrl: "https://maps.google.com/?q=2033+6th+Ave.+Suite+600+Seattle+WA+98121",
    image: "/images/contact-location-seattle.jpg",
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
    streetAddress: "1801 California St., #2400",
    addressLocality: "Denver",
    addressRegion: "CO",
    postalCode: "80202",
    latitude: 39.74772132744277,
    longitude: -104.98947169919487,
    phone: "(213) 688-7000",
    mapUrl: "https://maps.google.com/?q=1801+California+St.+%232400+Denver+CO+80202",
    image: "/images/contact-location-denver.jpg",
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
    streetAddress: "4201 Wilson Blvd., Floor 3",
    addressLocality: "Arlington",
    addressRegion: "VA",
    postalCode: "22203",
    latitude: 38.88047980986965,
    longitude: -77.11097442994593,
    phone: "(213) 688-7000",
    mapUrl: "https://maps.google.com/?q=4201+Wilson+Blvd.+Floor+3+Arlington+VA+22203",
    image: "/images/contact-location-arlington.png",
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
    streetAddress: "420 Nichols Rd.",
    addressLocality: "Kansas City",
    addressRegion: "MO",
    postalCode: "64112",
    latitude: 39.041445408733466,
    longitude: -94.5923468712363,
    phone: "(213) 688-7000",
    mapUrl: "https://maps.google.com/?q=420+Nichols+Rd.+Kansas+City+MO+64112",
    image: "/images/contact-location-kansas-city.jpg",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": locations.map((loc) => ({
    "@type": "AdvertisingAgency",
    "@id": `https://www.daviselen.com/contact#location-${loc.id}`,
    name: `Davis Elen — ${loc.name}`,
    url: "https://www.daviselen.com/contact",
    telephone: "+1-213-688-7000",
    email: "contact@daviselen.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: loc.streetAddress,
      addressLocality: loc.addressLocality,
      addressRegion: loc.addressRegion,
      postalCode: loc.postalCode,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: loc.latitude,
      longitude: loc.longitude,
    },
  })),
};

const topics = [
  { id: 0, name: '' },
  { id: 1, name: 'New Business Inquiry' },
  { id: 2, name: 'Public Relations' },
  { id: 3, name: 'Media Planning' },
  { id: 4, name: 'Media Buying' },
  { id: 5, name: 'Social Media & UGC' },
  { id: 6, name: 'Careers' },
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
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("submitting");
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <main
      className="flex min-h-screen flex-col gap-0 bg-surface-default pb-1800 font-narrow font-light text-neutral-0"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section id="top">
        <MastheadImage src="/images/contact-masthead.jpg" alt="Contact Davis Elen Advertising" />
        <div className="px-2 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-400">
            <HeadingReveal
              as="h2"
              text={`Find out \nwhat’s inside`}
              className="mb-100 font-display text-7xl uppercase md:text-8xl lg:col-span-6 lg:col-start-7 lg:text-display-h4"
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
        className="mt-1000 flex flex-col gap-600 px-2 md:mt-3000 lg:gap-1000 lg:px-8"
      >
        <HeadingReveal
          as="h2"
          text={`Locations`}
          className="font-display text-7xl uppercase leading-none md:text-8xl lg:text-display-h3"
        />
        <ul className="flex flex-col">
          {locations.map((location) => (
            <LocationRow key={location.id} {...location} />
          ))}
        </ul>
      </section>
      <section
        id="form"
        className="relative mx-2 mt-1000 flex flex-col gap-600 rounded-md bg-surface-alt py-1000 text-neutral-0 md:mt-3000 lg:mx-8 lg:mt-3000 lg:gap-1000 xl:grid xl:grid-cols-12 xl:gap-400"
      >
        <div className="flex flex-col gap-400 lg:gap-500 xl:col-start-9 xl:-col-end-1 xl:row-start-1">
          <HeadingReveal
            as="h2"
            text={`Let’s get \nin touch`}
            className="font-display text-7xl uppercase leading-none md:text-8xl lg:text-display-h3"
          />
          <TextReveal
            text={`Sed ut perspiciatis unde omnis \niste natus error sit voluptatem.`}
            className="mb-6 max-w-[24ch] text-lg md:text-xl lg:text-pre-title"
          />
        </div>
        <form id="contact" onSubmit={handleSubmit} className="flex flex-col gap-500 xl:col-start-1 xl:col-end-7 xl:row-start-1 xl:*:ml-1000">
          <StyledField type="text" label="Name" name="name" gap="0" />
          <StyledField type="email" label="E-mail" name="email" gap="0" />
          <StyledField gap="0">
            <StyledLabel>
              Subject
            </StyledLabel>

            <StyledCombobox
              options={topics}
              placeholder=""
            />
          </StyledField>
          <StyledField gap="0">
            <StyledLabel>Message</StyledLabel>
            <StyledTextarea name="message"></StyledTextarea>
          </StyledField>
        </form>
        <div className="self-end xl:col-start-9 xl:-col-end-1 xl:row-start-1 xl:flex xl:flex-col xl:items-start xl:gap-300">
          {status === "success" && (
            <p className="text-lg text-green-400">Message sent — we&apos;ll be in touch.</p>
          )}
          {status === "error" && (
            <p className="text-lg text-red-400">Something went wrong. Try again or email us directly.</p>
          )}
          <Button
            form="contact"
            type="submit"
            disabled={status === "submitting" || status === "success"}
            className="cursor-pointer rounded-md bg-surface-primary-default px-1000 py-300 font-narrow text-pre-title font-normal uppercase leading-snug text-neutral-0 transition-colors duration-300 hover:bg-primary-300 hover:text-neutral-1000 disabled:opacity-50 xl:min-w-[320px]"
          >
            {status === "submitting" ? "Sending…" : "Send it"}
          </Button>
        </div>
      </section>
    </main>
  );
}
