import { useRef, useState } from "react";
import { gsap, useGSAP, REVEAL_DURATION, EASE_REVEAL } from "../animation";
import HorizontalReveal from "../components/HorizontalReveal";
import TextReveal from "../components/TextReveal";

// 1. The top-to-bottom mask reveal. Inset 100% from the bottom hides the
// card; animating to 0% wipes it in downward.
const CARD_HIDDEN = "inset(0% 0% 100% 0%)";
const CARD_VISIBLE = "inset(0% 0% 0% 0%)";

export default function ProjectCard({ title, client, src, videoSrc, startColumn2, scrollTriggerConfig = {} }) {
  const containerRef = useRef(null);
  const maskRef = useRef(null);

    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);

    // isRevealed gates whether the caption children RENDER at all (see note
    // 4 below), so the timeline has to report back into React state — this
    // is the one place in the migration where an animation callback still
    // drives a re-render. motion did it via onAnimationComplete(variant);
    // GSAP splits the same two cases across onComplete/onReverseComplete.
    useGSAP(
      () => {
        gsap.fromTo(
          maskRef.current,
          { clipPath: CARD_HIDDEN },
          {
            clipPath: CARD_VISIBLE,
            duration: REVEAL_DURATION,
            ease: EASE_REVEAL,
            onComplete: () => setIsRevealed(true),
            onReverseComplete: () => setIsRevealed(false),
            scrollTrigger: {
              trigger: containerRef.current,
              // useInView's `amount: 0.2` meant "20% of the ELEMENT is
              // visible". The percentage in the first half of a start/end
              // string is measured against the trigger's own height, so
              // "top+=20% bottom" is that same threshold — note this is NOT
              // "top bottom-=20%", which would measure 20% of the viewport.
              //
              // scrollTriggerConfig lets a parent (e.g. the horizontal-scroll
              // PortfolioGrid) override these three values so the reveal fires
              // at the right time even when the section is pinned. All other
              // usages pass nothing and get the defaults below unchanged.
              start: scrollTriggerConfig.start ?? "top+=20% bottom",
              end: scrollTriggerConfig.end ?? "bottom-=20% top",
              // once: false — the card re-hides on exit and replays on
              // re-entry, in both scroll directions.
              toggleActions: scrollTriggerConfig.toggleActions ?? "play reverse play reverse",
            },
          }
        );
      },
      { scope: containerRef }
    );

    const handleMouseEnter = () => {
        setIsHovered(true);
        videoRef.current?.play().catch((error) => {
            console.warn("Autoplay blocked:", error);
        });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoSrc && videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0; // Resets video back to 0:00 frame
        }
    };
  
    return (
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        itemScope
        itemType="https://schema.org/CreativeWork"
        className={`relative aspect-[11/6] basis-[calc(50%-1rem)] grow shrink-0 transition-all ease-in-out w-full overflow-hidden rounded-md break-inside-avoid ${
          startColumn2 ? "break-before-column" : ""
        }`}
      >
        <meta itemProp="creator" content="Davis Elen Advertising" />
        <div
          // Aspect is 11/6 (880/480), same as From The Inside Out, per direct
          // correction — not the 55/36 (880/576) (≈1.527, noticeably narrower) this
          // had before.
          //
          // Real case studies, so each card is its own schema.org CreativeWork
          // item (title -> name, client -> about, plus a hidden creator meta —
          // true and already established elsewhere in the codebase, e.g.
          // DeLogo's alt text, not invented for this). This is a separate
          // itemScope from the page's outer Organization item in HomePage.jsx,
          // not nested inside it — that's normal; a page can contain multiple
          // independent schema.org Items.
          // 3. The mask element the timeline above drives. Its hidden state is
          // inline so it's correct on first paint, before GSAP runs.
          ref={maskRef}
          className="relative h-full w-full overflow-hidden rounded-md"
          style={{ clipPath: CARD_HIDDEN, willChange: "clip-path" }}
        >
        {videoSrc ? (
            <video
                ref={videoRef}
                // poster={src}
                muted
                playsInline
                preload="auto"
                itemProp="image"
                className={`absolute inset-0 h-full w-full min-w-full min-h-full max-w-none object-cover`}
            >
              <source src={videoSrc.webm} type="video/webm" />
              <source src={videoSrc.mp4} type="video/mp4" />
            </video>
        ) : (
          <img
            src={src}
            alt={`${title} — ${client} project photo`}
            itemProp="image"
            className={`absolute inset-0 h-full w-full object-cover`}
          />
        )}
        {/* Corrected per direct confirmation (I can't see the actual Figma
            component myself — no way to view it beyond what get_design_context
            returns, and that data was ambiguous enough that I misread it as
            per-card variation last time). It's ONE unified gradient across
            every card, not per-photo tuning: angled (not straight vertical),
            and — the important bit — the darkest stop sits OUTSIDE the
            visible image, so the bottom edge never actually reaches full
            solid black, only a partial shade. The raw values I'd pulled
            earlier (angles clustering ~191–199deg; a couple of end stops at
            100.3%/105.2%, i.e. already past the visible edge) partially
            supported this and I didn't weight it correctly — treated those
            as per-card noise instead of the real, consistent shape.
            195deg / 60% / 130% below are my best approximation of "angled,
            ends past 100%" — if you can read the exact angle/stop values off
            the Figma inspector, give me those and I'll use them exactly
            instead.
  
            Inline `style` instead of a Tailwind `bg-[linear-gradient(...)]`
            arbitrary class: confirmed via a real screenshot of the deployed
            site that the Tailwind-class version wasn't rendering at all on
            every single card, bright or dark — no darkening was visible
            anywhere, even on light illustrated backgrounds where it should
            have been obvious. HumanAI.jsx's grid-line background uses inline
            `style` for its own multi-layer background-image and does render
            correctly on the same deploy, which is why this moved to the
            same mechanism rather than debugging the Tailwind JIT/purge
            pipeline blind. */}
        <div
          className="absolute inset-0 pointer-events-none chrome-gradient-adjust"
          style={{ backgroundImage: "linear-gradient(195deg, transparent 60%, black 130%)" }}
        />
        <div className="absolute inset-x-8 bottom-8 flex flex-col gap-300 text-neutral-0">
          {/* 4. Conditionally render the text components. 
              Because this wrapper is 'absolute', deferring the render of 
              the text won't break the layout or height of the card. */}
          {isRevealed && (
            <>
              <TextReveal
                itemProp="name"
                className="font-narrow font-light text-base leading-6 md:text-2xl md:leading-8"
                text={title}
                scrollTriggerConfig={scrollTriggerConfig}
              >
                {title}
              </TextReveal>
              <HorizontalReveal
                as="h3"
                itemProp="about"
                className="font-display text-4xl uppercase leading-none md:text-6xl lg:text-display-card"
                text={client}
              >
                {client}
              </HorizontalReveal>
            </>
          )}
        </div>
        </div>
      </div>
    );
}