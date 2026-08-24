// From HP-23 "PR /SOCA:" group — "Get On The Soap Box" (Social + PR).

import HeadingReveal from "../design-system/components/HeadingReveal";

// Drop real files into public/images/ using the names below.
const cols = [
  {
    heading: "Social",
    copy: "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.",
    src: "/images/socialpr-social.jpg",
    alt: "Social media content example",
  },
  {
    heading: "Public Relations",
    copy: "Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis.",
    src: "/images/socialpr-public-relations.jpg",
    alt: "Public relations event photo",
  },
];

export default function SocialPR() {
  return (
    <section className="px-8 py-16">
      <HeadingReveal
        as="h2"
        text={`Get On the \nSoap Box`}
        className="mb-10 font-display text-5xl uppercase leading-tight md:text-7xl"
        />
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
