import { motion } from "motion/react";

const REVEAL_DURATION = 26.153 / 30;
const LINE_DELAY = 3.847 / 30;
const REVEAL_EASE = [0.8, 0, 0.2, 1];

export default function HeadingReveal({
  text,
  as = "h2",
  itemProp,
  className = "",
}) {
  const MotionComponent = motion[as] || motion.div;
  const lines = text.split("\n");

  // Parent controls the unified Y-translation for the ENTIRE block
  const parentVariants = {
    hidden: { 
      y: "0.25em" 
    },
    visible: {
      y: "0em",
      transition: {
        duration: REVEAL_DURATION,
        ease: REVEAL_EASE,
      },
    },
  };

  return (
    <MotionComponent
      itemProp={itemProp}
      className={className}
      variants={parentVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: false,
        margin: "0px 0px -100px 0px",
      }}
    >
      {lines.map((line, index) => (
        <RevealLine
          key={index}
          delay={index * LINE_DELAY}
        >
          {line}
        </RevealLine>
      ))}
    </MotionComponent>
  );
}

function RevealLine({ children, delay }) {
  // Child lines control ONLY their individual staggered clipPath masks
  const lineVariants = {
    hidden: {
      clipPath: "inset(100% 0 0 0)",
    },
    visible: {
      clipPath: "inset(0% 0 0 0)",
      transition: {
        duration: REVEAL_DURATION,
        delay: delay,
        ease: REVEAL_EASE,
      },
    },
  };

  return (
    <span
      className="relative block"
      style={{
        overflow: "hidden",
        padding: "0.0333333em 0",
        margin: "-0.0333333em 0",
      }}
    >
      <motion.span
        className="block w-full pt-[0.0125em] pb-[0.02em]"
        style={{
          willChange: "clip-path",
          transform: "translateZ(0)",
        }}
        variants={lineVariants}
      >
        {children}
      </motion.span>
    </span>
  );
}