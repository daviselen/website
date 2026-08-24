import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const REVEAL_DURATION = 26.153 / 30;
const REVEAL_EASE = [0.8, 0, 0.2, 1];

export default function HorizontalReveal({
  children,
  className = "",
  direction = "left",
  delay = 0,
}) {
  const clipPaths = {
    left: {
      initial: "inset(0% 100% 0% 0%)",
      animate: "inset(0% 0% 0% 0%)",
    },

    right: {
      initial: "inset(0% 0% 0% 100%)",
      animate: "inset(0% 0% 0% 0%)",
    },
  };

  const clip = clipPaths[direction];

  // Observe the OUTER wrapper, not the inner span. The inner span starts at
  // `clip-path: inset(0% 100% 0% 0%)` (clipped to zero width), and Chromium's
  // IntersectionObserver uses the clipped paint area — a zero-area target
  // never reports "in view", so a reveal gated on its own visibility would
  // deadlock (this is why the first heading in each row never animated). The
  // wrapper has a full layout box (clip-path doesn't shrink it), so it always
  // reports real intersection.
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect(); // once
        }
      },
      { rootMargin: "-100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={wrapRef} className={`block overflow-hidden -my-[0.075em] ${className}`}>
      <motion.span
        className="block w-full py-[0.075em]"
        initial={{ clipPath: clip.initial }}
        animate={{ clipPath: inView ? clip.animate : clip.initial }}
        transition={{
          duration: REVEAL_DURATION,
          delay,
          ease: REVEAL_EASE,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
