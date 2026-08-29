import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, REVEAL_DURATION, EASE_REVEAL } from "../animation";

export default function MastheadImage({
  src,
  alt = "",
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef(null);
  const maskRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const img = new Image();

    img.src = src;

    const load = async () => {
      try {
        // Wait until the browser has decoded the image.
        await img.decode();
      } catch {
        // decode() can reject in some browsers even though
        // the image is usable, so don't block the animation.
      }

      if (!cancelled) {
        setLoaded(true);
      }
    };

    if (img.complete) {
      load();
    } else {
      img.addEventListener("load", load, { once: true });
    }

    return () => {
      cancelled = true;
      img.removeEventListener("load", load);
    };
  }, [src]);

  // Decode-gated, not scroll-gated: no ScrollTrigger here. The `loaded`
  // dependency re-runs this hook exactly where motion re-evaluated its
  // `animate` prop, and fromTo (rather than to) means a changed src replays
  // from the hidden state instead of animating from wherever it stopped.
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
      // yPercent is the exact equivalent of motion's y: "-1%" — both resolve
      // the percentage against the element's own height.
      tl.fromTo(
        imgRef.current,
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
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="block w-full h-full object-cover"
          style={{ transform: "scale(1.04) translateY(-1%)" }}
        />
      </div>
    </div>
  );
}
