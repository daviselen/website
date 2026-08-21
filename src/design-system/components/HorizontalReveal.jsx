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

  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block w-full pt-[0.0625em] pb-[0.05em]"
        initial={{
          clipPath: clip.initial,
        }}
        whileInView={{
          clipPath: clip.animate,
        }}
        viewport={{
          once: true,
          margin: "-100px",
        }}
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