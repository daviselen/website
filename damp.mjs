import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5174/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
await p.evaluate(() => window.scrollTo(0, 2900));
await p.waitForTimeout(700);

// record height every animation frame while wheeling, then keep recording
// after the wheel stops so the catch-up tail is visible
await p.evaluate(() => {
  window.__log = [];
  const c = document.querySelector("#portfolio-grid [itemtype*='CreativeWork']");
  const tick = () => {
    const r = c.getBoundingClientRect();
    window.__log.push([Math.round(window.scrollY), Math.round(r.top), Math.round(r.height)]);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 40); await p.waitForTimeout(45); }
await p.waitForTimeout(1400); // wheel stopped — watch the tail settle

const log = await p.evaluate(() => window.__log);
const out = [];
let prev = null;
for (const [y, top, h] of log) {
  if (prev && prev[0] === y && prev[2] === h) continue; // collapse idle frames
  out.push({ y, top, h, dH: prev ? h - prev[2] : 0 });
  prev = [y, top, h];
}
console.table(out.slice(0, 34));
console.log("final:", out[out.length - 1]);
await b.close();
