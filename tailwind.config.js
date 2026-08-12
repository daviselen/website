// Tokens below are pulled from the real HP-23 frame in the DE5 Figma file
// (fileKey tnP43NMbcFkzFKMsdpukDn, node 1642:454) via the Figma REST API,
// and cross-checked against a raw SVG export + rendered PDF.
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#000000", // page background (fill on HP-23 root frame)
        paper: "#ffffff", // primary text color, used ~93x across the page
        accent: {
          tan: "#896E5F", // rgb(137,110,95) — used on logo/icon vector marks
          blue: "#005697", // rgb(0,86,151) — used on News section image tiles
          green: "#2F5F47", // rgb(47,95,71) — CTA button + HI/AI section background
        },
        placeholder: "#d9d9d9", // rgb(217,217,217) — gray placeholder fill on unfinished image slots
      },
      fontFamily: {
        // Knockout & Ringside are commercial fonts (not on Google Fonts) —
        // you'll need to license + self-host them via @font-face in
        // src/index.css. Fallbacks below approximate the condensed/
        // narrow-sans feel until real font files are wired in.
        display: ['"Knockout"', '"Oswald"', "Impact", "sans-serif"], // headlines, all-caps, condensed
        narrow: ['"Ringside Narrow"', '"Arial Narrow"', "sans-serif"], // body copy, nav, labels
        hero: ['"Ringside Regular"', '"Ringside Narrow"', "sans-serif"], // the one giant hero headline only
      },
    },
  },
  plugins: [],
};
