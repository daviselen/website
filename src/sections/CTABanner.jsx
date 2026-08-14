// From HP-23 "LBST" group — "Let's look inside the box" CTA.
import Button from "../design-system/components/Button.jsx";

export default function CTABanner() {
  return (
    <section className="flex flex-col items-start gap-16 px-8 py-24">
      <h2 className="font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-h2">
        Let's look inside the box
      </h2>
      <Button variant="solid">Start A Conversation</Button>
    </section>
  );
}
