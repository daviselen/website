import { REVEAL_DURATION } from "../design-system/animation.js";

const SIZE = 88; // edge, in px
export const CUBE_STAGE = SIZE * 2; // the hexagon's height; it's narrower

// Slower than the site's reveals: the faces are the preloader's main event.
export const FADE_S = REVEAL_DURATION * 2.25;

// EASE_REVEAL's curve ("M0,0 C0.8,0 0.2,1 1,1"). A GSAP CustomEase has no CSS
// form, and this has to be CSS: the preloader shows while GSAP is paused.
const EASE_REVEAL_CSS = "cubic-bezier(0.8, 0, 0.2, 1)";

// Static isometric view: the near corner and the far corner both project to
// the centre, so the outline is a hexagon and the 12 edges are that hexagon
// plus six spokes. Coordinates are in edge lengths from the centre.
const X = Math.sqrt(3) / 2;
const point = ([x, y]) => `${x * SIZE},${y * SIZE}`;
const polygon = (...corners) => corners.map(point).join(" ");
const CENTRE = [0, 0];
const OUTLINE = [
  [0, -1],
  [X, -0.5],
  [X, 0.5],
  [0, 1],
  [-X, 0.5],
  [-X, -0.5],
];
// The spokes alternate: the near corner's three edges, then the far corner's,
// which are behind the faces.
const NEAR_SPOKES = [OUTLINE[1], OUTLINE[3], OUTLINE[5]];
const FAR_SPOKES = [OUTLINE[0], OUTLINE[2], OUTLINE[4]];
const FAR_EDGE = "#5c5c5c";
const EDGE_WIDTH = 1.5;

function Spokes({ corners, ...props }) {
  return corners.map((corner) => (
    <line
      key={corner}
      x1="0"
      y1="0"
      x2={corner[0] * SIZE}
      y2={corner[1] * SIZE}
      {...props}
    />
  ));
}

// Array order is the reveal order; face i lights at (i + 1) / (FACES.length + 1)
// progress, so 25%, 50%, 75% for three faces.
const FACES = [
  {
    name: "right",
    fill: "#1e5631",
    points: polygon(CENTRE, [X, -0.5], [X, 0.5], [0, 1]),
  },
  {
    name: "left",
    fill: "#a4de02",
    points: polygon(CENTRE, [0, 1], [-X, 0.5], [-X, -0.5]),
  },
  {
    name: "top",
    fill: "#acdf87",
    points: polygon(CENTRE, [-X, -0.5], [0, -1], [X, -0.5]),
  },
];

// `progress` is loading progress, 0 to 1.
export default function IsometricCube({ progress = 0 }) {
  return (
    <svg
      width={CUBE_STAGE}
      height={CUBE_STAGE}
      className="overflow-visible"
      viewBox={`${-CUBE_STAGE / 2} ${-CUBE_STAGE / 2} ${CUBE_STAGE} ${CUBE_STAGE}`}
      aria-hidden="true"
    >
      <g fill="none" strokeWidth={EDGE_WIDTH} stroke={FAR_EDGE}>
        <Spokes corners={FAR_SPOKES} />
      </g>
      {FACES.map(({ name, fill, points }, i) => (
        <polygon
          key={name}
          points={points}
          fill={fill}
          className="transition-opacity motion-reduce:transition-none"
          style={{
            opacity: progress >= (i + 1) / (FACES.length + 1) ? 1 : 0,
            transitionDuration: `${FADE_S}s`,
            transitionTimingFunction: EASE_REVEAL_CSS,
          }}
        />
      ))}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={EDGE_WIDTH}
        className="text-neutral-0 light:text-neutral-1000"
      >
        <polygon points={polygon(...OUTLINE)} />
        <Spokes corners={NEAR_SPOKES} />
      </g>
    </svg>
  );
}
