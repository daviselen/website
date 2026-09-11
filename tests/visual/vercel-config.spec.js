import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Regression test for direct-visit 404s on client-side routes (e.g. /about)
// in production. Vercel's static/SPA deploys 404 on any path without a
// matching physical file unless a rewrite sends unknown paths to
// index.html, letting React Router take over. See
// .zencoder/chats/618d3a9f-f18b-426a-a004-513de4ed0124/investigation.md.
const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const vercelConfigPath = path.join(rootDir, "vercel.json");

test("vercel.json rewrites unknown paths to index.html for SPA routing", () => {
  expect(fs.existsSync(vercelConfigPath)).toBe(true);

  const config = JSON.parse(fs.readFileSync(vercelConfigPath, "utf-8"));
  expect(Array.isArray(config.rewrites)).toBe(true);

  const catchAll = config.rewrites.find(
    (r) => r.destination === "/index.html",
  );
  expect(catchAll).toBeTruthy();

  // The rewrite's source regex must match deep client-side routes like
  // /about, not just the root path.
  const sourceRegex = new RegExp(`^${catchAll.source}$`);
  expect(sourceRegex.test("/about")).toBe(true);
});
