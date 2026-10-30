
import { useEffect, useState } from "react";
import { ENTER_S, EASE_REVEAL_CSS } from "./IsometricCube.jsx";

// public/icons/loading.svg, one <path> per letter. The word starts fully
// tracked out, GAP per letter to 239.5px, and tightens to its native 143.5px.
const GAP = 16;
const WIDTH = 143.516;
const SPREAD = GAP * 6;
const LETTERS = [
  "M5.056 21.5688H0V0.256836H1.92V19.6488H5.056V21.5688Z",
  "M28.2344 18.176C28.2344 20.352 26.7944 21.824 25.0664 21.824C23.3384 21.824 21.8984 20.352 21.8984 18.176V3.648C21.8984 1.504 23.3384 0 25.0664 0C26.7944 0 28.2344 1.504 28.2344 3.648V18.176ZM26.3144 18.56V3.264C26.3144 2.56 25.8344 1.952 25.0664 1.952C24.2664 1.952 23.8184 2.56 23.8184 3.264V18.56C23.8184 19.296 24.2664 19.872 25.0664 19.872C25.8344 19.872 26.3144 19.296 26.3144 18.56Z",
  "M51.9841 21.5688H49.9681L49.6481 17.2488H47.5361L47.0881 21.5688H45.3281L47.7281 0.256836H49.7441L51.9841 21.5688ZM49.4881 15.3608L48.7201 5.47284L47.7281 15.3608H49.4881Z",
  "M75.3955 17.3768C75.3955 20.2248 74.5315 21.5688 72.3875 21.5688H69.1875V0.256836H72.3875C74.5315 0.256836 75.3955 1.60084 75.3955 4.44884V17.3768ZM73.4755 17.7608V4.09684C73.4755 2.72083 73.1875 2.20884 72.3875 2.20884H71.1395V19.6168H72.3875C73.1875 19.6168 73.4755 19.1048 73.4755 17.7608Z",
  "M95.0457 21.5688H93.0938V0.256836H95.0457V21.5688Z",
  "M119.564 21.5688H118.124L115.308 10.5608L114.668 7.32883V21.5688H112.844V0.256836H114.732L117.164 11.3928L117.74 14.6888V0.256836H119.564V21.5688Z",
  "M143.516 21.568H142.78L142.172 20.48C141.82 21.344 140.988 21.824 139.964 21.824C138.748 21.824 137.18 20.768 137.18 18.176V3.648C137.18 1.504 138.62 0 140.348 0C142.076 0 143.324 1.504 143.324 3.648V7.36H141.596V3.264C141.596 2.56 141.116 1.952 140.348 1.952C139.548 1.952 139.1 2.56 139.1 3.264V18.56C139.1 19.456 139.484 20.032 140.348 20.032C141.18 20.032 141.596 19.456 141.596 18.56V12.896H140.476V11.168H143.516V21.568Z",
];

// Tightens as `progress` (0 to 1) climbs. The svg is always its widest, and
// the letters collapse toward the middle so the word stays centred.
export default function LoadingWord({ progress }) {
  const [entered, setEntered] = useState(false);

  // A frame later, so the browser has painted the start state to transition from.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <svg
      role="img"
      aria-label="Loading"
      width={WIDTH + SPREAD}
      height="22"
      viewBox={`0 0 ${WIDTH + SPREAD} 22`}
      fill="currentColor"
      className="transition-opacity reduced-motion:transition-none"
      style={{
        opacity: entered ? 1 : 0,
        transitionDuration: `${ENTER_S}s`,
        transitionTimingFunction: EASE_REVEAL_CSS,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {LETTERS.map((d, i) => (
        <path
          key={d}
          d={d}
          style={{
            transform: `translateX(${SPREAD / 2 * progress + i * GAP * (1 - progress)}px)`,
          }}
        />
      ))}
    </svg>
  );
}
