import { motion } from "motion/react";
import { useEffect, useState } from "react";

const REVEAL_DURATION = 26.153 / 30;
const REVEAL_EASE = [0.8, 0, 0.2, 1];

export default function MastheadImage({
  src,
  alt = "",
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const img = new Image();

    img.src = src;

    const load = async () => {
      try {
        // Wait until the browser has decoded the image.
        await img.decode();
      } catch {
        // decode() can reject in some browsers even though
        // the image is usable, so don't block the animation.
      }

      if (!cancelled) {
        setLoaded(true);
      }
    };

    if (img.complete) {
      load();
    } else {
      img.addEventListener("load", load, { once: true });
    }

    return () => {
      cancelled = true;
      img.removeEventListener("load", load);
    };
  }, [src]);

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
        <motion.img
          src={src}
          alt={alt}
          className="block w-full h-full object-cover"
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