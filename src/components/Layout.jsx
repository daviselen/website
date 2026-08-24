import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useOutlet } from "react-router-dom";
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
const MAX_DELAY = 0.3;

export default function PixelCurtain({
  pixelSize = 80,
  colors = DEFAULT_COLORS,
}) {
  const location = useLocation();
  const outlet = useOutlet();

  const [dimensions, setDimensions] = useState({
    cols: 0,
    rows: 0,
  });

  const [phase, setPhase] = useState(null);

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
   * Random pixel data
   * -----------------------------------------
   */

  const pixelData = useMemo(() => {
    const totalPixels = dimensions.cols * dimensions.rows;

    return Array.from({ length: totalPixels }, () => ({
      color: colors[Math.floor(Math.random() * colors.length)],
      delayIn: Math.random() * MAX_DELAY,
      delayOut: Math.random() * MAX_DELAY,
    }));
  }, [dimensions.cols, dimensions.rows, colors]);

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
      <div className="min-h-screen bg-surface-default py-1800 font-narrow text-neutral-0">
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