import DeLogo from "../design-system/components/DeLogo.jsx";

// Rebuilt from get_design_context's real reference code for the "Nav"
// component instance (nodeId 1961:180) — not hand-read from raw JSON this
// time. Corrections vs. the previous pass:
//   - Logo is 80x80 (size-20), not 40x40 — a real, visible-size miss.
//   - Alignment is items-end (bottom-aligned), not items-center — the
//     tagline/logo/links have different internal padding, so centering
//     them changes the baseline look.
//   - Link labels are ABOUT / CAREERS / CONTACT — HP-23 had this right;
//     "Archive" in the last pass was a misread off a low-res screenshot.
//   - Each nav-link has asymmetric padding (pt-8 pb-4 px-4) from the real
//     component, not uniform padding.
//   - No border: per direct correction, this doesn't have one — an earlier
//     pass had added a solid 1px #666 (neutral/600) border, which was wrong.
export default function NavBar() {
  return (
    <header className="flex items-end justify-between bg-surface-default px-8 py-6">
      <div className="flex flex-1 items-center py-4">
        <span className="font-narrow text-2xl leading-8 text-neutral-0">
          Independent Since 1948
        </span>
      </div>
      <div className="flex shrink-0 items-center justify-between py-4">
        <DeLogo className="size-20" />
      </div>
      <nav className="flex flex-1 items-center justify-end gap-6">
        <a href="#about" className="px-4 pb-4 pt-8 font-narrow text-2xl leading-8 text-neutral-0 hover:text-primary-300">
          About
        </a>
        <a href="#careers" className="px-4 pb-4 pt-8 font-narrow text-2xl leading-8 text-neutral-0 hover:text-primary-300">
          Careers
        </a>
        <a href="#contact" className="px-4 pb-4 pt-8 font-narrow text-2xl leading-8 text-neutral-0 hover:text-primary-300">
          Contact
        </a>
      </nav>
    </header>
  );
}
