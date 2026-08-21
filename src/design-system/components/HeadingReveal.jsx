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

  return (
    <MotionComponent
      itemProp={itemProp}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: false,
        margin: "-100px",
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
        className="block w-full py-[0.015em]"
        style={{
          willChange: "transform, clip-path",
          transform: "translateZ(0)",
        }}
        initial={{
          y: "0.25em",
          clipPath: "inset(100% 0 0 0)",
        }}
        whileInView={{
          y: "0em",
          clipPath: "inset(0 0 0 0)",
        }}
        viewport={{
          once: false,
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