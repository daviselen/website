import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import HorizontalReveal from "../components/HorizontalReveal";
import TextReveal from "../components/TextReveal";

// 1. Define the orchestration and the top-to-bottom mask reveal
const cardVariants = {
    hidden: { 
      // Inset 100% from the bottom hides the card. 
      // Animating to 0% creates a top-to-bottom reveal.
      clipPath: "inset(0% 0% 100% 0%)",
    },
    visible: {
      clipPath: "inset(0% 0% 0% 0%)",
      transition: {
        duration: 26.153 / 30,
        ease: [0.8, 0, 0.2, 1], // Smooth custom cubic-bezier easing
      },
    },
};
  
export default function ProjectCard({ title, client, src, videoSrc, startColumn2 }) {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.2, once: false });

    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        videoRef.current?.play().catch((error) => {
            console.warn("Autoplay blocked:", error);
        });
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        videoRef.current?.pause();
    };
  
    return (
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        itemScope
        itemType="https://schema.org/CreativeWork"
        className={`relative mb-2000 aspect-[55/36] w-full overflow-hidden rounded-md break-inside-avoid ${
          startColumn2 ? "break-before-column" : ""
        }`}
      >
        <meta itemProp="creator" content="Davis Elen Advertising" />
        <motion.div
          // Aspect is 55/36 (880/480), same as From The Inside Out, per direct
          // correction — not the 879/576 (≈1.526, noticeably narrower) this
          // had before.
          //
          // Real case studies, so each card is its own schema.org CreativeWork
          // item (title -> name, client -> about, plus a hidden creator meta —
          // true and already established elsewhere in the codebase, e.g.
          // DeLogo's alt text, not invented for this). This is a separate
          // itemScope from the page's outer Organization item in HomePage.jsx,
          // not nested inside it — that's normal; a page can contain multiple
          // independent schema.org Items.
          // 3. Swap to motion.div, attach variants, and set the viewport trigger
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={cardVariants}
          onAnimationComplete={(variant) => {
            if (variant === "visible") {
              setIsRevealed(true);
            } else if (variant === "hidden") {
              setIsRevealed(false); 
            }
          }}
          className="relative h-full w-full overflow-hidden rounded-md"
          style={{ willChange: "clip-path" }}
        >
        {videoSrc ? (
            <video
                ref={videoRef}
                src={videoSrc}
                // poster={src}
                muted
                playsInline
                preload="metadata"
                itemProp="image"
                className={`absolute inset-0 h-full w-full min-w-full min-h-full max-w-none object-cover`}
            />
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
          className="absolute inset-0"
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
        </motion.div>
      </div>
    );
}