// Horizontal-scroll section.
//
// Layout:
//   <section ref=sectionRef>          — pin trigger; the whole section freezes
//     <div px-8>                      — heading wrapper (stays in flow)
//       <HeadingReveal />
//     </div>
//     <div ref=clipRef overflow-hidden>  — hard clip so off-screen cards are hidden
//       <div ref=trackRef flex-nowrap>   — the strip that translates left while pinned
//         {cards}
//       </div>
//     </div>
//   </section>
//
// ScrollTrigger:
//   • trigger  = sectionRef  (the whole section, heading + cards)
//   • start    = "center center"  → pins when the section's midpoint hits the
//                                   viewport's midpoint
//   • end      = "+= <distance>"  → the pin lasts exactly long enough to scroll
//                                   the track from first to last card
//   • pin: true, scrub: 1         → smooth, scroll-linked horizontal travel
//   • invalidateOnRefresh: true   → recalculate distance on resize/font-swap
//
// Distance = track.scrollWidth − clip.offsetWidth.
//   track.scrollWidth  : all card widths + gaps + px-8 padding on both ends
//   clip.offsetWidth   : full viewport width (the clip div is 100% wide, no padding)
//   → after scrubbing by distance the track's last-card right edge lands flush
//     with the clip's right edge, leaving the symmetric px-8 gutter on each side.
import { useRef } from "react";
import HeadingReveal from "../design-system/components/HeadingReveal";
import ProjectCard from "../design-system/components/ImageCard";
import { gsap, useGSAP } from "../design-system/animation";

const projects = [
  {
    title: "We Got You",
    client: "Toyota",
    src: "/images/portfolio-we-got-you-toyota.jpg",
  },
  {
    title: "Alex in the Wild",
    client: "Smart & Final",
    src: "/images/portfolio-alex-in-the-wild-smart-final.jpg",
  },
  {
    title: "Beyond The Arches",
    client: "McDonald's",
    src: "/images/portfolio-beyond-the-arches-mcdonalds.jpg",
  },
  {
    title: "Keys To Tech",
    client: "DICE",
    src: "/images/portfolio-keys-to-tech-dice.jpg",
  },
  {
    title: "Hola Mexico Film Festival",
    client: "McDonald's",
    src: "/images/portfolio-hola-mexico-mcdonalds.jpg",
    videoSrc: {
      webm: "/videos/portfolio-hola-mexico-mcdonalds.webm",
      mp4: "/videos/portfolio-hola-mexico-mcdonalds.mp4",
    },
  },
  {
    title: "Let's Admit It",
    client: "Best Buy Health",
    src: "/images/portfolio-lets-admit-it-best-buy-health.jpg",
  },
  {
    title: "Legendary Partners",
    client: "Los Angeles Lakers",
    src: "/images/portfolio-legendary-partners-lakers.jpg",
  },
  {
    title: "Super Snorkel Tours",
    client: "Body Glove Cruises",
    src: "/images/portfolio-super-snorkel-body-glove.jpg",
  },
];

