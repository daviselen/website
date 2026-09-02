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
          default: "#000000", // surface/default — page background
          alt: "#1f1f1f", // surface/alt — HI/AI section background
          "primary-default": "#1e5631", // surface/primary/default — CTA button fill
        },
        neutral: {
          0: "#ffffff", // Neutral/0 — primary text/logo color
          500: "#818181", // Neutral/500, named style "Gray"
          700: "#4d4d4d", // Neutral/700, named style "Dark Gray"
          1000: "#000", // Neutral/1000 - primary surface color
        },
        red: "#E85746", // named style "Red" — "WHAT'S POSSIBLE" / HI cube accent — per direct
        // confirmation this is the correct value, not the #D71602 pulled earlier
        // via get_design_context (which was accurate at the time it was pulled;
        // this value has since changed on the Figma side, or the earlier pull
        // was wrong — the person who can see the file said #E85746 is right,
        // which per FIGMA_WORKFLOW.md #10 outranks a tool-pulled value).
        // Was `blue: "#00BBDE"` (named style "Blue"). Since the HI/AI frame
        // in Figma was restructured for clarity, "LET ROBOTS DO THE WORK"'s
        // accent now resolves through a different pair of variables
        // (color/cyan/500 and information/500, both #00C3FF) instead of
        // that named style — close to the old value but not the same hex.
        // Renamed the token to match what it actually traces to now rather
        // than leaving a `blue` token pointing at a color/name pairing that
        // no longer applies.
        cyan: "#00C3FF", // color/cyan/500, information/500 — "LET ROBOTS DO THE WORK"
        brick: "#B8483D", // named style "Brick" — "Human Imagination" diagram text (now baked into chart.svg, not live text)
        primary: {
          300: "#a4de02", // Primary/300, named style "DE Brand Green" — "UNLOCK YOUR POTENTIAL"
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
        50: "4px",
        100: "8px",
        200: "16px",
        300: "24px",
        400: "32px",
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
        display: ['"Knockout 68 Full Featherwt"', '"Oswald"', "Impact", "sans-serif"],
        stat: ['"Knockout 67 Full Bantamweight"', '"Oswald"', "Impact", "sans-serif"],
        // Font/Secondary = "Ringside Narrow" (confirmed via
        // get_variable_defs). There is no separate "Ringside Regular"
        // variable — an old HP-23 assumption that was never re-checked;
        // the masthead headline uses Font/Primary (Knockout) same as every
        // other big headline, not a distinct "hero" font.
        narrow: ['"Ringside Narrow"', '"Arial Narrow"', "sans-serif"],
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
        "display-h1": ["360px", { lineHeight: "256px" }], // Font/Headings/H1 — Masthead
        "display-h2": ["272px", { lineHeight: "192px" }], // Font/Headings/H2 — Masthead alt
        "display-h3": ["184px", { lineHeight: "128px" }], // Headings/H3 (Scale/2300 + Scale/1600) — section headlines
        "display-hiai": ["144px", { lineHeight: "104px" }], // "THE HI x AI LOOP"
        "display-card": ["80px", { lineHeight: "56px" }], // FootB/heading — portfolio card brand name
        "display-stat": ["64px", { lineHeight: "56px" }], // card/heading, det/heading — Proof/News stat headline
        "pre-title": ["40px", { lineHeight: "48px" }],
        "link-social": ["18px", { lineHeight: "18px" }], // links/social — Footer social links
      },
    },
  },
  plugins: [],
};
