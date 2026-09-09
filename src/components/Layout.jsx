import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigationType, useOutlet } from "react-router-dom";
import {
  gsap,
  useGSAP,
  ScrollSmoother,
  useSmoothScroll,
  ScrollTrigger,
} from "../design-system/animation.js";
import { VideoOverlayProvider } from "../design-system/components/VideoOverlay.jsx";
import NavBarAlt from "../sections/NavBarAlt";
import Footer from "../sections/Footer";

const FADE_DURATION = 0.3;

export default function PageTransition({ overlayColor = "#000" }) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const outlet = useOutlet();

  const [phase, setPhase] = useState(null); // null | "cover" | "reveal"
  const previousPathname = useRef(location.pathname);
  const overlayRef = useRef(null);

  // Store active navigation state in refs so React state updates
  // don't trigger re-renders that reset ScrollSmoother prematurely
  const activeOutletRef = useRef(outlet);
  const pendingOutletRef = useRef(outlet);
  const navigationTypeRef = useRef(navigationType);

  // Maintain displayed content in state
  const [displayedOutlet, setDisplayedOutlet] = useState(outlet);

  // Initialize smooth scroll wrapper ONCE
  useSmoothScroll();

  /*
   * -----------------------------------------
   * Synchronous Route Intercept
   * -----------------------------------------
   */
  useLayoutEffect(() => {
    if (previousPathname.current === location.pathname) {
      return;
    }

    previousPathname.current = location.pathname;
    navigationTypeRef.current = navigationType;
    pendingOutletRef.current = outlet;

    // Immediately kick off the transition phase
    setPhase("cover");
  }, [location.pathname, navigationType, outlet]);

  /*
   * -----------------------------------------
   * Fade Lifecycle & Scroll Lock
   * -----------------------------------------
   */
  useGSAP(
    () => {
      if (!phase || !overlayRef.current) return;

      const smoother = ScrollSmoother.get();

      if (phase === "cover") {
        // 1. Lock current scroll position while overlay fades in
        if (smoother) {
          smoother.paused(true);
        }

        // 2. Animate overlay opacity
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: FADE_DURATION,
            ease: "power2.inOut",
            onComplete: () => {
              // --- SCREEN IS NOW 100% COVERED ---

              // Swap out the frozen route element for the new route
              activeOutletRef.current = pendingOutletRef.current;
              setDisplayedOutlet(pendingOutletRef.current);

              // Perform scroll-to-top safely behind the black curtain
              if (navigationTypeRef.current === "PUSH") {
                if (smoother) {
                  smoother.scrollTo(0, false);
                } else {
                  window.scrollTo(0, 0);
                }
              }

              // Re-enable smooth scrolling
              if (smoother) {
                smoother.paused(false);
              }

              // Refresh ScrollTrigger calculations for new page dimensions
              requestAnimationFrame(() => {
                const ST = ScrollTrigger || window.ScrollTrigger;
                if (ST) ST.refresh();
              });

              // Start reveal phase
              setPhase("reveal");
            },
          }
        );
      } else if (phase === "reveal") {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 1 },
          {
            opacity: 0,
            duration: FADE_DURATION,
            ease: "power2.inOut",
            onComplete: () => {
              setPhase(null);
            },
          }
        );
      }
    },
    { scope: overlayRef, dependencies: [phase] }
  );

  return (
    <div className="relative min-h-screen">
      <VideoOverlayProvider>
        <div className="font-narrow font-light text-neutral-0">
          <NavBarAlt />
        </div>
        <div id="smooth-wrapper">
          <div id="smooth-content">
            <div className="min-h-screen bg-surface-default pt-1600 pb-1800 font-narrow font-light text-neutral-0">
              {displayedOutlet}
              <Footer />
            </div>
          </div>
        </div>
      </VideoOverlayProvider>

      {/* Hardware-accelerated persistent black curtain */}
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-50 opacity-0"
        style={{
          backgroundColor: overlayColor,
          willChange: "opacity",
          transform: "translateZ(0)",
        }}
      />
    </div>
  );
}