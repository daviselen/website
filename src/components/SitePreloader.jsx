import { useEffect, useRef, useState } from "react";
import { mediaReady, releaseSite } from "../lib/siteReady.js";
import LoadingWord from "./LoadingWord.jsx";
import IsometricCube, { CUBE_STAGE, FADE_S } from "./IsometricCube.jsx";

const FADE_DURATION = 0.5;
const GUTTER = 32;
// Upper bound, counted from mount, on how long the preloader can hold the
// page. A slow image or font must not keep the site hidden.
const MAX_WAIT_MS = 10000;

// Progress is a critically damped spring chasing a target, so its speed never
// jumps when a milestone lands. The target itself creeps (time constant
// CREEP_S) toward, but never to, the next quarter: CREEP_SHARE of the step.
const SMOOTH_S = 0.4;
const CREEP_S = 4;
const CREEP_SHARE = 0.9;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Loading progress is the share of these that have settled, so each one is a
// quarter: fonts, the window load event, the images in the first view, then any
// video that asked to be waited on (the masthead). decode() settles once pixels
// are ready to paint, not merely when the bytes arrive.
const MILESTONES = [
  () => document.fonts.ready,
  () =>
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise((resolve) =>
          window.addEventListener("load", resolve, { once: true })
        ),
  () =>
    Promise.all(
      [...document.images]
        .filter((img) => {
          const { top, bottom, width } = img.getBoundingClientRect();
          return width > 0 && top < window.innerHeight && bottom > 0;
        })
        .map((img) => img.decode().catch(() => {}))
    ),
  () => mediaReady(),
];

export default function SitePreloader({ onDone }) {
  // `reached` jumps a quarter at a time as milestones settle; `progress` is
  // what's drawn, and eases after it.
  const [reached, setReached] = useState(0);
  const [progress, setProgress] = useState(0);
  // Fit the cube inside a phone-width viewport; desktop keeps it at full size.
  const [scale] = useState(() =>
    Math.min(1, (window.innerWidth - GUTTER) / CUBE_STAGE)
  );
  const [leaving, setLeaving] = useState(false);

  const spring = useRef({ position: 0, velocity: 0 });
  useEffect(() => {
    const since = performance.now();
    let last = since;
    let frame;
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const target =
        reached +
        (CREEP_SHARE / MILESTONES.length) *
          (1 - Math.exp(-(now - since) / 1000 / CREEP_S));
      const state = spring.current;
      const w = 2 / SMOOTH_S;
      const x = state.position - Math.min(1, target);
      const temp = (state.velocity + w * x) * dt;
      state.velocity = (state.velocity - w * temp) * Math.exp(-w * dt);
      state.position = Math.min(1, target) + (x + temp) * Math.exp(-w * dt);
      setProgress(state.position);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reached]);

  useEffect(() => {
    let cancelled = false;
    const deadline = sleep(MAX_WAIT_MS);

    const run = async () => {
      for (let i = 0; i < MILESTONES.length; i += 1) {
        await Promise.race([MILESTONES[i](), deadline]);
        if (cancelled) return;
        setReached((i + 1) / MILESTONES.length);
        // Hold until this step has finished before the next can start.
        await sleep(FADE_S * 1000);
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
      className="fixed inset-0 z-50 flex flex-col items-center overflow-hidden bg-surface-default light:bg-neutral-0 font-narrow text-neutral-0 light:text-neutral-1000 transition-opacity reduced-motion:transition-none"
      style={{
        opacity: leaving ? 0 : 1,
        transitionDuration: `${FADE_DURATION}s`,
      }}
    >
      {/* Centred in the top half of the screen, not the whole of it. */}
      <div className="flex h-1/2 flex-col items-center justify-center gap-300">
        <div style={{ width: CUBE_STAGE * scale, height: CUBE_STAGE * scale }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
            <IsometricCube progress={progress} />
          </div>
        </div>
        <LoadingWord progress={progress} />
      </div>
    </div>
  );
}
