import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/about",
  "/about/retail-map",
  "/careers",
  "/contact",
  "/work/social-media",
  "/work/lakers-and-toyota-legendary-partners",
  "/work/dice-branding",
  "/privacy-policy",
  "/news/2017awards",
  "/this-route-does-not-exist",
];

// Routes with no h1 / inner <main> (full-bleed UI) name their own ready signal.
const READY = {
  "/about/retail-map": (page) => page.getByText(/\d+ locations/).first(),
};

// Known noise that is not a render failure. Keep this list short and specific.
const IGNORED = [
  // Vercel injects its feedback toolbar into preview deployments only.
  /vercel\.live/,
  /ResizeObserver loop/,
  // Map tiles / third-party media can fail on CI networks without breaking render.
  /api\.mapbox\.com|events\.mapbox\.com|vimeocdn\.com|player\.vimeo\.com/,
];

for (const route of ROUTES) {
  test(`renders ${route}`, async ({ page }) => {
    const problems = [];
    const note = (msg) => {
      if (!IGNORED.some((re) => re.test(msg))) problems.push(msg);
    };

    page.on("pageerror", (e) => note(`pageerror: ${e.message}`));
    page.on("console", (m) => {
      if (m.type() === "error") note(`console: ${m.text()}`);
    });
    page.on("requestfailed", (r) =>
      note(`requestfailed: ${r.url()} ${r.failure()?.errorText}`)
    );
    page.on("response", (r) => {
      if (r.status() >= 400 && new URL(r.url()).origin === new URL(page.url() || "http://x").origin)
        note(`http ${r.status()}: ${r.url()}`);
    });
    await page.addInitScript(() =>
      document.addEventListener("securitypolicyviolation", (e) =>
        console.error(`CSP blocked ${e.violatedDirective}: ${e.blockedURI}`)
      )
    );

    await page.goto(route, { waitUntil: "domcontentloaded" });

    // Booted and not showing the crash UI.
    await expect(page.locator("#root > *").first()).toBeAttached({ timeout: 10_000 });
    await expect(page.getByText("Something went wrong")).toHaveCount(0);
    await expect(page.getByText("Couldn’t load this page")).toHaveCount(0);
    // Real content in the page wrapper, not just chrome.
    const ready =
      READY[route]?.(page) ??
      page.locator("#smooth-content h1, #smooth-content main").first();
    await expect(ready).toBeAttached({ timeout: 15_000 });

    // Let lazy chunks, fonts and the preloader settle, then judge.
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    expect(problems).toEqual([]);
  });
}

test("a blocked route chunk shows the error page with the nav intact", async ({ page }) => {
  await page.route(/assets\/Careers-.*\.js/, (r) => r.abort());
  await page.goto("/careers");
  await expect(page.getByRole("heading", { name: /couldn.t load this page/i })).toBeVisible();
  await expect(page.locator("dialog")).toHaveCount(1); // nav survived
});
