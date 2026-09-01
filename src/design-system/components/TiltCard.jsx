import { useRef } from "react";
import { gsap, useGSAP } from "../animation";
import Picture from "./Picture";

// The glare is a radial gradient that follows the cursor. motion built this
// string reactively with useMotionTemplate; GSAP has no template primitive,
// so the string is composed by hand in writeGlare() below and written to
// backgroundImage on each frame of the smoothing tween.
const glareGradient = (xPercent, yPercent) =>
  `radial-gradient(500px circle at ${xPercent}% ${yPercent}%, rgba(255, 255, 255, 0.25), transparent 80%)`;

// motion used useSpring({ stiffness: 300, damping: 30 }). With an implied
// mass of 1 that's a damping ratio of ~0.87 — slightly underdamped, settling
// in roughly half a second with a barely perceptible overshoot. GSAP's
// duration-based eases can't express a spring exactly; this is the closest
// match in feel. If it reads as too stiff or too loose next to the old
// build, this single object is the place to tune it.
const SMOOTHING = { duration: 0.5, ease: "power3.out" };

// Matches Figma's "card" component (nodeId 1918:727, componentSet "card"
// 1918:748, variant Size=Default) — real text styles "card/heading" and
// "det/heading" (64px/56px, weight 395, "Knockout 67 Full Bantamweight" —
// NOT the same Knockout cut as the big page headlines) and "card/body"/
// "det/body" (24px/32px, Ringside Narrow). This one Figma component is
// reused for the Proof stats, News/Awards items, AND the From The Inside
// Out cards (Social Media/Public Relations/DE Culture) — all three
// previously either hand-rolled their own near-identical markup or used
// the wrong Knockout cut/size, so a Figma-side edit to "card" wouldn't
// have had one obvious place in code to apply it.
//
// No gradient overlay on this component's image, on purpose: that
// treatment only applies to cards where the text sits ON TOP of the
// image (the portfolio grid) — these cards have the heading/body BELOW
// the image, a plain photo with no scrim. Added an `overlay` prop here
// briefly on a misreading of a data-only clue (a gradient value in the
// raw JSON that turned out to be Figma's own placeholder-image fill, not
// real art direction) — reverted.
//
// Internal gaps corrected from real data already pulled from a live
// instance of this exact component (get_design_context on 1715:724,
// "PR /SOCA:" group): image→copy gap is 56px, not 32px (gap-8) —
// confirmed by the "DET"/"SOCIAL"/"PR" wrapper divs' real
// `gap-[56px]`, all three matching. Heading→body gap is 32px, not 24px
// (gap-6) — confirmed by the "copy" div's real `gap-[32px]`, also
// matching across all three instances. Neither number had a comment
// tying it to real data before this; both were carried over from an
// earlier guess. Not yet re-verified against the base "card" component
// (1918:727) itself, only against these three instances of it, because
// the Figma MCP tool hit its Starter-plan rate limit mid-audit — flagging
// that explicitly rather than presenting this as fully closed out.
//
// Figma's "card" has a Size variant, and size drives BOTH the image→copy
// outer gap AND the image aspect ratio — they go together:
//   default (large, ≥ half a row: From The Inside Out 2-up) → gap-700, 55/36
//   small  (≤ a third of a row:   Proof / News-Awards 3-up) → gap-400, 6/5
// `aspect` stays available as an optional per-instance override; when omitted
// it follows the size. Written as explicit, fully-spelled-out classes (not a
// template-string class name) because Tailwind's JIT scanner needs the literal
// class text present in a source file — an interpolated `aspect-[${x}]` /
// `gap-[${n}]` wouldn't reliably get picked up.
const aspectClasses = {
    "55/36": "aspect-[55/36]",
    "6/5": "aspect-[6/5]",
  };
  
  const sizeConfig = {
    default: { gap: "gap-700", gapInner: "gap-400", aspect: "55/36" },
    small: { gap: "gap-400", gapInner: "gap-300", aspect: "6/5" },
  };
  
  // schema.org microdata is opt-in via these three props, all undefined by
  // default — Card is shared by three sections whose content maps to three
  // different (or no) schema.org properties, so the mapping can't be
  // hardcoded here without mislabeling one of them:
  //   - Proof's cards are arbitrary marketing stats ("$18 Billion in Retail
  //     Sales") — no schema.org property fits that cleanly, so Proof passes
  //     none of these and gets no microdata at all.
  //   - NewsAwards' cards are real awards — passes headingItemProp="award"
  //     only (Organization.award is a plain Text property, no itemType/
  //     itemScope needed on the card itself).
  //   - FromInsideOut's cards are real photographed examples of client work —
  //     passes itemType="https://schema.org/CreativeWork" plus
  //     headingItemProp="name" and imageItemProp="image".
  export default function TiltCard({
    maxTilt = 8,
    src,
    alt,
    heading,
    body,
    size = "default",
    aspect,
    itemType,
    headingItemProp,
    imageItemProp,
  }) {
    const cfg = sizeConfig[size] ?? sizeConfig.default;
    const aspectKey = aspect ?? cfg.aspect;

    const wrapRef = useRef(null);
    const cardRef = useRef(null);
    const glareRef = useRef(null);

    // Holds the quickTo setters. motion's chain was
    // useMotionValue -> useSpring -> useTransform -> useMotionTemplate: a
    // reactive graph where setting x cascaded through smoothing and mapping
    // on its own. GSAP has no such graph, so the mapping arithmetic moves
    // into the event handlers (below) and quickTo supplies the smoothing.
    // quickTo compiles its tween ONCE and just re-aims it per call, which is
    // what makes it safe to fire from mousemove.
    const setters = useRef(null);

    useGSAP(
      () => {
        // Glare position is smoothed on a plain JS object rather than the
        // element, because the animated thing is two numbers inside a
        // gradient string, not a CSS property GSAP can write directly.
        const glarePos = { x: 50, y: 50 };
        const writeGlare = () => {
          if (!glareRef.current) return;
          glareRef.current.style.backgroundImage = glareGradient(
            glarePos.x,
            glarePos.y
          );
        };

        setters.current = {
          rotateX: gsap.quickTo(cardRef.current, "rotationX", SMOOTHING),
          rotateY: gsap.quickTo(cardRef.current, "rotationY", SMOOTHING),
          opacity: gsap.quickTo(glareRef.current, "opacity", SMOOTHING),
          glareX: gsap.quickTo(glarePos, "x", { ...SMOOTHING, onUpdate: writeGlare }),
          glareY: gsap.quickTo(glarePos, "y", { ...SMOOTHING, onUpdate: writeGlare }),
        };
      },
      { scope: wrapRef, dependencies: [] }
    );

    const handleMouseMove = (e) => {
        if (!setters.current) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Get mouse position relative to card center (-0.5 to 0.5)
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const normX = mouseX / width - 0.5;
        const normY = mouseY / height - 0.5;

        // These four lines are the old useTransform ranges written out:
        // [-0.5, 0.5] -> [maxTilt, -maxTilt] for the tilt (note Y drives
        // rotateX and is inverted), and [-0.5, 0.5] -> [0, 100] for the
        // gradient position.
        setters.current.rotateX(-normY * 2 * maxTilt);
        setters.current.rotateY(normX * 2 * maxTilt);
        setters.current.glareX((normX + 0.5) * 100);
        setters.current.glareY((normY + 0.5) * 100);
        setters.current.opacity(1);
    };

    const handleMouseLeave = () => {
        if (!setters.current) return;

        setters.current.rotateX(0);
        setters.current.rotateY(0);
        // Recentre the gradient as it fades, matching what x/y -> 0 did.
        setters.current.glareX(50);
        setters.current.glareY(50);
        setters.current.opacity(0);
    };

    return (
      <div ref={wrapRef} style={{ perspective: 1000 }}>
        <div
            ref={cardRef}
            className={`flex flex-col ${cfg.gap} relative transform-3d will-change-transform`}
            {...(itemType ? { itemScope: true, itemType } : {})}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            // rotationX/rotationY are written here by quickTo. transformStyle
            // has to stay preserve-3d for the children's translateZ layering
            // to survive GSAP taking over this element's transform.
            style={{ transformStyle: "preserve-3d" }}
        >
            {/* Full-Card Spotlight Layer */}
            <div
              ref={glareRef}
              className="pointer-events-none absolute -inset-4 z-20 rounded-xl mix-blend-soft-light"
              style={{
                backgroundImage: glareGradient(50, 50),
                opacity: 0,
                transform: "translateZ(20px)", // Suspended in 3D space between image and floating text
              }}
            />
            <Picture
            src={src}
            alt={alt}
            className={`${aspectClasses[aspectKey] ?? aspectClasses[cfg.aspect]} w-full rounded-md object-cover`}
            {...(imageItemProp ? { itemProp: imageItemProp } : {})}
            style={{ transform: "translateZ(0px)" }}
            />
            <div className={`flex flex-col ${cfg.gapInner} translate-z-12`}
              style={{ 
                transform: "translateZ(40px)", // 3D displacement distance
                transformStyle: "preserve-3d" 
              }}>
            <h3
                className="font-stat text-3xl uppercase leading-none md:text-5xl lg:text-display-stat drop-shadow-md"
                {...(headingItemProp ? { itemProp: headingItemProp } : {})}
                style={{ transform: "translateZ(10px)" }}
            >
                {heading}
            </h3>
            <p className="font-narrow font-light text-lg leading-relaxed md:text-2xl md:leading-8 drop-shadow-sm">{body}</p>
            </div>
        </div>
      </div>
    );
  }
  