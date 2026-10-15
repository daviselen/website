import { useSyncExternalStore } from "react";
import { gsap } from "../design-system/animation.js";

// The preloader holds back the whole site's motion, not just its own paint.
// Every reveal on the site is a GSAP tween, so pausing the global timeline
// before first render parks all of them at their hidden start state — a tween
// created while it's paused renders its `from` values at once and then waits —
// and releasing it plays them all from the top. That needs no per-component
// wiring. The one thing GSAP can't hold is the video embed, which gates on
// useSiteReady() instead.
//
// Anything that must keep moving while the site is held (the preloader's own
// cube and fade) therefore can't be a GSAP tween; those are CSS transitions.

// Backstop in case the preloader never reports back (it throws, or is
// unmounted mid-run): the site must not stay frozen.
const HARD_LIMIT_MS = 20000;

let ready = false;
const listeners = new Set();

// Media the preloader waits on before it lifts. A component that has to be
// ready to play before the site is shown calls holdForMedia() on mount and the
// function it returns once it is (or unmounts).
const mediaHolds = new Set();

export function holdForMedia() {
  const hold = {};
  mediaHolds.add(hold);
  return () => {
    if (mediaHolds.delete(hold)) listeners.forEach((listener) => listener());
  };
}

export const mediaReady = () =>
  new Promise((resolve) => {
    const check = () => {
      if (mediaHolds.size) return;
      listeners.delete(check);
      resolve();
    };
    listeners.add(check);
    check();
  });

export function holdSite() {
  gsap.globalTimeline.pause();
  setTimeout(releaseSite, HARD_LIMIT_MS);
}

export function releaseSite() {
  if (ready) return;
  ready = true;
  gsap.globalTimeline.resume();
  listeners.forEach((listener) => listener());
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useSiteReady = () =>
  useSyncExternalStore(subscribe, () => ready);
