import { motion } from "motion/react";
import { useState } from "react";

const REVEAL_DURATION = 26.153 / 30;
const REVEAL_EASE = [0.8, 0, 0.2, 1];

export default function MastheadVideo({
  src,
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        visibility: loaded ? "visible" : "hidden",
      }}
    >
      <motion.div
        initial={{
          clipPath: "inset(0% 0% 100% 0%)",
        }}
        animate={
          loaded
            ? {
                clipPath: "inset(0% 0% 0% 0%)",
              }
            : {
                clipPath: "inset(0% 0% 100% 0%)",
              }
        }
        transition={{
          duration: REVEAL_DURATION,
          ease: REVEAL_EASE,
        }}
      >
        <motion.video
          src={src}
          className="block w-full h-full object-cover"
          // Crucial attributes for background autoplay
          autoPlay
          loop
          muted
          playsInline
          // Trigger the animation once the first frame is ready
          onLoadedData={() => setLoaded(true)}
          initial={{
            scale: 1.04,
            y: "-1%",
          }}
          animate={
            loaded
              ? {
                  scale: 1,
                  y: "0%",
                }
              : {
                  scale: 1.04,
                  y: "-1%",
                }
          }
          transition={{
            duration: REVEAL_DURATION,
            ease: REVEAL_EASE,
          }}
        />
      </motion.div>
    </div>
  );
}