import { useEffect, useState } from "react";
import { REVEAL_DURATION } from "../design-system/animation.js";

const SIZE = 88; // edge; the isometric silhouette is √2 × this ≈ 124px wide
const HALF = SIZE / 2;
// Stage is wider than the cube because the cube's body diagonal is √3 × SIZE:
// the corners would otherwise poke into the copy stacked under it.
export const CUBE_STAGE = Math.round(SIZE * 1.75);

// 45° yaw under a 35.264° tilt is the exact isometric view.
// Also the reduced-motion pose: the cube-spin keyframes start from it.
const CUBE_TRANSFORM = "rotateX(-35.264deg) rotateY(45deg)";

// EASE_REVEAL's curve ("M0,0 C0.8,0 0.2,1 1,1"). A GSAP CustomEase has no CSS
// form, and this has to be CSS: the preloader shows while GSAP is paused.
const EASE_REVEAL_CSS = "cubic-bezier(0.8, 0, 0.2, 1)";

// Five faces are filled; the bottom stays empty, as it's never in view.
// Array order is the reveal order.
const FACES = [
  { transform: `translateZ(${HALF}px)`, fill: "#1e5631" },
  { transform: `rotateY(-90deg) translateZ(${HALF}px)`, fill: "#a4de02" },
  { transform: `rotateX(90deg) translateZ(${HALF}px)`, fill: "#68bb59" },
  { transform: `rotateY(180deg) translateZ(${HALF}px)`, fill: "#acdf87" },
  { transform: `rotateY(90deg) translateZ(${HALF}px)`, fill: "#75b91a" },
  { transform: `rotateX(-90deg) translateZ(${HALF}px)` },
];
export const FILLED_COUNT = FACES.filter((f) => f.fill).length;

// The cube is drawn twice: once filled, once as bare edges on top. All 12
// edges have to read over the colour, and six of them belong to faces that
// are genuinely behind the filled ones — depth sorting would hide those, so
// they can't come from the same pass.
//
// Two separate preserve-3d subtrees is what makes the overlay work: each one
// resolves its own depth sorting internally, then the two composite flat, in
// DOM order. That only holds while the parent is NOT preserve-3d, which is
// also why the view transform sits on each layer instead of on the stage.
function CubeLayer({ wireframe, shown }) {
  const visible = wireframe ? FACES : FACES.filter((f) => f.fill);
  return (
    <div
      className="absolute inset-0 m-auto animate-cube-spin reduced-motion:animate-none"
      style={{
        width: SIZE,
        height: SIZE,
        transform: CUBE_TRANSFORM,
        transformStyle: "preserve-3d",
      }}
    >
      {visible.map(({ transform, fill }, i) =>
        wireframe ? (
          <div
            key={transform}
            className="absolute inset-0 border border-neutral-0 light:border-neutral-1000"
            style={{ transform }}
          />
        ) : (
          // Starts at opacity 0 in the markup, so a face can't flash before
          // its turn.
          <div
            key={transform}
            className="absolute inset-0 transition-opacity reduced-motion:transition-none"
            style={{
              transform,
              backgroundColor: fill,
              opacity: i < shown ? 1 : 0,
              transitionDuration: `${REVEAL_DURATION}s`,
              transitionTimingFunction: EASE_REVEAL_CSS,
            }}
          />
        )
      )}
    </div>
  );
}

// `revealed` is how many coloured faces are lit. Left out, the faces light
// one after another on mount; given, the caller drives it and spaces the
// increases by REVEAL_DURATION so the fades never overlap.
export default function RotatingCube({ revealed }) {
  const [auto, setAuto] = useState(0);

  useEffect(() => {
    if (revealed !== undefined) return undefined;
    const timers = Array.from({ length: FILLED_COUNT }, (_, i) =>
      setTimeout(() => setAuto(i + 1), i * REVEAL_DURATION * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [revealed]);

  const shown = revealed ?? auto;

  return (
    <div className="relative" style={{ width: CUBE_STAGE, height: CUBE_STAGE }}>
      <CubeLayer shown={shown} />
      <CubeLayer wireframe />
    </div>
  );
}
