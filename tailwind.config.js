// Tokens below are named directly after the real Figma variables/styles
// pulled via get_variable_defs (fileKey tnP43NMbcFkzFKMsdpukDn, node
// 1715:634) — not hand-guessed names like the previous "ink"/"paper"/
// "hiai-*" tokens, which worked numerically but didn't trace back to
// anything you could look up in Figma. If you rename or re-value a
// variable in Figma, the names here should still make it obvious which
// Tailwind token to update.
//
// Two tokens from the old config were dropped entirely: `accent.tan`
// (a hover-state color that was never backed by any real Figma variable
// — just invented for :hover) and `accent.blue`/`placeholder` (both
// unused anywhere in the current code). Nothing here should exist without
// either a real variable behind it or an explicit comment saying it's a
// deliberate, undocumented addition.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          default: "#000000", // surface/default -> Neutral/1000 — page background
          alt: "#1f1f1f", // surface/alt -> Neutral/900 — HI/AI section background
          primary: {
            default: "#1e5631", // surface/primary/default -> Success/800 — CTA button fill
          },
        },
        // The ramps below are Figma's Alias collection, keyed by the Alias
        // variable name. Each resolves to a Brand-collection ramp (Color/Green,
        // Coral, Cyan, Forest, Amber), noted per ramp. Use the Alias names in
        // code; don't add the Brand names (green/amber/cyan would also shadow
        // Tailwind's default palettes of the same name).
        neutral: { // Neutral/n -> Color/Neutral/n
          0: "#ffffff",
          100: "#e0e0e0",
          200: "#cdcdcd",
          300: "#b3b3b3",
          400: "#9a9a9a",
          500: "#818181",
          600: "#666666",
          700: "#4d4d4d",
          800: "#333333",
          900: "#1f1f1f",
          1000: "#000000",
        },
        primary: { // Alias: Primary/n -> Color/Green/n
          100: "#eef9d6",
          200: "#cbef95",
          300: "#a4de02",
          400: "#8ccb0e",
          500: "#75b91a",
          600: "#61a922",
          700: "#4c9a2a",
          800: "#35721d",
          900: "#1f4a12",
        },
        error: { // Alias: Error/n -> Color/Coral/n
          100: "#fff2f0",
          200: "#ffd6d0",
          300: "#ff7a6a",
          400: "#e85746",
          500: "#c83726",
          600: "#a42012",
          700: "#7f1005",
          800: "#580500",
          900: "#330100",
        },
        information: { // Alias: Information/n -> Color/Cyan/n
          100: "#e5f9ff",
          200: "#b8f2ff",
          300: "#7ae5ff",
          400: "#3ad2ff",
          500: "#00c3ff",
          600: "#009cce",
          700: "#00739b",
          800: "#004b68",
          900: "#002738",
        },
        success: { // Alias: Success/n -> Color/Forest/n
          100: "#e9f6df",
          200: "#cbeabc",
          300: "#acdf87",
          400: "#8acd70",
          500: "#68bb59",
          600: "#4f9b43",
          700: "#37783a",
          800: "#1e5631",
          900: "#0f331a",
        },
        warning: { // Alias: Warning/n -> Color/Amber/n
          100: "#fff8ed",
          200: "#fde8c7",
          300: "#fad18c",
          400: "#f7b84f",
          500: "#f4a117",
          600: "#c97e09",
          700: "#985804",
          800: "#673701",
          900: "#3b1c00",
        },
      },
      // Figma's spacing scale (Scale/0 .. Scale/3000), keyed by the same
      // number Figma uses so e.g. `p-400` <-> `Scale/400` <-> 32px is a
      // direct lookup. NOTE: this doesn't replace every existing arbitrary
      // spacing value in the codebase yet — Tailwind's own default 4px-step
      // scale already happens to land on the right pixel numbers for most
      // of what's here (px-8 = 32px = Scale/400, py-16 = 64px = Scale/800,
      // etc.), so those aren't *wrong*, just not named after Figma. Prefer
      // these named keys for new work; a follow-up pass could migrate the
      // rest if full 1:1 traceability matters more than the churn.
      spacing: {
        25: "2px",
        50: "4px",
        100: "8px",
        200: "16px",
        300: "24px",
        400: "32px",
        500: "40px",
        600: "48px",
        700: "56px",
        800: "64px",
        1000: "80px",
        1200: "96px",
        // 1400: added for HI/AI's real inline (horizontal) padding, per
        // direct correction. Not independently pulled via get_variable_defs
        // (Figma was rate-limited) — added on the strength of the pattern
        // every other entry here already fits with no exception:
        // Scale/n = n × 0.08px (100→8, 200→16, 300→24, 400→32, 600→48,
        // 700→56, 800→64, 1000→80, 1600→128, 1800→144, 2000→160, 2300→184,
        // 2400→192, 3000→240 — all check out). 1400 × 0.08 = 112, the exact
        // value given, so this is very likely really Scale/1400 — worth
        // confirming the next time Figma access reopens rather than taking
        // as fully closed out.
        1400: "112px",
        1600: "128px",
        1700: "136px",
        1800: "144px",
        2000: "160px",
        2300: "184px",
        2400: "192px",
        3000: "240px",
        3200: "256px",
      },
      borderRadius: {
        md: "8px", // Border/Radius/md — every card/image corner on the page
      },
      // Not a Figma token: the Contact masthead video's frame ratio (1756×720).
      aspectRatio: {
        "contact-masthead": "1853 / 747",
      },
      // Deliberate, undocumented addition — not a Figma token. Drives the
      // masthead mute toggle's equalizer bars; each bar gets its own
      // animation-delay/-duration inline (see MastheadVideo.jsx) so the 4
      // bars don't move in lockstep off this one shared keyframe.
      keyframes: {
        waveform: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        // Rotating shine-border animation for Contact form fields. Animates
        // the --shine-angle custom property through 360 degrees, driving a
        // conic-gradient that rotates around the field border. The gradient
        // cycles through the three brand accent colors (primary green, cyan,
        // red) as specified in DESIGN.md as "used together exactly once."
        shine: {
          to: { "--shine-angle": "360deg" },
        },
        // Full yaw turn for RotatingCube, starting from its isometric pose.
        "cube-spin": {
          from: { transform: "rotateX(-35.264deg) rotateY(45deg)" },
          to: { transform: "rotateX(-35.264deg) rotateY(405deg)" },
        },
      },
      animation: {
        waveform: "waveform 0.6s ease-in-out infinite",
        // 4s smooth rotation respects motion-safe pseudo-class for reduced
        // motion (defined in Field.jsx via Tailwind's built-in variant)
        shine: "shine 4s linear infinite",
        "cube-spin": "cube-spin 10s linear infinite",
      },
      backgroundImage: {
        // Rotating gradient for the Contact form field focus state. Uses
        // conic-gradient from --shine-angle (defined via @property in
        // index.css) and cycles through shades of DE Brand Green: bright
        // lime #a4de02, medium #68bb59, dark forest #1e5631, and back.
        "shine-gradient":
          "conic-gradient(from var(--shine-angle), #a4de02, #68bb59, #1e5631, #a4de02)",
        // Light mode: same stops as above, except the darkest (Forest/800)
        // becomes #479027, the lightest green that still holds 3:1 against the
        // light panel (Neutral/100) — the WCAG minimum for a focus indicator.
        // Not a Figma color: it sits between Primary/700 (2.7:1, fails) and
        // Primary/800 (4.4:1). The lime and Forest/500 stops stay as they are,
        // lighter than 3:1 on purpose, so those parts of the shine are soft.
        "shine-gradient-light":
          "conic-gradient(from var(--shine-angle), #a4de02, #68bb59, #479027, #a4de02)",
      },
      fontFamily: {
        // Knockout isn't one family with a weight axis — Hoefler&Co ships
        // each numbered cut as its own family name, and the family name IS
        // the style label. get_design_context's reference showed
        // 'Knockout:68_Full_Featherwt' and 'Knockout:67_Full_Bantamweight'
        // — those aren't "Knockout" + a style variant, they're two
        // separate font files/family names: "Knockout 68 Full Featherwt"
        // and "Knockout 67 Full Bantamweight". Using plain "Knockout" as
        // the family (like the previous config did) would silently fall
        // through to the fallback stack once real font files are wired in,
        // since no installed/loaded font is actually just named that.
        //
        // `display` (68 Full Featherwt) = big page headlines: Masthead h1,
        //   section h2s, "THE HI x AI LOOP", portfolio card brand name.
        // `stat` (67 Full Bantamweight) = Proof/News/culture card
        //   headlines (Figma's "card/heading" and "det/heading" styles).
        display: ['"Knockout 68 Full Featherwt"', '"Knockout 68 Fallback"', '"Oswald"', "Impact", "sans-serif"],
        stat: ['"Knockout 67 Full Bantamweight"', '"Knockout 67 Fallback"', '"Oswald"', "Impact", "sans-serif"],
        // Font/Secondary = "Ringside Narrow" (confirmed via
        // get_variable_defs). There is no separate "Ringside Regular"
        // variable — an old HP-23 assumption that was never re-checked;
        // the masthead headline uses Font/Primary (Knockout) same as every
        // other big headline, not a distinct "hero" font.
        narrow: ['"Ringside Narrow"', '"Ringside Narrow Fallback"', '"Arial Narrow"', "sans-serif"],
      },
      // Real type scale, read directly from get_design_context's resolved
      // font-size/line-height pairs (Font/Headings/H1, Scale/2300, etc.).
      // Every big headline on this page was previously capped around
      // 72–96px (text-5xl..text-7xl); the real desktop sizes are much
      // bigger — this was the single largest source of visual drift. Use
      // these at the breakpoint where full-size type fits (lg+), and scale
      // down below that for mobile — the responsive step-down is a
      // reasonable adaptation, not something in the source (which is
      // desktop-only).
      fontSize: {
        "display-h1": ["304px", { lineHeight: "208px" }], // Font/Headings/H1 — Masthead
        "display-h2": ["184px", { lineHeight: "128px" }], // Font/Headings/H2 — Masthead alt
        "display-h3": ["144px", { lineHeight: "104px" }], // Headings/H3 (Scale/2300 + Scale/1600) — section headlines
        "display-h4": ["104px", { lineHeight: "80px" }], // Headings/H4
        "display-h5": ["80px", { lineHeight: "64px" }], // "THE HI x AI LOOP"
        "display-card": ["64px", { lineHeight: "48px" }], // FootB/heading — portfolio card brand name
        "display-h6": ["56px", { lineHeight: "40px" }],
        "display-stat": ["40px", { lineHeight: "48px" }], // card/heading, det/heading — Proof/News stat headline
        "pre-title": ["32px", { lineHeight: "40px" }],
        "body-hiai": ["24px", { lineHeight: "32px" }],
        "link-social": ["18px", { lineHeight: "18px" }], // links/social — Footer social links
        "small": ["16px", { lineHeight: "24px" }], // Careers eyebrows
      },
    },
  },
  plugins: [
    // `light:` styles apply only when <html data-theme="light"> is set. Dark
    // is the base (unprefixed classes are the dark design) and the OS
    // preference is deliberately ignored. There is no toggle yet; one would
    // just set the attribute.
    ({ addVariant }) => addVariant("light", ':root[data-theme="light"] &'),
  ],
};
