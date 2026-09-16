import { useRef, useState } from "react";
import { useMediaReveal } from "../animation";

export default function MastheadVideo({
  src,
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);
  const wrapRef = useRef(null);
  const maskRef = useRef(null);
  const videoRef = useRef(null);

  // First-frame-gated, not scroll-gated — onLoadedData below flips `loaded`,
  // which is what gates the shared reveal below.
  useMediaReveal(wrapRef, { maskRef, mediaRef: videoRef, loaded });

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
          className="block w-full h-full object-cover rounded-md"
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
