// Shared page prep so screenshots are deterministic across specs.
export async function preparePage(page) {
  await page.goto("/");
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
