import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router-dom";
import { motion } from "motion/react";
import NavBar from "../sections/NavBar";
import Footer from "../sections/Footer";

const DEFAULT_COLORS = [
  "rgba(0, 0, 0, 0.5)",
  "#2b2b2b",
  "#1f1f1f",
  "#000",
];

const DURATION = 0.25;
const MAX_DELAY = 0.6;

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
   * Calculate how long the cover takes
   * -----------------------------------------
   *
   * The last pixel can start at MAX_DELAY
   * and then takes DURATION to finish.
   */

  const coverDuration = DURATION + MAX_DELAY;

  // Navigation detection
  useEffect(() => {
    if (previousPathname.current === location.pathname) {
      return;
    }

    previousPathname.current = location.pathname;
    setPhase("cover");
  }, [location.pathname]);


  /*
   * -----------------------------------------
   * Curtain lifecycle
   * -----------------------------------------
   */

  useEffect(() => {
    if (phase !== "cover") {
      return;
    }

    const timer = setTimeout(() => {
      // Fully covered: swap route content behind the curtain, then reveal.
      setDisplayedOutlet(outletRef.current);
      setPhase("reveal");
    }, coverDuration * 1000);

    return () => clearTimeout(timer);
  }, [phase, coverDuration]);

  /*
   * -----------------------------------------
   * Reveal lifecycle
   * -----------------------------------------
   */

  useEffect(() => {
    if (phase !== "reveal") {
      return;
    }

    const timer = setTimeout(() => {
      setPhase(null);
    }, coverDuration * 1000);

    return () => clearTimeout(timer);
  }, [phase, coverDuration]);

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
          className="pointer-events-none fixed inset-0 z-50 grid"
          style={{
            gridTemplateColumns: `repeat(${dimensions.cols}, 1fr)`,
            gridTemplateRows: `repeat(${dimensions.rows}, 1fr)`,
          }}
        >
          {pixelData.map((pixel, index) => (
            <motion.div
              key={index}
              style={{
                backgroundColor: pixel.color,
              }}
              initial={{
                opacity: 0,
                scale: 0.5,
              }}
              animate={
                phase === "cover"
                  ? {
                      opacity: 1,
                      scale: 1.05,
                      transition: {
                        duration: DURATION,
                        delay: pixel.delayIn,
                        ease: "circOut",
                      },
                    }
                  : {
                      opacity: 0,
                      scale: 0.5,
                      transition: {
                        duration: DURATION,
                        delay: pixel.delayOut,
                        ease: "circIn",
                      },
                    }
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}