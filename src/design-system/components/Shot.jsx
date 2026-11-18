import { useRef } from "react";
import {
  gsap,
  useGSAP,
  REVEAL_DURATION,
  EASE_REVEAL,
  toggleActions,
} from "../animation";
import Picture from "./Picture";

// Figma crops each photo to a fixed frame; the frame ratio is applied here
// rather than minted as a Tailwind token per crop, since none are reused.
// Same top-down wipe and trigger window as MediaObject's image. `className`
// places the wrapper in its grid; `delay` staggers images shown side by side.
export default function Shot({ src, alt, ratio, className = "", imgClassName = "", delay = 0, children }) {
  const maskRef = useRef(null);

  useGSAP(
    () => {
      // The offset is a timeline position, not a tween `delay`: ScrollTrigger
      // plays the animation from its own start and ignores a tween's delay.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: maskRef.current,
            start: "top bottom-=100",
            end: "bottom top",
            toggleActions: toggleActions("play reverse play reverse"),
          },
        })
        .fromTo(
          maskRef.current,
          { clipPath: "inset(0% 0% 100% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: REVEAL_DURATION,
            ease: EASE_REVEAL,
          },
          delay
        );
    },
    { scope: maskRef }
  );

  return (
    <div
      ref={maskRef}
      className={className}
      style={{ clipPath: "inset(0% 0% 100% 0%)" }}
    >
      {children ?? (
        <Picture
          src={src}
          alt={alt}
          style={{ aspectRatio: ratio }}
          className={`block w-full rounded-md object-cover ${imgClassName}`}
        />
      )}
    </div>
  );
}
