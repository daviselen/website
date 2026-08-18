// Ad-hoc: measure vertical offset between render and design crops.
import { PNG } from "pngjs";
import fs from "node:fs";

const rd = (f) => PNG.sync.read(fs.readFileSync(f));

const r = rd("tests/visual/output/humanai-render.png");
const d = rd("tests/visual/output/humanai-design.png");

// First bright (white) row within an x-band AND a y-window [yTop..).
function firstBrightRowFrom(png, x0, x1, yTop, minHits = 4, bright = 170) {
  const { width, height, data } = png;
  for (let y = yTop; y < height; y++) {
    let hits = 0;
    for (let x = x0; x < x1; x += 2) {
      const i = (y * width + x) * 4;
      if (data[i] > bright && data[i + 1] > bright && data[i + 2] > bright) hits++;
    }
    if (hits >= minHits) return y;
  }
  return -1;
}

// Walk the left column top-to-bottom; each yTop skips past the previous hit
// so we sample successive white blocks (badge, headline, then each body copy).
const probes = [
  ["badge", 0],
  ["headline", 300],
  ["body para 1", 460],
  ["body para 2", 640],
  ["body para 3", 820],
];
for (const [label, yTop] of probes) {
  const rr = firstBrightRowFrom(r, 110, 400, yTop);
  const dd = firstBrightRowFrom(d, 110, 400, yTop);
  console.log(`${label} (y>=${yTop}): render=${rr} design=${dd} offset=${rr - dd}`);
}

// Horizontal extent of white glyphs across a y-band (headline is white).
function brightXExtent(png, y0, y1, bright = 170) {
  const { width, data } = png;
  let min = Infinity, max = -1;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i] > bright && data[i + 1] > bright && data[i + 2] > bright) {
        if (x < min) min = x;
        if (x > max) max = x;
      }
    }
  }
  return [min, max];
}
console.log("\n-- headline white extent (y330-440) --");
for (const [lbl, p] of [["render", r], ["design", d]]) {
  const [mn, mx] = brightXExtent(p, 330, 440);
  console.log(`${lbl}: left=${mn} right=${mx} width=${mx - mn}`);
}
