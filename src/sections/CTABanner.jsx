// From HP-23 "LBST" group — "Let's look inside the box" CTA.
import Button from "../design-system/components/Button.jsx";
import HeadingReveal from "../design-system/components/HeadingReveal.jsx";

export default function CTABanner() {
  return (
    <section id="cta-banner" className="flex flex-col items-start gap-8 lg:gap-16 px-2 lg:px-8 pb-1000 lg:pb-2000 pt-800 lg:pt-3000">
      <HeadingReveal
        as="h2"
        text={`Let’s Look \nInside the Box`}
        className="font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-h3"
        />
      <Button variant="solid">Start A Conversation</Button>
    </section>
  );
}
