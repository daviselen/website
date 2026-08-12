// From HP-23 "Nav" frame (1856x160). Real x-offsets from the node tree,
// left to right:
//   "INDEPENDENT SINCE 1948"  x=59660  (32px from frame's left edge)
//   "DE" logo                x=60516, width 80  → center = 60556, which
//                              is exactly the frame's horizontal center
//                              (frame x=59628, width 1856 → center 60556)
//   "CLICKS" (About/Careers/Contact)  x=61139..61452 (32px from right edge)
export default function NavBar() {
  return (
    <header className="grid grid-cols-3 items-end px-8 py-6">
      <span className="justify-self-start font-narrow text-xs uppercase tracking-widest text-paper">
        Independent Since 1948
      </span>
      <img
        src="/images/de-logo-white.svg"
        alt="Davis Elen (DE) logo mark"
        className="h-20 w-20 justify-self-center"
      />
      <nav className="flex justify-self-end gap-8 font-narrow text-xs uppercase tracking-widest text-paper">
        <a href="#about" className="hover:text-accent-tan">About</a>
        <a href="#careers" className="hover:text-accent-tan">Careers</a>
        <a href="#contact" className="hover:text-accent-tan">Contact</a>
      </nav>
    </header>
  );
}
