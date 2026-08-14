// Rebuilt from get_design_context's real reference for the "Footer" frame
// (nodeId 1715:654). Real spec, several sizes off from the previous pass:
//   - Logo is 192x200 (not 64x64/80x80 like earlier guesses) — via the
//     shared <DeLogo />, the same component NavBar uses.
//   - Border is a full white 2px rule on BOTH top and bottom of the
//     footer block, with 80px padding above / 160px below — not a single
//     top border. The border itself is inset the same 32px as everything
//     else on the page (real "Footer" node has no horizontal padding of
//     its own at all — the inset comes from an ancestor wrapper two
//     levels up in Figma). Padding doesn't move where a border draws
//     (only margin/width do), so this uses `mx-8` instead of `px-8` —
//     using padding here, like the previous pass did, drew the border
//     edge-to-edge across the full viewport while only the content inside
//     it was inset.
//   - Contact info renders uppercase.
//   - Social links are 18px/18px leading (tight, small) — not text-xs
//     tracking-widest.
//   - Cities are 64px Knockout with an unusually loose 130px line-height
//     (a deliberate spaced-out look) and a 48px gap, not space-y-2.
import DeLogo from "../design-system/components/DeLogo.jsx";

const cities = ["Los Angeles", "San Diego", "Seattle", "Denver", "Kansas City", "Arlington"];
const social = ["Instagram", "LinkedIn", "YouTube", "Facebook", "X (Twitter)"];

export default function Footer() {
  return (
    <footer className="border-y-2 border-neutral-0 mx-8 py-20 pb-40">
      <div className="flex flex-col gap-16 md:flex-row md:justify-between">
        <div className="flex flex-1 flex-col gap-12">
          <DeLogo className="h-[200px] w-[192px]" />
          <div className="flex flex-col gap-6 font-narrow text-2xl uppercase leading-8">
            <a href="mailto:contact@daviselen.com" className="hover:text-primary-300">
              contact@daviselen.com
            </a>
            <a href="tel:2136887000" className="hover:text-primary-300">
              213.688.7000
            </a>
          </div>
          <ul className="flex flex-col gap-6">
            {social.map((s) => (
              <li key={s}>
                <a href="#" className="font-narrow text-link-social uppercase hover:text-primary-300">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <ul className="flex flex-1 flex-col gap-12 font-display text-4xl uppercase leading-[130px] md:text-[64px]">
          {cities.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