export default function PortfolioGrid() {
  const sectionRef = useRef(null);
  const clipRef = useRef(null);
  const trackRef = useRef(null);
  // Holds the pin's own ScrollTrigger instance once created below, so each
  // card's mask-reveal end (see scrollTriggerConfig.end passed to
  // ProjectCard) can read its *live* `.end` value directly instead of
  // re-deriving it from sectionRef's geometry. GSAP's pin-compensation math
  // (the offset it adds to another trigger's start/end when that trigger's
  // element is the pinned element) only kicks in when the other trigger's
  // *start* falls at or after the pin's start — ours intentionally starts
  // earlier (cards begin revealing before the pin engages), so GSAP leaves
  // our end un-offset and it lands at sectionRef's unpinned natural bottom,
  // ~3300px short of the true pinned range. Referencing the pin trigger's
  // `.end` sidesteps that geometry math entirely: a numeric end value is
  // used as an absolute scroll position, no trigger-relative math applied.
  const pinTriggerRef = useRef(null);

  useGSAP(
    () => {
      const clip = clipRef.current;
      const track = trackRef.current;

      // How far the track must travel so the last card's right edge lands at
      // the clip's right edge. Re-evaluated on every ScrollTrigger.refresh()
      // so resize and late-loading fonts never leave a stale offset.
      const getDistance = () => track.scrollWidth - clip.offsetWidth;

      const pinTween = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          // Measure start/end from the cards strip, not the whole section.
          // The section also contains the heading, so using sectionRef would
          // pin when the heading's midpoint hits the viewport centre — the
          // cards would land near the bottom. clipRef is the cards-only div,
          // so "center center" fires when the cards themselves are centred.
          trigger: clip,
          start: "center 66.667%",
          // Hold the pin long enough to traverse every card.
          end: () => `+=${getDistance()}`,
          // Pin the whole section (heading + cards) so the heading stays
          // visible during the horizontal scroll, but measure the trigger
          // position from the cards container above.
          pin: sectionRef.current,
          // Gives GSAP's refresh pass a hint to resolve (and build the pin
          // spacer for) this trigger before default-priority triggers that
          // also reference sectionRef — doesn't fix the mask's `end` by
          // itself (see pinTriggerRef above for why), but keeps refresh
          // ordering predictable for anything that does depend on it.
          refreshPriority: 1,
          scrub: 1,
          // Smooths the layout jump when the pin kicks in (especially
          // noticeable with ScrollSmoother's transform-based pinning).
          anticipatePin: 1,
          // Recalculate start/end/distance on every ScrollTrigger.refresh().
          invalidateOnRefresh: true,
        },
      });
      pinTriggerRef.current = pinTween.scrollTrigger;
    },
    { scope: sectionRef },
  );

  return (
    <section id="portfolio-grid" ref={sectionRef} className="pb-0 pt-3000">
      {/* Heading lives outside the clip so it isn't cropped by overflow-hidden */}
      <div className="px-8">
        <HeadingReveal
          as="h2"
          text={`Fresh Out \nof the Box`}
          className="mb-1000 font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-h3"
        />
      </div>

      {/* Clip boundary — full viewport width, no padding, hard overflow cut */}
      <div ref={clipRef} className="w-full overflow-hidden">
        {/* Scrolling strip — padding mirrors the site gutter so the first
            card starts flush with the heading's left edge and the last card
            lands with a matching right gutter when fully scrolled */}
        <div ref={trackRef} className="flex flex-nowrap gap-x-8 px-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              {...project}
              scrollTriggerConfig={{
                // Use the section itself as the trigger so start is measured
                // against the section's own natural position (before the pin
                // engages), not against each card's own position inside the
                // pin. Card positions inside a pinned element are unreliable
                // as trigger boundaries because GSAP adjusts them for the pin
                // spacer in ways that can cause mid-scroll reversals.
                //
                // start: "top bottom" — section enters the viewport (just
                //   before the pin kicks in); all cards begin revealing.
                trigger: sectionRef,
                start: "top bottom",
                // end: the pin's own live end, not "bottom top" against
                // sectionRef. GSAP's pin-compensation only offsets another
                // trigger's start/end when that trigger's *start* is at or
                // after the pin's start — ours starts earlier (cards reveal
                // before the pin engages), so "bottom top" resolves against
                // sectionRef's unpinned natural height instead of the true
                // pinned range, and the mask reverses mid-pin. Reading the
                // pin ScrollTrigger's `.end` directly (a plain number, used
                // as an absolute scroll position — see pinTriggerRef above)
                // sidesteps that geometry math and always matches the real
                // pinned range, however long it ends up being.
                end: () => pinTriggerRef.current?.end,
                toggleActions: "play reverse play reverse",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
