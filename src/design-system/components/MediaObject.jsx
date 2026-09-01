import { Link } from "react-router-dom";
import HeadingReveal from "./HeadingReveal";
import Picture from "./Picture";
import TextReveal from "./TextReveal";

const cardVariants = {
    hidden: { 
      // Inset 100% from the bottom hides the card. 
      // Animating to 0% creates a top-to-bottom reveal.
      clipPath: "inset(0% 0% 100% 0%)",
    },
    visible: {
      clipPath: "inset(0% 0% 0% 0%)",
      transition: {
        duration: 26.153 / 30,
        ease: [0.8, 0, 0.2, 1], // Smooth custom cubic-bezier easing
      },
    },
};
  
// Copy keeps its 5-column measure and the image its 7 columns in both
// arrangements — only the grid lines they sit on swap, so the reversed
// layout is a mirror, not a reflow. Classes are fully spelled out rather
// than built from a template string because Tailwind's JIT scanner only
// sees literal class text in source.
const sideConfig = {
  right: {
    copy: "col-start-1 col-end-6",
    image: "col-start-6 col-end-13",
    // Padding sits on the inner edge, away from the page margin.
    measure: "pr-1000",
  },
  left: {
    copy: "col-start-8 col-end-13 px-400",
    image: "col-start-1 col-end-8",
    measure: "",
  },
};

// Named type tokens only — never a raw step like `text-7xl` (see DESIGN.md
// "Knockout" note). `default` is Headings/H-hi-ai (144/104), `large` is
// Headings/H3 (184/128), the size the standalone section headlines use.
const titleSizes = {
  default: "text-display-hiai",
  large: "text-display-h3 mt-10",
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
  ...rest
}) {
  const side = sideConfig[imageSide] ?? sideConfig.right;
  const heading = titleSizes[titleSize] ?? titleSizes.default;
  const { Root, rootProps } = resolveRoot({ to, href, onClick });
  const isInteractive = Root !== "div";

  return (
    <Root
      {...rootProps}
      {...rest}
      // w-full and text-left undo the shrink-to-fit and centering a
      // <button> gets by default; the grid itself is unchanged.
      className={`grid w-full grid-cols-12 grid-rows-1 gap-400 px-8 pt-3000 text-left ${
        isInteractive
          ? "group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-300"
          : ""
      }`}
    >
      <div className={`${side.copy} row-start-1 flex flex-col gap-600`}>
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
            className="text-pre-title"
            text={text}
          />
        </div>
      </div>
      <Picture
        src={imgSrc}
        alt={imgAlt}
        className={`${side.image} row-start-1 rounded-md ${
            isInteractive ? "hover:ring-2 hover:ring-neutral-800" : ""
        }`}
      />
    </Root>
  );
}