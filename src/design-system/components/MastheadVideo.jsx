import { useRef, useState } from "react";
import { gsap, useGSAP, REVEAL_DURATION, EASE_REVEAL } from "../animation";

export default function MastheadVideo({
  src,
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef(null);
  const maskRef = useRef(null);
  const videoRef = useRef(null);

  // First-frame-gated, not scroll-gated — onLoadedData below flips `loaded`,
  // and this dependency re-runs the reveal at that moment.
  useGSAP(
    () => {
      if (!loaded) return;

      const tl = gsap.timeline({
        defaults: { duration: REVEAL_DURATION, ease: EASE_REVEAL },
      });

      tl.fromTo(
        maskRef.current,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)" },
        0
      );
      // yPercent matches motion's y: "-1%" — both are relative to the
      // element's own height.
      tl.fromTo(
        videoRef.current,
        { scale: 1.04, yPercent: -1 },
        { scale: 1, yPercent: 0 },
        0
      );
    },
    { scope: wrapRef, dependencies: [loaded] }
  );

  return (
    <div
      ref={wrapRef}
      className={`overflow-hidden ${className}`}
      style={{
        visibility: loaded ? "visible" : "hidden",
      }}
    >
      <div ref={maskRef} style={{ clipPath: "inset(0% 0% 100% 0%)" }}>
        <video
          ref={videoRef}
          src={src}
          className="block w-full h-full object-cover"
          // Crucial attributes for background autoplay
          autoPlay
          loop
          muted
          playsInline
          // Trigger the animation once the first frame is ready
          onLoadedData={() => setLoaded(true)}
          style={{ transform: "scale(1.04) translateY(-1%)" }}
        />
      </div>
    </div>
  );
}
