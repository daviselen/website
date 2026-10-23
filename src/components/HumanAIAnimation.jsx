import { useEffect, useRef } from 'react';
// SVG-only build: the only renderer used below, at roughly half the size of
// the full lottie-web bundle.
import lottie from 'lottie-web/build/player/lottie_light';
import { gsap } from 'gsap';

// The wheel's colors are baked into the JSON, so light mode loads a recolored
// copy (public/human-ai-wheel-light.json: the same file with each fill moved
// to a step that holds 4.5:1 on the light panel). Mirrors the `light:` variant
// in tailwind.config.js. shortcut: read once at mount, so a theme change shows
// on the next load; upgrade if a toggle ships.
const isLight = () => document.documentElement.dataset.theme === 'light';

export default function LottieGsapAnimation() {
  const containerRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Lottie inside the container ref
    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      path: isLight() ? '/human-ai-wheel-light.json' : '/human-ai-wheel.json',
    });

    let playhead = { frame: 0 };
    let tween;

    // 2. Wait for Lottie to load its SVG DOM elements before triggering GSAP
    animRef.current.addEventListener('DOMLoaded', () => {
      tween = gsap.to(playhead, {
        frame: animRef.current.totalFrames - 1,
        ease: 'none',
        duration: 3, // Control the playback speed here
        onUpdate: () => {
          animRef.current.goToAndStop(playhead.frame, true);
        },
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom-=100',
          once: true,
        },
      });
    });

    // 3. Clean up on component unmount to prevent memory leaks
    return () => {
      if (tween) tween.kill();
      if (animRef.current) animRef.current.destroy();
    };
  }, []);

  return (
    <div className="lottie-wrapper mx-auto mt-16 block w-full max-w-md lg:mx-0 lg:mt-0 lg:w-[39.655vw] lg:max-w-none lg:shrink-0">
      {/* Target DOM element for lottie-web */}
      <div ref={containerRef} className="min-w-3200 min-h-3200" />
    </div>
  );
}