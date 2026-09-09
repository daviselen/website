import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  // Tracks the pending double-rAF used to defer the route swap below; kept
  // in a ref so it can be cancelled if the component unmounts mid-transition.
  const swapRafRef = useRef(null);

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
              // ...as far as GSAP is concerned: `onComplete` fires once the
              // opacity value has been *set*, not once the browser has
              // actually painted that opaque frame. Swapping routes
              // synchronously here races the compositor — on browsers/
              // conditions where the overlay isn't guaranteed its own layer,
              // a heavy synchronous remount (Home mounts an autoplaying
              // video plus several ScrollTrigger-heavy sections) can let an
              // under-covered frame slip through as a visible flicker. Two
              // rAFs guarantee at least one full painted+composited frame
              // of the opaque overlay lands before the old route is torn
              // down. See .zencoder/chats/7e75cef9-7800-4ef6-849d-899ad55bc8b3/investigation.md.
              swapRafRef.current = requestAnimationFrame(() => {
                swapRafRef.current = requestAnimationFrame(() => {
                  swapRafRef.current = null;

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

                  // Refresh ScrollTrigger calculations for new page
                  // dimensions
                  requestAnimationFrame(() => {
                    const ST = ScrollTrigger || window.ScrollTrigger;
                    if (ST) ST.refresh();
                  });

                  // Start reveal phase
                  setPhase("reveal");
                });
              });
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

  // Cancel a pending double-rAF swap on unmount so it never fires against
  // stale refs. NOTE: this can't live inside the useGSAP callback above —
  // `useGSAP` runs it via `gsap.context().add(callback, scope)`, which
  // discards whatever the callback returns, so a `return () => {...}`
  // cleanup there is silently never called.
  useEffect(() => {
    return () => {
      if (swapRafRef.current !== null) {
        cancelAnimationFrame(swapRafRef.current);
        swapRafRef.current = null;
      }
    };
  }, []);

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
          // `translateZ(0)` alone reliably forces a compositor layer in
          // Chromium/WebKit, but Firefox's WebRender compositor promotes
          // layers by its own heuristics and doesn't treat a static
          // transform on a will-change element as a strong enough signal.
          // `backfaceVisibility` + `isolation` give it two more explicit,
          // standards-based hints to composite this overlay independently
          // of the DOM churning underneath during the route swap.
          backfaceVisibility: "hidden",
          isolation: "isolate",
        }}
      />
    </div>
  );
}