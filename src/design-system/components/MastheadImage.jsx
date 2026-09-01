import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP, REVEAL_DURATION, EASE_REVEAL } from "../animation";
import HeadingReveal from "./HeadingReveal";

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
      className={`relative overflow-hidden ${className}`}
      style={{
        visibility: loaded ? "visible" : "hidden",
      }}
    >
      {/* Centering lives on this wrapper, not the heading: HeadingReveal
          animates the heading's own `y`, and GSAP writes `transform: none`
          onto it when that tween settles — which would wipe out any
          -translate-y-1/2 the heading carried. Flex centering survives it. */}
      <div className="absolute inset-y-0 left-8 z-50 flex items-center">
        <HeadingReveal
          as="h1"
          text={`Inside \nthe Box`}
          className="font-display text-display-h2 uppercase"
        />
      </div>
      <div ref={maskRef} style={{ clipPath: "inset(0% 0% 100% 0%)" }}>
        {/* The radius lives on the <img>, not the outer wrapper: callers put
            page padding (px-8 pb-1000) on that wrapper, so a radius there
            would round the padding box and leave the image square. rounded.md
            is the site's only corner radius (DESIGN.md), so it's fixed here
            rather than passed in. */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="block w-full h-full object-cover rounded-md"
        />
      </div>
    </div>
  );
}
