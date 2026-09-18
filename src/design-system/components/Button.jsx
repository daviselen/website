// Rebuilt from get_design_context's real reference for the "button"
// component (nodeId 1745:89). Real spec is much bigger than the previous
// approximation: min-width 480px, 64px horizontal padding, 32px text with
// a 112px line-height (that's what vertically centers the label — not
// flex centering with normal line-height), 8px radius. Previous version
// used px-8 py-4 text-sm — roughly a third the real size.
//
// Real spec is desktop-only, and min-w-[480px] alone overflows a phone
// viewport (375px). Mobile-first here, same pattern Masthead.jsx/Card.jsx
// use elsewhere: a plain flex-centered small size below `md`, full real
// spec (min-width, padding, line-height-as-centering) at `md` and up.
export default function StyledButton({ variant = "primary", size = "default", children, ...props }) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-md border px-8 py-4 font-narrow font-light text-lg uppercase transition-colors md:w-auto md:min-w-[480px] md:px-16 md:py-0 md:text-[32px] md:leading-[112px]";
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
