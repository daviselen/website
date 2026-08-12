// From HP-23 "LBST" group — "Let's look inside the box" CTA.
import Button from "../design-system/components/Button.jsx";

export default function CTABanner() {
  return (
    <section className="flex flex-col items-start gap-8 px-8 py-24">
      <h2 className="max-w-xl font-display text-4xl uppercase leading-tight md:text-6xl">
        Let’s look inside the box
      </h2>
      <Button variant="solid">Start A Conversation</Button>
    </section>
  );
}
