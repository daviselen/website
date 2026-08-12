// From HP-23 "Footer" frame (the visible variant, y=1849 — a hidden
// duplicate draft footer exists in the file too and was skipped).
const cities = ["Los Angeles", "San Diego", "Seattle", "Denver", "Kansas City", "Arlington"];
const social = ["Instagram", "LinkedIn", "YouTube", "Facebook", "X"];

export default function Footer() {
  return (
    <footer className="border-t border-paper/20 px-8 py-16">
      <div className="grid gap-10 md:grid-cols-3">
        <ul className="space-y-2 font-display text-2xl uppercase">
          {cities.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <div className="font-narrow text-sm">
          <a href="mailto:contact@daviselen.com" className="block hover:text-accent-tan">
            contact@daviselen.com
          </a>
          <a href="tel:2136887000" className="mt-2 block hover:text-accent-tan">
            213.688.7000
          </a>
        </div>
        <ul className="space-y-2 font-narrow text-xs uppercase tracking-widest">
          {social.map((s) => (
            <li key={s}>
              <a href="#" className="hover:text-accent-tan">
                {s}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <img
        src="/images/de-logo-white.svg"
        alt="Davis Elen (DE) logo mark"
        className="mt-16 h-20 w-20"
      />
    </footer>
  );
}
