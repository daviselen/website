import { useRef } from "react";
import { gsap, useGSAP } from "../animation";

// Ported from Codrops' Rapid Image Hover Menu (menuItem.js): a per-frame lerp
// toward the cursor, with tilt and brightness driven by horizontal speed.
const LERP = 0.08;
const MAX_DISTANCE = 100;
const MAX_ROTATION = 60;
const MAX_BRIGHTNESS = 4;
const MASK_DURATION = 0.2;
const MASK_EASE = "sine.out";
const SUB_DURATION = 0.3;
const SUB_OFFSET = "-1rem";

const { clamp, mapRange, interpolate } = gsap.utils;

function canAnimate() {
  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export default function LocationRow({ name, address, phone, image }) {
  const itemRef = useRef(null);
  const rowRef = useRef(null);
  const revealRef = useRef(null);
  const innerRef = useRef(null);
  const imageRef = useRef(null);
  const phoneRef = useRef(null);
  const tickRef = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const motion = useRef({
    prevX: 0,
    dirX: 1,
    tx: 0,
    ty: 0,
    rotation: 0,
    brightness: 1,
  });
  const animated = canAnimate();

  const centerOnPointer = () => {
    const row = rowRef.current.getBoundingClientRect();
    const reveal = revealRef.current;
    return {
      x: pointer.current.x - row.left - reveal.offsetWidth / 2,
      y: pointer.current.y - row.top - reveal.offsetHeight / 2,
    };
  };

  useGSAP(
    () => {
      if (!animated) return;

      if (phoneRef.current) gsap.set(phoneRef.current, { opacity: 0, x: SUB_OFFSET });

      const tick = () => {
        const m = motion.current;
        const dx = pointer.current.x - m.prevX;
        const distance = clamp(0, MAX_DISTANCE, Math.abs(dx));
        if (dx !== 0) m.dirX = Math.sign(dx);
        m.prevX = pointer.current.x;

        const target = centerOnPointer();
        const rotation = mapRange(0, MAX_DISTANCE, 0, m.dirX * MAX_ROTATION, distance);
        const brightness = mapRange(0, MAX_DISTANCE, 1, MAX_BRIGHTNESS, distance);

        m.tx = interpolate(m.tx, target.x, LERP);
        m.ty = interpolate(m.ty, target.y, LERP);
        m.rotation = interpolate(m.rotation, rotation, LERP);
        m.brightness = interpolate(m.brightness, brightness, LERP);

        gsap.set(revealRef.current, {
          x: m.tx,
          y: m.ty,
          rotation: m.rotation,
          filter: `brightness(${m.brightness})`,
        });
      };
      tickRef.current = tick;

      return () => gsap.ticker.remove(tick);
    },
    { scope: rowRef, dependencies: [animated] }
  );

  const handleEnter = (e) => {
    const m = motion.current;
    if (e.movementX) m.dirX = Math.sign(e.movementX);
    pointer.current = { x: e.clientX, y: e.clientY };

    // Snap (no lerp) on entry so the image appears under the cursor instead
    // of gliding in from wherever it was left on the last hover.
    const start = centerOnPointer();
    Object.assign(m, { prevX: e.clientX, tx: start.x, ty: start.y, rotation: 0, brightness: 1 });

    gsap.killTweensOf([innerRef.current, imageRef.current]);
    gsap.set(revealRef.current, {
      x: m.tx,
      y: m.ty,
      rotation: 0,
      filter: "brightness(1)",
      opacity: 1,
    });
    // Above the row it just left (still z 1 while its image masks out), so
    // the incoming image is never covered by an adjacent row.
    gsap.set(itemRef.current, { zIndex: 2 });

    const from = m.dirX > 0 ? -100 : 100;
    gsap.fromTo(innerRef.current, { xPercent: from }, { xPercent: 0, duration: MASK_DURATION, ease: MASK_EASE });
    gsap.fromTo(imageRef.current, { xPercent: -from }, { xPercent: 0, duration: MASK_DURATION, ease: MASK_EASE });
    if (phoneRef.current) gsap.to(phoneRef.current, { opacity: 1, x: 0, duration: SUB_DURATION, ease: "power1.out", overwrite: true });

    gsap.ticker.remove(tickRef.current);
    gsap.ticker.add(tickRef.current);
  };

  const handleLeave = (e) => {
    const m = motion.current;
    if (e.movementX) m.dirX = Math.sign(e.movementX);
    gsap.ticker.remove(tickRef.current);

    gsap.killTweensOf([innerRef.current, imageRef.current]);
    gsap.set(itemRef.current, { zIndex: 1 });

    const to = m.dirX > 0 ? 100 : -100;
    gsap.to(innerRef.current, { xPercent: to, duration: MASK_DURATION, ease: MASK_EASE });
    gsap.to(imageRef.current, {
      xPercent: -to,
      duration: MASK_DURATION,
      ease: MASK_EASE,
      onComplete: () => {
        gsap.set(revealRef.current, { opacity: 0 });
        gsap.set(itemRef.current, { zIndex: "auto" });
      },
    });
    if (phoneRef.current) gsap.to(phoneRef.current, { opacity: 0, x: SUB_OFFSET, duration: SUB_DURATION, ease: "power1.out", overwrite: true });
  };

  const handleMove = (e) => {
    pointer.current = { x: e.clientX, y: e.clientY };
  };

  // Keyboard-only path: no pointer position to chase, so the image is just
  // centered in the row rather than snapped to a cursor. This is what lets a
  // sighted user tabbing without a mouse — and VoiceOver/NVDA users, since
  // the address itself is never visibility-hidden (see the opacity note
  // above) — reach the same content a mouse hover reveals.
  const handleFocus = () => {
    const m = motion.current;
    const row = rowRef.current.getBoundingClientRect();
    const reveal = revealRef.current;
    const center = {
      x: row.width / 2 - reveal.offsetWidth / 2,
      y: row.height / 2 - reveal.offsetHeight / 2,
    };
    Object.assign(m, { tx: center.x, ty: center.y, rotation: 0, brightness: 1 });

    gsap.killTweensOf([innerRef.current, imageRef.current]);
    gsap.set(revealRef.current, {
      x: center.x,
      y: center.y,
      rotation: 0,
      filter: "brightness(1)",
      opacity: 1,
    });
    gsap.set(itemRef.current, { zIndex: 2 });

    gsap.fromTo(innerRef.current, { xPercent: -100 }, { xPercent: 0, duration: MASK_DURATION, ease: MASK_EASE });
    gsap.fromTo(imageRef.current, { xPercent: 100 }, { xPercent: 0, duration: MASK_DURATION, ease: MASK_EASE });
    if (phoneRef.current) gsap.to(phoneRef.current, { opacity: 1, x: 0, duration: SUB_DURATION, ease: "power1.out", overwrite: true });
  };

  const handleBlur = () => {
    gsap.killTweensOf([innerRef.current, imageRef.current]);
    gsap.set(itemRef.current, { zIndex: 1 });

    gsap.to(innerRef.current, { xPercent: -100, duration: MASK_DURATION, ease: MASK_EASE });
    gsap.to(imageRef.current, {
      xPercent: 100,
      duration: MASK_DURATION,
      ease: MASK_EASE,
      onComplete: () => {
        gsap.set(revealRef.current, { opacity: 0 });
        gsap.set(itemRef.current, { zIndex: "auto" });
      },
    });
    if (phoneRef.current) gsap.to(phoneRef.current, { opacity: 0, x: SUB_OFFSET, duration: SUB_DURATION, ease: "power1.out", overwrite: true });
  };

  return (
    <li ref={itemRef} className="relative border-t-2 border-neutral-0 last:border-b-2">
      <button
        type="button"
        ref={rowRef}
        className="group relative isolate grid w-full cursor-default items-center gap-y-400 px-500 pb-800 pt-600 text-left"
        style={{ gridTemplateColumns: "1fr 33.333%" }}
        onMouseEnter={animated ? handleEnter : undefined}
        onMouseLeave={animated ? handleLeave : undefined}
        onMouseMove={animated ? handleMove : undefined}
        onFocus={animated ? handleFocus : undefined}
        onBlur={animated ? handleBlur : undefined}
      >
        <div
          ref={revealRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 -z-10 h-80 w-60 opacity-0"
        >
          <div ref={innerRef} className="size-full overflow-hidden">
            <div
              ref={imageRef}
              className="size-full bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            />
          </div>
        </div>
        <h3 className="self-end font-display text-display-h5 uppercase transition-colors duration-300 group-hover:text-primary-300 group-focus:text-primary-300">
          {name}
        </h3>
        <span ref={addressRef} className="self-start text-pre-title">
          {address}
        </span>
      </button>
    </li>
  );
}
