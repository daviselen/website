import { useRef } from "react";
import { Link } from "react-router-dom";
import { gsap, useGSAP, REVEAL_DURATION, EASE_REVEAL } from "../animation";
import HeadingReveal from "./HeadingReveal";
import Picture from "./Picture";
import TextReveal from "./TextReveal";

// Inset 100% from the bottom hides the image; animating that back to 0%
// wipes it in from the top down. Same pair MastheadImage and MastheadVideo
// use — this is the site's one image-reveal shape, only the trigger differs
// (those are decode-gated, this one is scroll-gated).
const IMAGE_HIDDEN = "inset(0% 0% 100% 0%)";
const IMAGE_VISIBLE = "inset(0% 0% 0% 0%)";

// Copy keeps its 5-column measure and the image its 7 columns in both
// arrangements — only the grid lines they sit on swap, so the reversed
// layout is a mirror, not a reflow. Classes are fully spelled out rather
// than built from a template string because Tailwind's JIT scanner only
// sees literal class text in source.
//
// The 12-col split is real spec at desktop, but it was applying at every
// width — on a phone, "5 of 12 columns" is a ~150px-wide copy column with
// every word wrapping. `md:` gates the whole grid split; below that the
// grid falls back to its own `grid-cols-1` (set on the root below) and
// these two blocks just stack in DOM order.
const sideConfig = {
  right: {
    copy: "md:col-start-1 md:col-end-6",
    image: "md:col-start-6 md:col-end-13",
    // Padding sits on the inner edge, away from the page margin.
    measure: "md:pr-1000",
  },
  left: {
    copy: "md:col-start-8 md:col-end-13 px-400 justify-center",
    image: "md:col-start-1 md:col-end-8",
    measure: "",
  },
};

// `default` is Headings/H-hi-ai (80/64 — see the display-hiai token, whose
// own comment corrects the 144/104 this comment used to claim), `large` is
// Headings/H3 (144/104), the size the standalone section headlines use.
// Both were the bare desktop token with no mobile/tablet step — same
// pattern as every other big headline on the site (Masthead.jsx,
// HumanAI.jsx): small mobile default, real size at `lg`.
const titleSizes = {
  default: "text-4xl md:text-6xl lg:text-display-hiai",
  large: "text-5xl md:text-7xl lg:text-display-h3",
};

// The root element is chosen by which prop is passed, so the whole media
// object becomes one hit target without ever being a div with an onClick —
// that pattern loses keyboard focus, Enter/Space, and the screen-reader
// role, and jsx-a11y (on as an error in eslint.config.js) rejects it.
//   to      -> react-router Link, for in-app routes (/about) — keeps the
//              SPA navigation the router in main.jsx sets up
//   href    -> plain <a>, for off-site, mailto:, tel:, and #hash targets
//              that must not go through the router
//   onClick -> <button type="button">, for openers that don't navigate
//              (modal, video, filter). type is explicit so it can never
//              submit a surrounding form.
//   none    -> <div>, unchanged non-interactive default
// Precedence is to > href > onClick; onClick still fires when passed
// alongside to/href, since a link can also want a side effect.
//
// Note that being interactive says nothing about WHAT the click does — both
// /about media objects pass an onClick, but one opens a video in the overlay
// and the other opens the retail map in it. That's why the play badge is
// gated on the explicit `opensVideo` prop rather than on interactivity: the
// callback is an opaque closure and the component cannot introspect it.
function resolveRoot({ to, href, onClick }) {
  if (to) return { Root: Link, rootProps: { to, onClick } };
  if (href) return { Root: "a", rootProps: { href, onClick } };
  if (onClick) return { Root: "button", rootProps: { type: "button", onClick } };
  return { Root: "div", rootProps: {} };
}

