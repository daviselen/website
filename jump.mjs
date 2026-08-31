import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:5174/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);

// wheel-scroll in realistic increments so anticipatePin sees real velocity
await p.evaluate(() => window.scrollTo(0, 1900));
await p.waitForTimeout(400);
const rows = [];
for (let i = 0; i < 14; i++) {
  await p.mouse.wheel(0, 120);
  await p.waitForTimeout(16);
  rows.push(await p.evaluate(() => {
    const c = document.querySelector("#portfolio-grid [itemtype*='CreativeWork']");
    const r = c.getBoundingClientRect();
    return { y: Math.round(window.scrollY), top: Math.round(r.top),
             h: Math.round(r.height), pos: getComputedStyle(c).position };
  }));
}
let prev = null;
for (const r of rows) {
  r.dTop = prev ? r.top - prev.top : 0;
  r.dY = prev ? r.y - prev.y : 0;
  prev = r;
}
console.table(rows);
await b.close();
