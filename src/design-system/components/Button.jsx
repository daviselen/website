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
import { Button } from "@headlessui/react";

export default function StyledButton({ variant = "primary", size = "default", children, ...props }) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-md border font-narrow font-light uppercase transition-colors";
  const variants = {
    primary: "border-neutral-0 bg-transparent text-neutral-0 hover:bg-neutral-0 hover:text-surface-default",
    solid: "border-surface-primary-default bg-surface-primary-default text-neutral-0 hover:bg-primary-300 hover:text-surface-primary-default",
  };
  const sizes = {
    small: "text-display-h6 w-auto px-600 py-200",
    default: "text-md md:leading-1000 px-8 py-4",
    big: "text-lg md:w-auto md:min-w-[480px] md:px-16 md:py-0 md:text-[32px] md:leading-1400 md:leading-[112px] px-8 py-4",
  };
  return (
    <Button className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.default}`} {...props}>
      {children}
    </Button>
  );
}
