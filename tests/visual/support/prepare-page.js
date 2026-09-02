// Shared page prep so screenshots are deterministic across specs.
//
// `path` defaults to "/" so every existing caller keeps its behaviour; it
// exists for specs that test a non-root route (tests/visual/job-openings.spec.js
// needs /careers).
export async function preparePage(page, path = "/") {
  await page.goto(path);
  // Webfonts must be loaded or glyph metrics differ vs. the design export.
  await page.evaluate(() => document.fonts.ready);
  // Kill animations/transitions so nothing is mid-flight when we shoot.
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }`,
  });
}
