// Matches the CTA style used on the LBST ("START A CONVERSATION") button:
// Ringside Narrow, uppercase, tracked-out, 8px radius (Rectangle 120,
// cornerRadius: 8), dark green fill (#2F5F47) — not black/white as
// originally guessed.
export default function Button({ variant = "primary", children, ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-lg border px-8 py-4 font-narrow text-sm uppercase tracking-widest transition-colors";
  const variants = {
    primary: "border-paper bg-transparent text-paper hover:bg-paper hover:text-ink",
    solid: "border-accent-green bg-accent-green text-paper hover:bg-transparent hover:text-accent-green",
  };
  return (
    <button className={`${base} ${variants[variant] ?? variants.primary}`} {...props}>
      {children}
    </button>
  );
}
