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
import { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import DeLogo from "../design-system/components/DeLogo.jsx";
import ThemeToggle from "../design-system/components/ThemeToggle.jsx";
import MotionToggle from "../design-system/components/MotionToggle.jsx";
import {
  gsap,
  useGSAP,
  REVEAL_DURATION,
  LINE_DELAY,
  EASE_REVEAL,
  toggleActions,
} from "../design-system/animation.js";

const cities = [
  "Los Angeles",
  "San Diego",
  "Seattle",
  "Denver",
  "Kansas City",
  "Arlington",
];
// Real URLs, direct from the person who added them as Link values on these
// text layers in Figma — not a get_design_context pull (Figma was
// rate-limited when this was needed), so noting that distinction per
// FIGMA_WORKFLOW.md #10 rather than presenting it with tool-verified
// confidence.
const footerNav = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Careers", to: "/careers" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy-policy" },
];
// Same type as the social links below.
const navLinkClass =
  "font-narrow text-link-social font-light uppercase hover:text-primary-300 light:hover:text-primary-800";
const social = [
  { label: "Instagram", href: "https://www.instagram.com/daviselen" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/daviselen" },
  { label: "YouTube", href: "https://www.youtube.com/@daviselenadvertising" },
  { label: "Facebook", href: "https://www.facebook.com/daviselen" },
  { label: "X (Twitter)", href: "https://x.com/daviselen" },
];

// motion's `custom={index}` fed a variant FUNCTION, which returned a
// per-element delay. GSAP has no custom-prop mechanism, so the index comes
// from the element's position in the queried array instead — same
// `index * LINE_DELAY` arithmetic, sourced from the DOM rather than a prop.
//
// Deliberately NOT a stagger: every block below carries its own
// ScrollTrigger, exactly as each motion element carried its own
// whileInView. These blocks sit in a tall column and scroll into view at
// genuinely different times — a single parent-driven stagger would fire
// them all off one trigger and change the behaviour.
const REVEAL_START = "top bottom-=100"; // viewport margin "0px 0px -100px 0px"
const REVEAL_END = "bottom top"; // no top inset, so the real viewport top

export default function Footer() {
  const footerRef = useRef(null);
  const { pathname } = useLocation();

  useGSAP(
    () => {
      gsap.utils.toArray("[data-left-reveal]").forEach((el, index) => {
        gsap.fromTo(
          el,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: REVEAL_DURATION,
            delay: index * LINE_DELAY,
            ease: EASE_REVEAL,
            scrollTrigger: {
              trigger: el,
              start: REVEAL_START,
              end: REVEAL_END,
              toggleActions: toggleActions("play reverse play reverse"),
            },
          },
        );
      });

      gsap.utils.toArray("[data-city-reveal]").forEach((el, index) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: "-0.25em" },
          {
            opacity: 1,
            y: "0em",
            duration: REVEAL_DURATION,
            delay: index * LINE_DELAY,
            ease: EASE_REVEAL,
            scrollTrigger: {
              trigger: el,
              start: REVEAL_START,
              end: REVEAL_END,
              toggleActions: toggleActions("play reverse play reverse"),
            },
          },
        );
      });
    },
    { scope: footerRef },
  );

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="mx-2 border-b-2 border-neutral-0 light:border-neutral-1000 lg:mx-8"
    >
      {/* Two equal columns with the same gap as the content row below, so
          column 2 starts exactly at the left edge of the cities list. The nav
          sits in column 1 until 1440px, then moves into column 2 (shortcut:
          1440 is an arbitrary variant — no matching named breakpoint). Back
          to top always sits at the far right of column 2. */}
      <div className="grid grid-cols-1 items-center gap-4 border-b-2 border-neutral-0 light:border-neutral-1000 py-6 md:grid-cols-2 md:gap-800 lg:gap-16">
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-4 gap-y-2 md:col-start-1 md:row-start-1 md:gap-x-8 min-[1440px]:col-start-2"
        >
          {footerNav.map((n) =>
            n.to === pathname ? (
              <span
                key={n.to}
                aria-current="page"
                className="cursor-default font-narrow text-link-social font-light uppercase opacity-50 light:opacity-60"
              >
                {n.label}
              </span>
            ) : (
              <Link key={n.to} to={n.to} className={navLinkClass}>
                {n.label}
              </Link>
            ),
          )}
        </nav>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`${navLinkClass} justify-self-end whitespace-nowrap md:col-start-2 md:row-start-1`}
        >
          Back to top
        </button>
      </div>
      <div className="flex flex-col gap-800 py-800 pb-1000 md:flex-row md:justify-between md:pb-400 lg:gap-16 lg:py-20 lg:pb-400">
        <div className="flex flex-1 flex-col gap-12 md:pb-600 lg:pb-1600">
          {/* data-left-reveal index 0 — document order supplies what
              custom={0} used to. */}
          <div
            data-left-reveal=""
            style={{
              clipPath: "inset(0 0 100% 0)",
              willChange: "clip-path",
              transform: "translateZ(0)",
            }}
          >
            {/* itemProp="logo" only on this instance, not NavBar's — same
              component, two DOM instances; marking both would give the
              Organization item two `logo` values, which is valid but
              redundant, so this picks one (Footer's, since this is also
              where the rest of the contact-block microdata lives). */}
            <DeLogo className="h-1000 xl:h-[200px] xl:w-2400" itemProp="logo" />
          </div>

          <div
            data-left-reveal=""
            style={{
              clipPath: "inset(0 0 100% 0)",
              willChange: "clip-path",
              transform: "translateZ(0)",
            }}
          >
            <div className="flex flex-col gap-4 font-narrow text-2xl font-light uppercase leading-8 lg:gap-6 py-[0.075em]">
              <a
                href="mailto:contact@daviselen.com"
                itemProp="email"
                className="hover:text-primary-300 light:hover:text-primary-800 transition-colors duration-300"
              >
                contact@daviselen.com
              </a>
              <a
                href="tel:2136887000"
                itemProp="telephone"
                className="hover:text-primary-300 light:hover:text-primary-800 transition-colors duration-300"
              >
                213.688.7000
              </a>
            </div>
          </div>

          <div
            className="relative overflow-hidden"
            style={{
              padding: "0.0333333em 0",
              margin: "-0.0333333em 0",
            }}
          >
            <div data-left-reveal="" style={{ clipPath: "inset(0 0 100% 0)" }}>
              {/* itemProp="sameAs" now that these are real profile URLs, not
              placeholder "#"s — sameAs is exactly "the same entity is also
              at this other URL," which wasn't true before. target=_blank +
              rel="noopener noreferrer" added alongside since these now
              genuinely navigate off-site (not needed for a "#" stub). */}
              <ul className="flex flex-col gap-4 lg:gap-6">
                {social.map((s, i) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      itemProp="sameAs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-narrow text-link-social font-light uppercase hover:text-primary-300 light:hover:text-primary-800"
                    >
                      <span
                        style={{
                          display: "block",
                          padding: "0.075em 0",
                          margin: "-0.075em 0",
                          ...(i === social.length - 1 && {
                            paddingBottom: "0.25em",
                          }),
                        }}
                      >
                        {s.label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* leading-[130px] is the real 64px-desktop line-height (2.03x the
            type size, the deliberately loose look the header comment
            describes) — it was fixed even at the mobile text-4xl (36px)
            size, which blew the gap between city names out of proportion.
            Scaled at the same ratio: 36 * 2.03 ≈ 73px. */}
        <div className="flex flex-1 flex-col gap-[106px]">
        <ul className="flex flex-col gap-4 font-display text-4xl uppercase leading-[73px] md:text-[64px] md:leading-[130px] lg:gap-12">
          {/* Each office city as its own nested Place item (itemProp
              "location" is repeatable on Organization), rather than plain
              text — real office locations, not invented. */}
          {cities.map((city) => (
            <li
              key={city}
              itemProp="location"
              itemScope
              itemType="https://schema.org/Place"
            >
              <span
                data-city-reveal=""
                className="block"
                style={{ opacity: 0, transform: "translateY(-0.25em)" }}
              >
                <span itemProp="name">{city}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-x-800 gap-y-4">
          <ThemeToggle />
          {/* Hidden for now; the toggle and its logic are intact. */}
          <div className="hidden">
            <MotionToggle />
          </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
