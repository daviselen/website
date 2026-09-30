import { useRef, useState } from "react";
import { gsap, useGSAP, REVEAL_DURATION, EASE_REVEAL, EASE_OUT } from "../animation";

// The row grows to 800px at Figma's 1856px reference viewport (see
// HumanAI.jsx's px/1856 vw convention) — 800 / 1856 = 43.1034vw. Clamped with
// a floor so the row stays legible below that reference width; 43.1034vw
// alone would shrink to ~160px on a phone.
const EXPANDED_HEIGHT = "clamp(400px, 43.1034vw, 800px)";

/**
 * A single Contact-page office row: name + address at rest, expanding on
 * hover (or tap, on devices without real hover) into a background photo with
 * a bigger, mask-revealed name.
 *
 * The timeline is built once and replayed with play()/reverse() — never
 * rebuilt per interaction — so repeated hovering can't leak GSAP instances.
 * aria-expanded mirrors the animation direction for assistive tech; GSAP
 * stays the only thing driving the actual visuals.
 */
export default function LocationRow({ name, address, image, imageAlt = "" }) {
  const rowRef = useRef(null);
  const labelRef = useRef(null);
  const labelHoverRef = useRef(null);
  const bgRef = useRef(null);
  const tlRef = useRef(null);
  const [expanded, setExpanded] = useState(false);

  useGSAP(
    () => {
      tlRef.current = gsap.timeline({
        paused: true,
        onReverseComplete: () => gsap.set(rowRef.current, { height: "auto" }),
      });

      tlRef.current
        .to(labelRef.current, { opacity: 0, duration: 0.25, ease: EASE_OUT })
        .to(
          rowRef.current,
          { height: EXPANDED_HEIGHT, duration: 0.5, ease: EASE_OUT },
          "<0.1"
        )
        .to(bgRef.current, { opacity: 1, duration: 0.4, ease: EASE_OUT }, "<0.15")
        .fromTo(
          labelHoverRef.current,
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", duration: REVEAL_DURATION, ease: EASE_REVEAL },
          ">"
        );
    },
    { scope: rowRef, dependencies: [] }
  );

  const open = () => {
    setExpanded(true);
    tlRef.current?.play();
  };

  const close = () => {
    setExpanded(false);
    tlRef.current?.reverse();
  };

  // Devices without real hover (touch) don't get mouseenter/mouseleave in any
  // useful sense, so tapping toggles the same timeline instead. Devices with
  // real hover ignore onClick entirely — otherwise a mouse click right after
  // a hover-triggered open would immediately reverse it.
  const hasHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const handleClick = () => {
    if (hasHover) return;
    if (expanded) close();
    else open();
  };

  return (
    <li className="border-t-2 border-neutral-0 last:border-b-2">
      <button
        type="button"
        ref={rowRef}
        aria-expanded={expanded}
        className="relative grid w-full items-center gap-y-400 overflow-hidden px-500 pb-800 pt-600 text-left"
        style={{ gridTemplateColumns: "1fr 33.333%" }}
        onMouseEnter={hasHover ? open : undefined}
        onMouseLeave={hasHover ? close : undefined}
        onFocus={open}
        onBlur={close}
        onClick={handleClick}
      >
        {/*
          Sized to the final expanded height (not the row's own animating
          height) and vertically centered with top-1/2/-translate-y-1/2, so
          growth just un-clips a static, already-centered image via the
          button's overflow-hidden. Tying this to the row's live height
          instead would make `cover` continuously rescale the image every
          frame — it'd zoom as much as it revealed, reading as the image
          sticking to one edge rather than growing from center.
        */}
        <div
          ref={bgRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 bg-cover bg-center opacity-0"
          style={{ backgroundImage: `url(${image})`, height: EXPANDED_HEIGHT }}
          role="img"
          {...(imageAlt ? { "aria-label": imageAlt } : {})}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          />
          {/*
            A square (not circular/elliptical) vignette: the gradient box's
            height matches its own width via aspect-square, then that square
            is centered vertically and let overflow past the row's top/bottom
            edges, so only its middle band — where the "circle" reads as a
            square-ish center-to-edge falloff — is ever visible.
          */}
          <div
            className="absolute left-0 top-1/2 aspect-square w-full -translate-y-1/2"
            style={{
              background:
                "radial-gradient(circle, transparent 0%, rgba(0, 0, 0, 0.8) 100%)",
            }}
          />
        </div>
        <h3 ref={labelRef} className="relative self-end font-display text-display-h5 uppercase">
          {name}
        </h3>
        <span className="relative self-start text-pre-title">{address}</span>
        <span
          ref={labelHoverRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-500 bottom-800 font-display text-display-h2 uppercase"
          style={{
            clipPath: "inset(100% 0 0 0)",
            // clip-path's reference box includes padding, so this bleed —
            // same value HeadingReveal's LINE_BLEED uses — moves the clip
            // boundary past round letterforms' (S, O, G) optical overshoot
            // instead of shaving it at this tight display line-height's
            // exact box edge. Absolutely positioned, so the extra box size
            // doesn't push any other layout around.
            paddingBlock: "0.075em",
          }}
        >
          {name}
        </span>
      </button>
    </li>
  );
}
