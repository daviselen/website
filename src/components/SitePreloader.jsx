import { useEffect, useState } from "react";
import { REVEAL_DURATION } from "../design-system/animation.js";
import { mediaReady, releaseSite } from "../lib/siteReady.js";
import RotatingCube, { CUBE_STAGE } from "./RotatingCube.jsx";

const FADE_DURATION = 0.5;
const GUTTER = 32;
// Upper bound, counted from mount, on how long the preloader can hold the
// page. A slow image or font must not keep the site hidden.
const MAX_WAIT_MS = 10000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// One milestone per face, in order: fonts, the window load event, then the
// images in the first view plus any video that asked to be waited on (the
// masthead). decode() settles once pixels are ready to paint, not merely when
// the bytes arrive.
const MILESTONES = [
  () => document.fonts.ready,
  () =>
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) =>
          window.addEventListener("load", resolve, { once: true })
        ),
  () =>
    Promise.all([
      ...[...document.images]
        .filter((img) => {
          const { top, bottom, width } = img.getBoundingClientRect();
          return width > 0 && top < window.innerHeight && bottom > 0;
        })
        .map((img) => img.decode().catch(() => {})),
      mediaReady(),
    ]),
];

export default function SitePreloader({ onDone }) {
  const [revealed, setRevealed] = useState(0);
  // Fit the cube inside a phone-width viewport; desktop keeps it at full size.
  const [scale] = useState(() =>
    Math.min(1, (window.innerWidth - GUTTER) / CUBE_STAGE)
  );
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const deadline = sleep(MAX_WAIT_MS);

    const run = async () => {
      for (const [i, milestone] of MILESTONES.entries()) {
        await Promise.race([milestone(), deadline]);
        if (cancelled) return;
        setRevealed(i + 1);
        // Hold until this face has finished before the next milestone can light.
        await sleep(REVEAL_DURATION * 1000);
        if (cancelled) return;
      }
      setLeaving(true);
      await sleep(FADE_DURATION * 1000);
      if (cancelled) return;
      // Only now does the rest of the site start: every held reveal plays and
      // the masthead video is allowed to embed (see lib/siteReady.js).
      releaseSite();
      onDone();
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [onDone]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-600 overflow-hidden bg-surface-default font-narrow text-neutral-0 transition-opacity motion-reduce:transition-none"
      style={{
        opacity: leaving ? 0 : 1,
        transitionDuration: `${FADE_DURATION}s`,
      }}
    >
      <div style={{ width: CUBE_STAGE * scale, height: CUBE_STAGE * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <RotatingCube revealed={revealed} />
        </div>
      </div>
      <p className="text-xl uppercase tracking-widest">Loading</p>
    </div>
  );
}
