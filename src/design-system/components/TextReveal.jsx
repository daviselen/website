import { motion } from "motion/react";

export default function TextReveal({ text, as = "h2", itemProp, className = "" }) {
  // Dynamically select the motion component (defaults to h2 if not provided)
  const MotionComponent = motion[as] || motion.div;

  // Split the text into individual words
  const lines = text.split("\n");

  // Container variants to stagger the animation of children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  // Child variants for the reveal effect
  const childVariants = {
    hidden: { 
      y: "100%", 
      opacity: 0 
    },
    visible: {
      y: "0%",
      opacity: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.2, 0.65, 0.3, 0.9] 
      },
    },
  };

  return (
    <MotionComponent 
      itemProp={itemProp}
      className={`flex flex-wrap overflow-hidden ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-100px" }}
    >
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className="flex flex-wrap overflow-hidden">
          {line.split(" ").map((word, wordIndex) => (
            <span key={wordIndex} className="overflow-hidden inline-block pb-1 mr-[0.125em]">
              <motion.span 
                className="inline-block" 
                variants={childVariants}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </span>
      ))}
    </MotionComponent>
  );
}