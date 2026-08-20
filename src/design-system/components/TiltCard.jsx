import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

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
//   default (large, ≥ half a row: From The Inside Out 2-up) → gap-700, 11/6
//   small  (≤ a third of a row:   Proof / News-Awards 3-up) → gap-400, 6/5
// `aspect` stays available as an optional per-instance override; when omitted
// it follows the size. Written as explicit, fully-spelled-out classes (not a
// template-string class name) because Tailwind's JIT scanner needs the literal
// class text present in a source file — an interpolated `aspect-[${x}]` /
// `gap-[${n}]` wouldn't reliably get picked up.
const aspectClasses = {
    "11/6": "aspect-[11/6]",
    "6/5": "aspect-[6/5]",
  };
  
  const sizeConfig = {
    default: { gap: "gap-700", gapInner: "gap-400", aspect: "11/6" },
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
    maxTilt = 15,
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

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Smooth out the motion values with spring physics
    const smoothX = useSpring(x, { stiffness: 300, damping: 30 });
    const smoothY = useSpring(y, { stiffness: 300, damping: 30 });

    // Map mouse position to tilt rotation degrees based on maxTilt
    const rotateX = useTransform(smoothY, [-0.5, 0.5], [maxTilt, -maxTilt]);
    const rotateY = useTransform(smoothX, [-0.5, 0.5], [-maxTilt, maxTilt]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        
        // Get mouse position relative to card center (-0.5 to 0.5)
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        x.set(mouseX / width - 0.5);
        y.set(mouseY / height - 0.5);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
      <div className="perspective-1000">
        <motion.div
            className={`flex flex-col ${cfg.gap} transform-3d will-change-transform`}
            {...(itemType ? { itemScope: true, itemType } : {})}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
            rotateX,
            rotateY,
            }}
        >
            <img
            src={src}
            alt={alt}
            className={`${aspectClasses[aspectKey] ?? aspectClasses[cfg.aspect]} w-full rounded-md object-cover`}
            {...(imageItemProp ? { itemProp: imageItemProp } : {})}
            />
            <div className={`flex flex-col ${cfg.gapInner} translate-z-12`}>
            <h3
                className="font-stat text-3xl uppercase leading-none md:text-5xl lg:text-display-stat"
                {...(headingItemProp ? { itemProp: headingItemProp } : {})}
            >
                {heading}
            </h3>
            <p className="font-narrow text-lg leading-relaxed md:text-2xl md:leading-8">{body}</p>
            </div>
        </motion.div>
      </div>
    );
  }
  