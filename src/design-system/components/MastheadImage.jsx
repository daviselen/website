import { useEffect, useRef, useState } from "react";
import { useMediaReveal } from "../animation";
import HeadingReveal from "./HeadingReveal";

export default function MastheadImage({
  src,
  alt = "",
  className = "",
  title = "",
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

  // Decode-gated, not scroll-gated: no ScrollTrigger here. `loaded` is what
  // gates the shared reveal below — same dependency shape motion's `animate`
  // prop re-evaluated on.
  useMediaReveal(wrapRef, { maskRef, mediaRef: imgRef, loaded });

  return (
    <div className="px-8 pb-1000 rounded-md overflow-hidden">
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
          {/* text-display-h2 (184px/128px) was fixed at every width — real
              spec is desktop-only, and Masthead.jsx's own h1 already scales
              the same way (text-6xl -> md:text-8xl -> lg:text-display-h1);
              this one had no mobile/tablet step at all. */}
          <HeadingReveal
            as="h1"
            text={title}
            className="font-display text-5xl uppercase leading-none md:text-7xl lg:text-display-h2"
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
    </div>
  );
}
