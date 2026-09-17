import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import { gsap } from 'gsap';

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
      path: '/human-ai-wheel.json', // Place your JSON in the public folder or import it
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