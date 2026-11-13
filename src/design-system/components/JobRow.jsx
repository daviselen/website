// Shared shape between JobOpenings.jsx's real ADP-fed rows and Careers.jsx's
// hand-written "Always Looking" rows — same `<li>` border, same
// label-over-value field markup, just fed different data.
//
// The row's link layout lives here so both lists stay identical: one column
// below md, Position / Group / Location across from md.

import posthog, { isPostHogConfigured } from "../../lib/posthog.js";

const ROW_LAYOUT =
  "grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-baseline py-200 lg:pt-600 lg:pb-800 hover:text-primary-300 light:hover:text-primary-800 transition-colors gap-y-200 lg:gap-y-400";

export function JobRow({ href, external = false, children }) {
  const handleClick = () => {
    if (isPostHogConfigured) {
      posthog.capture("job_application_started", {
        application_type: external ? "external" : "contact_form",
      });
    }
  };

  return (
    <li className="border-t-2 border-neutral-0 light:border-neutral-1000 last:border-b-2">
      <a
        href={href}
        className={ROW_LAYOUT}
        onClick={handleClick}
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
export function JobPositionField({ value, className = "flex flex-col gap-100 lg:gap-200 px-0 sm:px-200 md:px-400 lg:px-600" }) {
  return (
    <div className={className}>
      <span className="text-small uppercase text-neutral-400 light:text-neutral-600">Position</span>
      <span className="font-narrow text-xl uppercase md:text-xl lg:text-pre-title">{value}</span>
    </div>
  );
}

// A Group/Location-style metadata field: label + shrink-0 value. `valueRef`
// is JobOpenings' width-matching ref callback (see its own comment); Careers'
// static rows pass none.
export function JobMetaField({ label, value, valueRef, className = "flex flex-col gap-100 lg:gap-200 px-0 sm:px-200 md:px-400 lg:px-600" }) {
  return (
    <div className={className}>
      <span className="text-small uppercase text-neutral-400 light:text-neutral-600">{label}</span>
      <span ref={valueRef} className="shrink-0 font-narrow text-xl uppercase md:text-xl lg:text-pre-title">
        {value}
      </span>
    </div>
  );
}
