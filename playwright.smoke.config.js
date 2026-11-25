import { defineConfig, devices } from "@playwright/test";

// Render smoke test. Point SMOKE_URL at a Vercel preview or production to also
// exercise vercel.json's CSP (`vite preview` does not apply those headers).
// Without it, builds nothing: run `vite build` first, then this serves dist/.
const url = process.env.SMOKE_URL;

export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  ...(url
    ? {}
    : {
        webServer: {
          command: "npx vite preview --port 4173 --strictPort",
          url: "http://localhost:4173",
          reuseExistingServer: !process.env.CI,
        },
      }),
  use: { baseURL: url ?? "http://localhost:4173" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "phone", use: { ...devices["iPhone 14"], browserName: "chromium" } },
  ],
});
