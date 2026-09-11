// Rebuilt from get_design_context's real reference for the "button"
// component (nodeId 1745:89). Real spec is much bigger than the previous
// approximation: min-width 480px, 64px horizontal padding, 32px text with
// a 112px line-height (that's what vertically centers the label — not
// flex centering with normal line-height), 8px radius. Previous version
// used px-8 py-4 text-sm — roughly a third the real size.
export default function Button({ variant = "primary", children, ...props }) {
  const base =
    "inline-flex min-w-[480px] items-center justify-center gap-2 rounded-md border px-16 font-narrow font-light text-[32px] leading-[112px] uppercase transition-colors";
  const variants = {
    primary: "border-neutral-0 bg-transparent text-neutral-0 hover:bg-neutral-0 hover:text-surface-default",
    solid: "border-surface-primary-default bg-surface-primary-default text-neutral-0 hover:bg-transparent hover:text-surface-primary-default",
  };
  return (
    <button className={`${base} ${variants[variant] ?? variants.primary}`} {...props}>
      {children}
    </button>
  );
}
