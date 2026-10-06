import { useLayoutEffect, useRef } from "react";
import { gsap, useGSAP, EASE_OUT } from "../animation";

export default function ParagraphReveal({
  text,
  as: Tag = "p",
  className = "",
  itemProp,
  staggerSpeed = 0.02,
  delay = 0, // Optional delay before the reveal begins (in seconds)
  scrollTriggerConfig = {},
  // playOnMount: skip ScrollTrigger entirely and play immediately when the
  // component mounts. Used by ImageCard — its text mounts only after the
  // card's own clip-path reveal completes (isRevealed gate), so the scroll
  // position is already deep inside the pinned section. A ScrollTrigger
  // initialised at that point can't reliably determine which side of its
  // boundaries we're on and ends up in the reversed (hidden) state.
  playOnMount = false,
  // Called once the last word has finished revealing.
  onComplete,
  // Starting opacity of each word. Chrome never counts an opacity:0 element
  // as painted, so a reveal from 0 sets LCP to whenever the words finish
  // arriving. A barely-there value (0.01 is invisible on any background)
  // lets above-the-fold copy count as painted on the first frame without
  // changing how the reveal looks. Leave at 0 below the fold.
  fromOpacity = 0,
}) {
  // Plain intrinsic tag now — motion[as] existed only to attach variants.
  // GSAP animates the real DOM node through a ref, so no wrapper component
  // is needed and `as` can be any element name without a motion equivalent.
  const rootRef = useRef(null);
  // Ref, not a useGSAP dependency: an inline callback is a new function every
  // render, and rebuilding the timeline for that would restart the reveal.
  const onCompleteRef = useRef(onComplete);
  useLayoutEffect(() => {
    onCompleteRef.current = onComplete;
  });

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
        delay,
        onComplete: () => onCompleteRef.current?.(),
        ...(playOnMount
          ? // No ScrollTrigger — play straight through on mount.
            {}
          : {
              scrollTrigger: {
                trigger: rootRef.current,
                // viewport: { margin: "-50px" } — fire 50px inside each edge.
                // scrollTriggerConfig lets a parent override these defaults.
                start: scrollTriggerConfig.start ?? "top bottom-=50",
                end: scrollTriggerConfig.end ?? "bottom top+=50",
                toggleActions: scrollTriggerConfig.toggleActions ?? "play none none none",
              },
            }),
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
    { scope: rootRef, dependencies: [text, staggerSpeed, delay, playOnMount] }
  );

  return (
    <Tag
      ref={rootRef}
      itemProp={itemProp}
      className={className}
      // Hidden state inline so it's right on first paint, before GSAP runs.
      // With fromOpacity the words carry the hidden state on their own; a
      // parent at 0 would hide them from LCP regardless.
      style={{ opacity: fromOpacity > 0 ? 1 : 0 }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          data-reveal-word=""
          className="inline-block"
          style={{
            opacity: fromOpacity,
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
