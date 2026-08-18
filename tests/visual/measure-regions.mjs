// Count diff pixels (red/yellow from pixelmatch) per region to see where the
// remaining distance is concentrated.
import { PNG } from "pngjs";
import fs from "node:fs";

const diff = PNG.sync.read(fs.readFileSync("tests/visual/output/humanai-diff.png"));
const { width, height, data } = diff;

// pixelmatch marks diffs red (255,0,0) and antialias yellow (255,255,0).
function isDiff(i) {
  return data[i] > 150 && data[i + 2] < 120; // high red, low blue => red or yellow
}

const regions = {
  "LEFT text (x<900)": (x) => x < 900,
  "RIGHT chart (x>=900)": (x) => x >= 900,
  "headline band (x<800,y330-440)": (x, y) => x < 800 && y >= 330 && y < 440,
};
const counts = Object.fromEntries(Object.keys(regions).map((k) => [k, 0]));
let total = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (!isDiff((y * width + x) * 4)) continue;
    total++;
    for (const [k, fn] of Object.entries(regions)) if (fn(x, y)) counts[k]++;
  }
}
const px = width * height;
console.log(`total diff px: ${total} (${((total / px) * 100).toFixed(2)}%)`);
for (const [k, c] of Object.entries(counts)) {
  console.log(`  ${k}: ${c} (${((c / total) * 100).toFixed(1)}% of diff)`);
}