export default function MediaObject({
  imageSide = "right",
  titleSize = "default",
  title,
  subhead,
  text,
  imgSrc,
  imgAlt,
  to,
  href,
  onClick,
  opensVideo = false,
  ...rest
}) {
  const side = sideConfig[imageSide] ?? sideConfig.right;
  const heading = titleSizes[titleSize] ?? titleSizes.default;
  const { Root, rootProps } = resolveRoot({ to, href, onClick });
  const isInteractive = Root !== "div";
  const maskRef = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        maskRef.current,
        { clipPath: IMAGE_HIDDEN },
        {
          clipPath: IMAGE_VISIBLE,
          duration: REVEAL_DURATION,
          ease: EASE_REVEAL,
          scrollTrigger: {
            // The mask itself is the trigger: clip-path doesn't shrink
            // layout bounds, so ScrollTrigger still measures the full box
            // even while the image is clipped to zero height.
            trigger: maskRef.current,
            // Same window as the HeadingReveal in the copy column above, so
            // the two halves of the media object wipe in together.
            start: "top bottom-=100",
            end: "bottom top",
            // NOT `once: true`. ScrollTrigger takes its first measurement
            // before the page has its real height (see the refresh note in
            // animation.js), and a `once` trigger kills itself the instant
            // it fires — so a fire against that early measurement is
            // permanent. Measured on /about: the wipe ran at scrollY 0 with
            // the image still 1494px down the page, i.e. it played to
            // completion where nobody could see it, and the ScrollTrigger
            // refresh that follows had nothing left to correct. A
            // play/reverse toggle survives that: the refresh re-evaluates
            // the real position, reverses the image back to hidden, and it
            // replays on the way in.
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: maskRef }
  );

  return (
    <Root
      {...rootProps}
      {...rest}
      // w-full and text-left undo the shrink-to-fit and centering a
      // <button> gets by default; the 12-col grid itself is unchanged at
      // md+. Below that: a single column, so copy and image just stack in
      // DOM order — `grid-rows-1` + `row-start-1` on both children would
      // otherwise force them into the same cell instead of stacking, and
      // `pt-3000` (240px) was fixed at every width, not just desktop.
      className={`grid w-full grid-cols-1 gap-400 px-8 pt-1000 text-left md:grid-cols-12 md:grid-rows-1 md:pt-3000 ${
        isInteractive
          ? "group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-300"
          : ""
      }`}
    >
      <div className={`${side.copy} md:row-start-1 flex flex-col gap-600`}>
        <HeadingReveal
          as="h2"
          // These titles are sentences ("$18 Billion in Sales from Over 4000
          // Locations."), not hand-broken display type, so their line breaks
          // come from the 5-column measure at render time.
          splitLines
          text={title}
          className={`font-display uppercase ${heading} ${
            isInteractive ? "transition-colors group-hover:text-neutral-100" : ""
          }`}
        />
        <div className={`flex flex-col gap-200 ${side.measure}`}>
          {subhead ? (
            <span className="font-narrow text-base">{subhead}</span>
          ) : null}
          <TextReveal
            as="p"
            className="text-lg md:text-xl lg:text-pre-title"
            text={text}
          />
        </div>
      </div>
      {/* The grid placement moves onto this mask wrapper so the clipped box
          is the same box the image used to occupy; the image fills it, so
          the layout is unchanged. Inline clip-path (not a class) so the
          hidden state is right on first paint, before GSAP runs. */}
      <div
        ref={maskRef}
        className={`${side.image} md:row-start-1 relative`}
        style={{ clipPath: IMAGE_HIDDEN }}
      >
        <Picture
          src={imgSrc}
          alt={imgAlt}
          // ring-inset, added with the mask: the wrapper's clip-path stays
          // parked at inset(0%) once the wipe has played, and inset(0%)
          // clips to the border box — an outside ring is drawn beyond that
          // box, so it would be invisible on exactly the interactive cards
          // it exists for. Drawn inside, it survives the clip.
          className={`block size-full rounded-md ${
            isInteractive ? "hover:ring-2 hover:ring-inset hover:ring-neutral-800" : ""
          }`}
        />
        {/* Decorative: alt="" keeps it out of the accessibility tree because
            the badge duplicates what the copy already says (the origin-story
            object carries a "Runtime 15:50" subhead), and the root is already
            announced as a button. */}
        {opensVideo && (
          <img
            src="/icons/play.svg"
            alt=""
            className="absolute left-400 top-400"
          />
        )}
      </div>
    </Root>
  );
}