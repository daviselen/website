// Generic card primitive — not currently used by HP-23's sections (which
// each have bespoke layouts) but kept as a reusable building block for
// future pages/frames built from this design system.
export default function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-lg border border-paper/20 bg-ink p-6 ${className}`}>
      {title && <h3 className="mb-2 font-display text-lg uppercase text-paper">{title}</h3>}
      <div className="font-narrow text-sm text-paper/80">{children}</div>
    </div>
  );
}
