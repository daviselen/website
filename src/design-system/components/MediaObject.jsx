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
    copy: "col-start-8 col-end-13 pl-400 pr-700",
    image: "col-start-1 col-end-8",
    measure: "",
  },
};

export default function MediaObject({
  imageSide = "right",
  title,
  subhead,
  text,
  imgSrc,
  imgAlt,
}) {
  const side = sideConfig[imageSide] ?? sideConfig.right;

  return (
    <div className="grid grid-cols-12 grid-rows-1 gap-400 px-8">
      <div className={`${side.copy} row-start-1 flex flex-col gap-600`}>
        <h2 className="font-display text-display-hiai uppercase">{title}</h2>
        <div className={`flex flex-col gap-200 ${side.measure}`}>
          {subhead ? (
            <span className="font-narrow text-base">{subhead}</span>
          ) : null}
          <p className="text-pre-title">{text}</p>
        </div>
      </div>
      <img
        src={imgSrc}
        alt={imgAlt}
        className={`${side.image} row-start-1 rounded-md`}
      />
    </div>
  );
}