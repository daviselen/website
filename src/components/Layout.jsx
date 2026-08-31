import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router-dom";
import {
  gsap,
  useGSAP,
  ScrollSmoother,
  useSmoothScroll,
} from "../design-system/animation.js";
import NavBar from "../sections/NavBar";
import Footer from "../sections/Footer";

const DEFAULT_COLORS = [
  "rgba(0, 0, 0, 0.85)",
  "#2b2b2b",
  "#1f1f1f",
  "#000",
];

const DURATION = 0.25;
const MAX_DELAY = 0.6;

// Onset delay before the first pixel moves. Reproduces the ~80ms that
// motion's per-pixel component mount cost used to add for free. See the
// "Curtain lifecycle" note below.
const START_LAG = 0.08;

// When the phase flips, measured on the timeline's clock. Deliberately
// SHORTER than START_LAG + MAX_DELAY + DURATION (0.93s), so the reveal starts
// while the last pixels are still landing — that slight overlap is the
// original look, and it's why the screen never quite goes fully solid.
const COVER_WINDOW = DURATION + MAX_DELAY;

export default function PixelCurtain({
  pixelSize = 64,
  colors = DEFAULT_COLORS,
}) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const outlet = useOutlet();

  const [dimensions, setDimensions] = useState({
    cols: 0,
    rows: 0,
  });

  const [phase, setPhase] = useState(null);

  const [clickOrigin, setClickOrigin] = useState(null);
  const lastClickRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const previousPathname = useRef(location.pathname);

  /*
   * -----------------------------------------
   * Frozen route content
   * -----------------------------------------
   *
   * outletRef always holds the latest route element.
   * displayedOutlet is what actually renders, and only
   * updates while the curtain fully covers the screen,
   * so the swap happens hidden behind the pixels.
   */

  const outletRef = useRef(outlet);
  outletRef.current = outlet;

  const [displayedOutlet, setDisplayedOutlet] = useState(outlet);

  // Scroll to top only for Link/navigation (PUSH).
  // Back/Forward navigation is POP, so let the browser restore the position.
  useEffect(() => {
    if (
      previousPathname.current !== location.pathname &&
      navigationType === "PUSH"
    ) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navigationType]);

  /*
   * -----------------------------------------
   * Global Click Capture
   * -----------------------------------------
   * Listens for clicks anywhere on the page to set the ripple origin.
   */
  useEffect(() => {
    const handleGlobalClick = (e) => {
      lastClickRef.current = { x: e.clientX, y: e.clientY };
      
      // Clear the click reference after 1 second. 
      // This ensures that if the user navigates via the browser's 
      // Back/Forward buttons (without clicking), the ripple defaults to the center.
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => {
        lastClickRef.current = null;
      }, 1000);
    };

    window.addEventListener("click", handleGlobalClick, true); // use capture phase
    return () => window.removeEventListener("click", handleGlobalClick, true);
  }, []);

  /*
   * -----------------------------------------
   * Grid dimensions
   * -----------------------------------------
   */

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        cols: Math.ceil(window.innerWidth / pixelSize),
        rows: Math.ceil(window.innerHeight / pixelSize),
      });
    };

    updateDimensions();

    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [pixelSize]);

  /*
   * -----------------------------------------
   * Distance-based Pixel Data
   * -----------------------------------------
   */
  const jitter = 0.4;
  const pixelData = useMemo(() => {
    if (dimensions.cols === 0 || dimensions.rows === 0) return [];

    const originX = clickOrigin ? clickOrigin.x : window.innerWidth / 2;
    const originY = clickOrigin ? clickOrigin.y : window.innerHeight / 2;

    const originCol = Math.floor(originX / pixelSize);
    const originRow = Math.floor(originY / pixelSize);

    const maxDist = Math.max(
      Math.sqrt(Math.pow(0 - originCol, 2) + Math.pow(0 - originRow, 2)),
      Math.sqrt(Math.pow(dimensions.cols - 1 - originCol, 2) + Math.pow(0 - originRow, 2)),
      Math.sqrt(Math.pow(0 - originCol, 2) + Math.pow(dimensions.rows - 1 - originRow, 2)),
      Math.sqrt(Math.pow(dimensions.cols - 1 - originCol, 2) + Math.pow(dimensions.rows - 1 - originRow, 2))
    );

    const totalPixels = dimensions.cols * dimensions.rows;

    return Array.from({ length: totalPixels }, (_, index) => {
      const col = index % dimensions.cols;
      const row = Math.floor(index / dimensions.cols);
      
      const dist = Math.sqrt(Math.pow(col - originCol, 2) + Math.pow(row - originRow, 2));
      
      // Base radial distance delay (0.0 to MAX_DELAY)
      const baseDelay = (dist / maxDist) * MAX_DELAY;

      // Add a random offset centered around 0 (-jitter/2 to +jitter/2)
      const noiseIn = (Math.random() - 0.5) * jitter;
      const noiseOut = (Math.random() - 0.5) * jitter;

      // Clamp between 0 and MAX_DELAY so the curtain timing remains exact
      const delayIn = Math.min(MAX_DELAY, Math.max(0, baseDelay + noiseIn));
      const delayOut = Math.min(MAX_DELAY, Math.max(0, baseDelay + noiseOut));

      return {
        color: colors[Math.floor(Math.random() * colors.length)],
        delayIn,
        delayOut,
      };
    });
  }, [dimensions.cols, dimensions.rows, colors, clickOrigin, pixelSize, jitter]);

  /*
   * -----------------------------------------
   * Navigation detection
   * -----------------------------------------
   */

  useEffect(() => {
    if (previousPathname.current === location.pathname) {
      return;
    }
    previousPathname.current = location.pathname;

    // Lock in the click origin at the exact moment navigation starts
    setClickOrigin(lastClickRef.current);
    setPhase("cover");
  }, [location.pathname]);


  /*
   * -----------------------------------------
   * Curtain lifecycle
   * -----------------------------------------
   *
   * One timeline per phase. Two constants below exist to preserve the LOOK of
   * the original motion implementation, whose timing came partly from
   * incidental library behaviour rather than from anything declared:
   *
   * 1. START_LAG. motion mounted one component per pixel (~450 of them at a
   *    1792px viewport), each spinning up its own animation loop, so nothing
   *    moved until ~80ms after the click — the curtain eased up out of
   *    nothing. GSAP starts inside useLayoutEffect and renders its first
   *    frame BEFORE paint, so without this the curtain's first painted frame
   *    is already ~45% faded in, reading as a pop rather than a fade.
   *    Measured, not guessed: first pixel moved at 82ms under motion vs 13ms
   *    under GSAP, and the offset stayed constant across the whole ramp
   *    (all pixels started at 682ms vs 603ms), confirming it's a start-time
   *    shift and not an easing difference.
   *
   * 2. COVER_WINDOW. The old code advanced phases on setTimeout(850ms) while
   *    the animation ran ~80ms behind it, so the reveal began BEFORE the last
   *    pixels landed — average coverage peaked at 0.984 and the screen never
   *    quite went solid. Advancing on the timeline's own onComplete (the
   *    obvious "correct" translation) waits for true full coverage and then
   *    holds it ~100ms, which reads as heavier and slower. Firing the phase
   *    change at a fixed position on the timeline restores the original
   *    slight overlap.
   *
   * Both are dials: raise COVER_WINDOW past DURATION + MAX_DELAY + START_LAG
   * to get a real solid hold, drop START_LAG to 0 for an immediate start.
   */

  const curtainRef = useRef(null);

  useGSAP(
    () => {
      if (phase === null) return;

      const pixels = gsap.utils.toArray("[data-pixel]");
      if (!pixels.length) return;

      const covering = phase === "cover";

      const tl = gsap.timeline();

      pixels.forEach((el, i) => {
        const pixel = pixelData[i];
        if (!pixel) return;

        if (covering) {
          // circOut -> circ.out: same curve, GSAP's naming.
          tl.fromTo(
            el,
            { opacity: 0, scale: 0.5 },
            { opacity: 1, scale: 1.05, duration: DURATION, ease: "circ.out" },
            START_LAG + pixel.delayIn
          );
        } else {
          // Reveal starts from wherever cover left the pixel, so `to`, not
          // `fromTo` — mirroring motion animating out of its current state.
          tl.to(
            el,
            { opacity: 0, scale: 0.5, duration: DURATION, ease: "circ.in" },
            START_LAG + pixel.delayOut
          );
        }
      });

      // Phase advance at a fixed position on the timeline's clock — NOT
      // onComplete. See note 2 above: the overlap is the original look.
      // Still one clock, so it can't drift the way a parallel setTimeout did.
      tl.call(
        () => {
          if (covering) {
            // Swap route content behind the curtain, then reveal.
            setDisplayedOutlet(outletRef.current);
            setPhase("reveal");
          } else {
            setPhase(null);
          }
        },
        null,
        COVER_WINDOW
      );
    },
    { scope: curtainRef, dependencies: [phase, pixelData] }
  );

  /*
   * -----------------------------------------
   * Render
   * -----------------------------------------
   */

  return (
    <div className="relative min-h-screen">
      {/* Route content */}
      <div className="min-h-screen bg-surface-default py-1800 font-narrow font-light text-neutral-0">
        <NavBar />
        {displayedOutlet}
        <Footer />
      </div>

      {/* Curtain */}
      {phase !== null && dimensions.cols > 0 && (
        <div
          ref={curtainRef}
          className="pointer-events-none fixed inset-0 z-50 grid"
          style={{
            gridTemplateColumns: `repeat(${dimensions.cols}, 1fr)`,
            gridTemplateRows: `repeat(${dimensions.rows}, 1fr)`,
          }}
        >
          {/* Plain divs, not motion components: at 64px per cell a 1792px
              viewport is ~450 of these, and each motion.div carried its own
              hook state and animation loop. The timeline above drives them
              all as raw DOM nodes off a single ticker. Order here matches
              pixelData's order, which is how each node finds its own
              delayIn/delayOut. */}
          {pixelData.map((pixel, index) => (
            <div
              key={index}
              data-pixel=""
              style={{
                backgroundColor: pixel.color,
                opacity: 0,
                transform: "scale(0.5)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}