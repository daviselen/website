import { useRef } from "react";
import { gsap, useGSAP, REVEAL_DURATION, LINE_DELAY, EASE_REVEAL } from "../animation";

export default function HeadingReveal({
  text,
  as: Tag = "h2",
  itemProp,
  className = "",
}) {
  const rootRef = useRef(null);
  const lines = text.split("\n");

  useGSAP(
    () => {
      // Two levels, exactly as the motion version split them: the parent
      // carries ONE unified Y-translation for the whole block, and each line
      // carries only its own staggered clip-path mask. Keeping them as
      // separate tweens on a shared timeline preserves that split — the
      // block slides as a unit while the masks fire in sequence.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          // viewport margin "0px 0px -100px 0px" — bottom edge only, so the
          // start is inset 100px but the end is the real viewport top.
          start: "top bottom-=100",
          end: "bottom top",
          // once: false — motion re-hid on exit and replayed on re-entry,
          // in both scroll directions.
          toggleActions: "play reverse play reverse",
        },
      });

      // Parent Y. GSAP converts the em unit against the element's own
      // font-size, matching how motion resolved "0.25em" here.
      tl.fromTo(
        rootRef.current,
        { y: "0.25em" },
        { y: "0em", duration: REVEAL_DURATION, ease: EASE_REVEAL },
        0
      );

      // Per-line masks. `stagger` replaces the hand-computed
      // `delay={index * LINE_DELAY}` the old RevealLine child took as a prop
      // — same arithmetic, but GSAP owns the indexing now.
      tl.fromTo(
        "[data-reveal-line]",
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: REVEAL_DURATION,
          ease: EASE_REVEAL,
          stagger: LINE_DELAY,
        },
        0
      );
    },
    { scope: rootRef, dependencies: [text] }
  );

  return (
    <Tag ref={rootRef} itemProp={itemProp} className={className}>
      {lines.map((line, index) => (
        <RevealLine key={index}>{line}</RevealLine>
      ))}
    </Tag>
  );
}

function RevealLine({ children }) {
  return (
    <span
      className="relative block"
      style={{
        overflow: "hidden",
        padding: "0.0333333em 0",
        margin: "-0.0333333em 0",
      }}
    >
      <span
        // Selected by the parent's timeline. A data attribute rather than a
        // class because eslint's tailwindcss plugin errors on any classname
        // it doesn't recognize, and this is a JS hook, not styling.
        data-reveal-line=""
        className="block w-full pt-[0.0125em] pb-[0.02em]"
        style={{
          clipPath: "inset(100% 0 0 0)",
          willChange: "clip-path",
          transform: "translateZ(0)",
        }}
      >
        {children}
      </span>
    </span>
  );
}
