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

  useGSAP(
    () => {
      const clip = clipRef.current;
      const track = trackRef.current;

      // How far the track must travel so the last card's right edge lands at
      // the clip's right edge. Re-evaluated on every ScrollTrigger.refresh()
      // so resize and late-loading fonts never leave a stale offset.
      const getDistance = () => track.scrollWidth - clip.offsetWidth;

      gsap.to(track, {
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
          scrub: 1,
          // Smooths the layout jump when the pin kicks in (especially
          // noticeable with ScrollSmoother's transform-based pinning).
          anticipatePin: 1,
          // Recalculate start/end/distance on every ScrollTrigger.refresh().
          invalidateOnRefresh: true,
        },
      });
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
                // Fire as soon as the section's top enters the viewport —
                // the section is approaching the pin point so all cards
                // are already fully visible vertically; no need to wait
                // for a 20% threshold.
                start: "top bottom",
                // Push the reset point far past the end of the pin spacer
                // so the reveal never reverses while the user is scrolling
                // horizontally through the cards.
                end: "bottom+=500% top",
                // Play once on the way in; never reverse mid-scroll.
                toggleActions: "play none none none",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
