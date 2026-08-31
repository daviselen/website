import { defineConfig, devices } from "@playwright/test";

// Visual testing config. Two spec kinds under tests/visual:
//   *.spec.js         -> Playwright regression snapshots (baseline = own render)
//   design-diff.*.js  -> pixel diff against committed Figma exports
export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  // Boot the dev server automatically; reuse if one is already running.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: "http://localhost:5173",
    // Emulate a reduced-motion preference, which switches ScrollSmoother off
    // (see useSmoothScroll in src/design-system/animation.js). The smoother
    // scrolls by transforming #smooth-content and easing toward the target
    // over ~1s, so with it running a screenshot taken right after a scroll
    // catches the page mid-glide, and section crops land at the wrong offset.
    // Native scrolling makes the captures deterministic again — and this only
    // disables the smoothing, not the ScrollTrigger animations under test.
    reducedMotion: "reduce",
  },
  // Match the Figma frame you export against. Width = frame width,
  // deviceScaleFactor = export scale (@2x).
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        // Full-site design width is 1856px. The #human-ai card has mx-8
        // (32px) margins, so it renders at 1856-64 = 1792px, matching the
        // Figma section frame (1792px, exported @1x).
        viewport: { width: 1856, height: 1080 },
        deviceScaleFactor: 1,
      },
    },
  ],
  expect: {
    // Regression tolerance: fail if >2% of pixels drift.
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
});
