// Matches Figma's "de-logo" component (nodeId 2003:616 in Nav, 2003:607 in
// Footer — same component, two instances). Previously NavBar and Footer
// each had their own hand-rolled <img> tag pointing at the same file with
// different hardcoded sizes; extracted into one component so there's a
// single place that maps to the one Figma component, sized via a prop
// like the real instances are.
export default function DeLogo({ className = "size-20" }) {
  return (
    <img
      src="/icons/de-logo-white.svg"
      alt="Davis Elen (DE) logo mark"
      className={className}
    />
  );
}
