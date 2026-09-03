import { useRef } from "react";
import { gsap, useGSAP, EASE_OUT } from "../animation";

export default function ParagraphReveal({
  text,
  as: Tag = "p",
  className = "",
  itemProp,
  staggerSpeed = 0.02,
  delay = 0, // Optional delay before the reveal begins (in seconds)
  scrollTriggerConfig = {},
}) {
  // Plain intrinsic tag now — motion[as] existed only to attach variants.
  // GSAP animates the real DOM node through a ref, so no wrapper component
  // is needed and `as` can be any element name without a motion equivalent.
  const rootRef = useRef(null);

  // Split into words while preserving normal paragraph flow
  const words = text.split(" ");

  useGSAP(
    () => {
      // motion propagated `variants` from parent to children automatically;
      // GSAP has no such inheritance, so the parent fade and the per-word
      // stagger become two explicit tweens on one timeline. Position "0"
      // and `delay` place them on the same shared clock, which is what
      // delayChildren + staggerChildren did implicitly.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          // viewport: { margin: "-50px" } — fire 50px inside each edge.
          // scrollTriggerConfig lets a parent override these defaults — used
          // by the horizontal-scroll PortfolioGrid so titles don't reverse
          // mid-pin as the scroll position advances through the pin spacer.
          start: scrollTriggerConfig.start ?? "top bottom-=50",
          end: scrollTriggerConfig.end ?? "bottom top+=50",
          // once: false meant motion re-hid the text on exit and replayed on
          // re-entry, in BOTH directions. These four actions
          // (onEnter/onLeave/onEnterBack/onLeaveBack) reproduce that.
          toggleActions: scrollTriggerConfig.toggleActions ?? "play reverse play reverse",
        },
      });

      tl.to(rootRef.current, { opacity: 1, duration: 0.4, ease: EASE_OUT }, 0);
      tl.to(
        // Scoped selector — only this instance's words, never a sibling's.
        // A data attribute rather than a class: eslint's tailwindcss plugin
        // treats any non-Tailwind classname as an error, and this hook is
        // for JS, not styling.
        "[data-reveal-word]",
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.4,
          ease: EASE_OUT,
          stagger: staggerSpeed,
        },
        delay
      );
    },
    { scope: rootRef, dependencies: [text, staggerSpeed, delay] }
  );

  return (
    <Tag
      ref={rootRef}
      itemProp={itemProp}
      className={className}
      // Hidden state inline so it's right on first paint, before GSAP runs.
      style={{ opacity: 0 }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          data-reveal-word=""
          className="inline-block"
          style={{
            opacity: 0,
            transform: "translateY(8px)",
            filter: "blur(4px)",
          }}
        >
          {word}&nbsp;
        </span>
      ))}
    </Tag>
  );
}
