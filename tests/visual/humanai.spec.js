import { test, expect } from "@playwright/test";
import { preparePage } from "./support/prepare-page.js";

// Regression baseline for the Human Imagination x AI section.
// Baseline = your own render. Detects drift between commits, NOT distance
// from design. First run creates the snapshot; later runs diff against it.
//   Update baseline:  npm run test:visual -- --update-snapshots
test("HumanAI section matches baseline", async ({ page }) => {
  await preparePage(page);
  const section = page.locator("#human-ai");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveScreenshot("humanai.png");
});
