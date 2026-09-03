import { useRef } from "react";
import { gsap, useGSAP, REVEAL_DURATION, EASE_REVEAL } from "../animation";

export default function HorizontalReveal({
  children,
  className = "",
  direction = "left",
  delay = 0,
  // playOnMount: skip ScrollTrigger and play immediately on mount.
  // Used by ImageCard — the text mounts only after the card's clip-path
  // reveal completes (isRevealed gate), so the scroll position is already
  // deep inside the pinned section. A ScrollTrigger initialised at that
  // point can't reliably determine which side of its boundaries we're on
  // and ends up stuck in the reversed (hidden) state.
  playOnMount = false,
}) {
  const clipPaths = {
    left: {
      initial: "inset(0% 100% 0% 0%)",
      animate: "inset(0% 0% 0% 0%)",
    },

    right: {
      initial: "inset(0% 0% 0% 100%)",
      animate: "inset(0% 0% 0% 0%)",
    },
  };

  const clip = clipPaths[direction];

  // Trigger off the OUTER wrapper, not the inner span. The inner span starts
  // at `clip-path: inset(0% 100% 0% 0%)` (clipped to zero width). The old
  // IntersectionObserver used the clipped paint area, so a zero-area target
  // never reported "in view" and the reveal deadlocked (this is why the first
  // heading in each row never animated). ScrollTrigger measures layout bounds
  // via getBoundingClientRect, which clip-path doesn't shrink, so it wouldn't
  // hit that specific bug — but the wrapper stays the trigger anyway, since
  // it's the element whose box actually describes where the text sits.
  const wrapRef = useRef(null);
  const innerRef = useRef(null);

  useGSAP(
    () => {
      // start "top bottom-=100" reproduces the observer's rootMargin: -100px
      // (fire 100px after the element's top crosses the viewport bottom),
      // and once: true reproduces its observer.disconnect().
      gsap.fromTo(
        innerRef.current,
        { clipPath: clip.initial },
        {
          clipPath: clip.animate,
          duration: REVEAL_DURATION,
          delay,
          ease: EASE_REVEAL,
          scrollTrigger: playOnMount
            ? undefined
            : {
                trigger: wrapRef.current,
                start: "top bottom-=100",
                once: true,
              },
        }
      );
    },
    { scope: wrapRef, dependencies: [direction, delay, playOnMount] }
  );

  return (
    <span ref={wrapRef} className={`block overflow-hidden -my-[0.075em] ${className}`}>
      <span
        ref={innerRef}
        className="block w-full py-[0.075em]"
        // Inline so the clipped state is correct on first paint, before GSAP
        // runs — motion's `initial` prop did this same job.
        style={{ clipPath: clip.initial }}
      >
        {children}
      </span>
    </span>
  );
}
