import TextReveal from "./TextReveal";

// The "masthead -> two-paragraph split" shape About.jsx and Careers.jsx both
// open with — same TextReveal pair, same base type scale, just fed different
// copy. The grid itself (breakpoint gate, gap) and each column's own extra
// classes (padding, col-span/col-start) stay per-caller props rather than
// baked in: About gates at md with no extra padding, Careers gates at lg and
// gives each column its own right padding — genuinely different tuning per
// page, not something to force into one shared value.
export default function SplitIntro({
  gridClassName,
  left,
  right,
  leftClassName = "",
  rightClassName = "",
}) {
  return (
    <div className={gridClassName}>
      <TextReveal className={`text-lg md:text-xl lg:text-pre-title mb-6 ${leftClassName}`} text={left} />
      <TextReveal className={`text-lg md:text-xl lg:text-pre-title mb-6 ${rightClassName}`} text={right} />
    </div>
  );
}
