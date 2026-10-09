// From HP-23 "LBST" group — "Let's look inside the box" CTA.
import Button from "../design-system/components/Button.jsx";
import HeadingReveal from "../design-system/components/HeadingReveal.jsx";

export default function CTABanner() {
  return (
    <section id="cta-banner" className="flex flex-col items-start gap-8 px-2 pb-1000 pt-800 lg:gap-16 lg:px-8 lg:pb-2000 lg:pt-3000">
      <HeadingReveal
        as="h2"
        text={`Let’s Look \nInside the Box`}
        className="font-display text-7xl uppercase leading-none md:text-8xl lg:text-display-h3"
        />
      <Button variant="solid" size="big">Start A Conversation</Button>
    </section>
  );
}
