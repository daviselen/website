import { test, expect } from "@playwright/test";
import { preparePage } from "./support/prepare-page.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const dir = path.dirname(fileURLToPath(import.meta.url));
const designDir = path.join(dir, "design");
const outputDir = path.join(dir, "output");

// Copy the top-left w x h region of a PNG into a fresh, correctly-sized PNG
// so pixelmatch gets buffers with matching dimensions.
function crop(src, w, h) {
  if (src.width === w && src.height === h) return src;
  const out = new PNG({ width: w, height: h });
  PNG.bitblt(src, out, 0, 0, w, h, 0, 0);
  return out;
}

// Sections to compare against a committed Figma export.
// Drop the reference PNG at tests/visual/design/<name>.png (export @1x from
// the 1792px section frame, cropped to the exact frame bounds).
const SECTIONS = [
  { name: "humanai", selector: "#human-ai" },
  { name: "masthead", selector: "#masthead" },
  { name: "proof", selector: "#proof" },
  { name: "portfolio-grid", selector: "#portfolio-grid" },
  { name: "from-inside-out", selector: "#from-inside-out" },
  { name: "news-awards", selector: "#news-awards" },
  { name: "cta-banner", selector: "#cta-banner" },
  { name: "footer", selector: "#footer" },
];

for (const { name, selector } of SECTIONS) {
  test(`${name} distance from design`, async ({ page }, testInfo) => {
    const designPath = path.join(designDir, `${name}.png`);
    test.skip(
      !fs.existsSync(designPath),
      `No design reference at ${designPath} — export the Figma section frame ` +
        `at @1x per tests/visual/design/README.md (crop to exact frame bounds) ` +
        `and commit it here.`
    );

    await preparePage(page);
    const el = page.locator(selector);
    await el.scrollIntoViewIfNeeded();
    const shot = await el.screenshot();

    const actualFull = PNG.sync.read(shot);
    const designFull = PNG.sync.read(fs.readFileSync(designPath));

    // pixelmatch needs identical dimensions. The Figma section artboard
    // often carries a little extra padding vs. the rendered card (e.g. the
    // frame is 1080px tall but the card content is ~1067px). Rather than
    // hard-fail, crop both to their common top-left region so the diff runs.
    // Width should already match exactly (viewport tuned to the frame); a
    // large gap here means viewport/scale is wrong, so guard against that.
    const MAX_SLACK = 24; // px; beyond this it's a real misconfiguration
    const dw = Math.abs(actualFull.width - designFull.width);
    const dh = Math.abs(actualFull.height - designFull.height);
    if (dw > MAX_SLACK || dh > MAX_SLACK) {
      throw new Error(
        `Size mismatch beyond ${MAX_SLACK}px slack: render ` +
          `${actualFull.width}x${actualFull.height} vs design ` +
          `${designFull.width}x${designFull.height}. Align viewport/` +
          `deviceScaleFactor to the Figma frame + export scale.`
      );
    }

    const width = Math.min(actualFull.width, designFull.width);
    const height = Math.min(actualFull.height, designFull.height);
    const actual = crop(actualFull, width, height);
    const design = crop(designFull, width, height);
    if (dw || dh) {
      console.log(
        `[${name}] cropped to common ${width}x${height} ` +
          `(render ${actualFull.width}x${actualFull.height}, ` +
          `design ${designFull.width}x${designFull.height})`
      );
    }

    const diff = new PNG({ width, height });
    const mismatch = pixelmatch(actual.data, design.data, diff.data, width, height, {
      threshold: 0.1, // per-pixel color tolerance (0 strict .. 1 loose)
    });

    fs.mkdirSync(outputDir, { recursive: true });
    const diffPath = path.join(outputDir, `${name}-diff.png`);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    // Also drop the cropped render + design for side-by-side inspection.
    fs.writeFileSync(path.join(outputDir, `${name}-render.png`), PNG.sync.write(actual));
    fs.writeFileSync(path.join(outputDir, `${name}-design.png`), PNG.sync.write(design));

    const pct = ((mismatch / (width * height)) * 100).toFixed(2);
    console.log(`[${name}] design distance: ${pct}% pixels off -> ${diffPath}`);

    // Attach both to the HTML report for eyeballing.
    await testInfo.attach(`${name}-render`, { body: shot, contentType: "image/png" });
    await testInfo.attach(`${name}-diff`, {
      body: fs.readFileSync(diffPath),
      contentType: "image/png",
    });

    // Hard gate: fail if the render has drifted too far from the committed
    // Figma export. Only reached once a baseline exists (see test.skip above).
    expect(Number(pct)).toBeLessThanOrEqual(3.5);
  });
}
