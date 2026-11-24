import { useEffect, useRef } from "react";
import { gsap } from "../animation";
import { prefersReducedMotion } from "../../lib/reducedMotion.js";

// Same geometry as public/icons/play-alt.svg and pause.svg, inlined so
// MorphSVGPlugin can tween the glyph's `d`. The pause bars are one compound
// path (two subpaths) because the plugin morphs a single path element.
const PLAY_D =
  "M27.6039 19.1304C28.2779 19.5139 28.2779 20.4852 27.6039 20.8687L16.5033 27.1852C15.8367 27.5645 15.0087 27.083 15.0087 26.316L15.0087 13.6831C15.0087 12.9161 15.8367 12.4346 16.5033 12.814L27.6039 19.1304Z";
const PAUSE_D =
  "M15.0938 12.7031H17.0313A1 1 0 0 1 18.0313 13.7031V26.2969A1 1 0 0 1 17.0313 27.2969H15.0938A1 1 0 0 1 14.0938 26.2969V13.7031A1 1 0 0 1 15.0938 12.7031Z" +
  "M22.9688 12.7031H24.9063A1 1 0 0 1 25.9063 13.7031V26.2969A1 1 0 0 1 24.9063 27.2969H22.9688A1 1 0 0 1 21.9688 26.2969V13.7031A1 1 0 0 1 22.9688 12.7031Z";

// The masthead's play/pause glyph: the triangle morphs into the two bars.
export default function PlayPauseIcon({ playing, className = "" }) {
  const pathRef = useRef(null);

  useEffect(() => {
    const tween = gsap.to(pathRef.current, {
      morphSVG: playing ? PAUSE_D : PLAY_D,
      duration: prefersReducedMotion() ? 0 : 0.35,
      ease: "power2.inOut",
    });
    return () => tween.kill();
  }, [playing]);

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="20"
        cy="20"
        r="19.25"
        fill="black"
        fillOpacity="0.4"
        stroke="white"
        strokeWidth="1.5"
      />
      <path ref={pathRef} d={PLAY_D} fill="white" />
    </svg>
  );
}
