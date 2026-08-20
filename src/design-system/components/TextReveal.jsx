import { motion } from "motion/react";

export default function ParagraphReveal({ 
  text, 
  as = "p", 
  className = "", 
  itemProp,
  staggerSpeed = 0.02,
  delay = 0, // Optional delay before the reveal begins (in seconds)
}) {
  const MotionComponent = motion[as] || motion.p;

  // Split into words while preserving normal paragraph flow
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: staggerSpeed, 
        delayChildren: delay, // Delays the start of word-by-word staggering
      },
    },
  };

  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 8,
      filter: "blur(4px)" 
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { 
        duration: 0.4, 
        ease: "easeOut" 
      },
    },
  };

  return (
    <MotionComponent
      itemProp={itemProp}
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-50px" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={wordVariants}
        >
          {word}&nbsp;
        </motion.span>
      ))}
    </MotionComponent>
  );
}