// Shared shape between JobOpenings.jsx's real ADP-fed rows and Careers.jsx's
// hand-written "Always Looking" rows — same `<li>` border, same
// label-over-value field markup, just fed different data.
//
// Deliberately NOT unifying the two callers' outer link layout (grid vs
// flex, their breakpoint gates, their per-field basis widths): those genuinely
// differ — JobOpenings lays Position/Location out as a 2-column grid at every
// width (they stay side-by-side even on a phone), while Careers' static rows
// fully stack below md and go 3-across at md+. Forcing one shared layout
// would change one of those two behaviors, not just deduplicate markup, so
// `linkClassName` stays a prop each caller supplies its own real classes to.

export function JobRow({ href, linkClassName, external = false, children }) {
  return (
    <li className="border-t-2 border-neutral-0 last:border-b-2">
      <a
        href={href}
        className={linkClassName}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    </li>
  );
}

// The Position field. Its value span carries no `shrink-0` (the meta fields'
// values do) and orders `uppercase` before the size classes rather than
// after — exactly as both call sites already had it typed, twice.
export function JobPositionField({ value, className = "flex flex-col gap-200 px-600" }) {
  return (
    <div className={className}>
      <span className="text-small uppercase text-neutral-400">Position</span>
      <span className="font-narrow text-lg uppercase md:text-xl lg:text-pre-title">{value}</span>
    </div>
  );
}

// A Group/Location-style metadata field: label + shrink-0 value. `valueRef`
// is JobOpenings' width-matching ref callback (see its own comment); Careers'
// static rows pass none.
export function JobMetaField({ label, value, valueRef, className = "flex flex-col gap-200 px-600" }) {
  return (
    <div className={className}>
      <span className="text-small uppercase text-neutral-400">{label}</span>
      <span ref={valueRef} className="shrink-0 font-narrow text-lg uppercase md:text-xl lg:text-pre-title">
        {value}
      </span>
    </div>
  );
}
