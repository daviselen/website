#!/usr/bin/env node
/**
 * Generate AVIF + WebP siblings for every raster image in `public/images/`.
 *
 * Why a script instead of a Vite plugin: every image in this repo is referenced
 * as a runtime string path (`src: "/images/foo.jpg"`) from plain JS data objects,
 * so the files never enter Vite's module graph — `public/` is copied verbatim.
 * See the spec in `.zencoder/.../spec.md` §2 for the options that were rejected.
 *
 * Output lands next to the source (`foo.jpg` -> `foo.avif` + `foo.webp`) so the
 * `<Picture>` component can derive both paths by a plain extension swap. The
 * derivatives are gitignored and rebuilt by the `predev` / `prebuild` hooks.
 *
 * Production only: encoding ~every raster on the site is the slowest part of a
 * build and buys nothing on a staging preview, so this exits early unless
 * `imageFormatsEnabled()` says otherwise. vite.config.js reads the same
 * predicate and switches the client off in lockstep — see scripts/
 * image-formats.mjs for why that pairing is mandatory rather than tidy.
 *
 * Usage:
 *   node scripts/generate-image-formats.mjs            # incremental
 *   node scripts/generate-image-formats.mjs --force    # ignore the manifest
 *   IMAGE_FORMATS=1 node scripts/…                     # run outside prod
 */

import { createHash } from "node:crypto";
import { readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import { imageFormatsEnabled } from "./image-formats.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_DIR = join(ROOT, "public", "images");
const MANIFEST_PATH = join(ROOT, ".image-cache.json");

/**
 * Width cap, in pixels. `null` disables resizing entirely — this is a
 * format-only conversion and no image is ever downscaled. Set a number here to
 * switch a cap on later; sources narrower than the cap are never upscaled.
 */
const MAX_WIDTH = null;

/** Encoder settings. Bumping any of these invalidates the whole manifest. */
const AVIF_OPTIONS = { quality: 60, effort: 4 };
const WEBP_OPTIONS = { quality: 78, effort: 4 };

const SOURCE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const MANIFEST_VERSION = 1;

/** How many images to encode at once. sharp releases the event loop per job. */
const CONCURRENCY = 4;

const FORCE = process.argv.slice(2).includes("--force");

/** Recursively collect source images, sorted for deterministic output. */
async function collectSources(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const found = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await collectSources(fullPath)));
    } else if (
      entry.isFile() &&
      SOURCE_EXTENSIONS.has(extname(entry.name).toLowerCase())
    ) {
      found.push(fullPath);
    }
  }

  return found.sort();
}

async function readManifest() {
  if (FORCE) return null;

  try {
    const parsed = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
    if (parsed?.version !== MANIFEST_VERSION) return null;
    // Any encoder-settings change must invalidate every cached derivative.
    if (JSON.stringify(parsed.settings) !== JSON.stringify(currentSettings())) {
      return null;
    }
    return parsed.files ?? {};
  } catch {
    return null;
  }
}

function currentSettings() {
  return { maxWidth: MAX_WIDTH, avif: AVIF_OPTIONS, webp: WEBP_OPTIONS };
}

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function derivativePaths(sourcePath) {
  const base = sourcePath.slice(0, -extname(sourcePath).length);
  return { avif: `${base}.avif`, webp: `${base}.webp` };
}

/**
 * Encode one source into both formats.
 * Returns null when the manifest says the source is unchanged and both
 * derivatives are still on disk.
 */
async function processSource(sourcePath, cachedFiles) {
  const key = relative(ROOT, sourcePath);
  const stats = await stat(sourcePath);
  const buffer = await readFile(sourcePath);
  const hash = createHash("sha256").update(buffer).digest("hex");
  const { avif, webp } = derivativePaths(sourcePath);

  const cached = cachedFiles?.[key];
  if (cached?.hash === hash) {
    const [hasAvif, hasWebp] = await Promise.all([
      fileExists(avif),
      fileExists(webp),
    ]);
    if (hasAvif && hasWebp) {
      return {
        key,
        skipped: true,
        entry: cached,
        sourceBytes: stats.size,
        avifBytes: cached.avifBytes ?? 0,
        webpBytes: cached.webpBytes ?? 0,
      };
    }
  }

  const pipeline = sharp(buffer, { failOn: "error" });
  const metadata = await pipeline.metadata();

  // EXIF orientation is honoured by browsers for JPEG but is not carried into
  // the derivatives, so bake the rotation in when the source declares one.
  if (metadata.orientation && metadata.orientation > 1) {
    pipeline.rotate();
  }

  if (MAX_WIDTH !== null) {
    pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  const [avifBuffer, webpBuffer] = await Promise.all([
    pipeline.clone().avif(AVIF_OPTIONS).toBuffer(),
    pipeline.clone().webp(WEBP_OPTIONS).toBuffer(),
  ]);

  await Promise.all([writeFile(avif, avifBuffer), writeFile(webp, webpBuffer)]);

  return {
    key,
    skipped: false,
    sourceBytes: stats.size,
    avifBytes: avifBuffer.length,
    webpBytes: webpBuffer.length,
    entry: {
      mtime: stats.mtimeMs,
      size: stats.size,
      hash,
      avifBytes: avifBuffer.length,
      webpBytes: webpBuffer.length,
    },
  };
}

/** Run `worker` over `items` with a bounded number of in-flight jobs. */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, () =>
    (async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await worker(items[index], index);
      }
    })(),
  );

  await Promise.all(runners);
  return results;
}

/** Delete derivatives whose source has disappeared since the last run. */
async function pruneOrphans(cachedFiles, liveKeys) {
  if (!cachedFiles) return 0;

  let removed = 0;
  for (const key of Object.keys(cachedFiles)) {
    if (liveKeys.has(key)) continue;
    const { avif, webp } = derivativePaths(join(ROOT, key));
    for (const path of [avif, webp]) {
      try {
        await unlink(path);
        removed += 1;
      } catch {
        // Already gone — nothing to prune.
      }
    }
  }
  return removed;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 100 ? 0 : 1)} ${units[unit]}`;
}

function formatDelta(from, to) {
  if (from === 0) return "—";
  return `${(((to - from) / from) * 100).toFixed(0)}%`;
}

function printSummary(results) {
  const nameWidth = Math.max(
    ...results.map((r) => r.key.length),
    "source".length,
  );
  const pad = (text, width) => String(text).padEnd(width);
  const padStart = (text, width) => String(text).padStart(width);

  const header = [
    pad("source", nameWidth),
    padStart("original", 10),
    padStart("avif", 10),
    padStart("webp", 10),
    padStart("avif Δ", 8),
  ].join("  ");

  console.log(`\n${header}`);
  console.log("-".repeat(header.length));

  for (const r of results) {
    console.log(
      [
        pad(r.key, nameWidth),
        padStart(formatBytes(r.sourceBytes), 10),
        padStart(formatBytes(r.avifBytes), 10),
        padStart(formatBytes(r.webpBytes), 10),
        padStart(formatDelta(r.sourceBytes, r.avifBytes), 8),
      ].join("  "),
    );
  }

  const totals = results.reduce(
    (acc, r) => ({
      source: acc.source + r.sourceBytes,
      avif: acc.avif + r.avifBytes,
      webp: acc.webp + r.webpBytes,
    }),
    { source: 0, avif: 0, webp: 0 },
  );

  console.log("-".repeat(header.length));
  console.log(
    [
      pad(`total (${results.length} images)`, nameWidth),
      padStart(formatBytes(totals.source), 10),
      padStart(formatBytes(totals.avif), 10),
      padStart(formatBytes(totals.webp), 10),
      padStart(formatDelta(totals.source, totals.avif), 8),
    ].join("  "),
  );
}

async function main() {
  const startedAt = process.hrtime.bigint();

  if (!imageFormatsEnabled()) {
    console.log(
      `[images] skipped — AVIF/WebP derivatives are production-only ` +
        `(VERCEL_ENV=${process.env.VERCEL_ENV ?? "unset"}). ` +
        `Set IMAGE_FORMATS=1 to run anyway.`,
    );
    return;
  }

  if (!(await fileExists(SOURCE_DIR))) {
    console.log(
      `[images] no ${relative(ROOT, SOURCE_DIR)} directory; nothing to do.`,
    );
    return;
  }

  const sources = await collectSources(SOURCE_DIR);
  if (sources.length === 0) {
    console.log("[images] no .jpg/.jpeg/.png sources found; nothing to do.");
    return;
  }

  const cachedFiles = await readManifest();
  if (FORCE) console.log("[images] --force: ignoring the manifest.");

  const failures = [];
  const settled = await mapWithConcurrency(
    sources,
    CONCURRENCY,
    async (sourcePath) => {
      try {
        return await processSource(sourcePath, cachedFiles);
      } catch (error) {
        failures.push({ key: relative(ROOT, sourcePath), error });
        return null;
      }
    },
  );

  const results = settled.filter(Boolean);
  const encoded = results.filter((r) => !r.skipped);
  const liveKeys = new Set(results.map((r) => r.key));
  const pruned = await pruneOrphans(cachedFiles, liveKeys);

  // Only persist a manifest when every source succeeded, so a failed encode is
  // retried on the next run rather than being cached as done.
  if (failures.length === 0) {
    const files = Object.fromEntries(
      results.map((r) => [r.key, r.entry]).sort(([a], [b]) => (a < b ? -1 : 1)),
    );
    await writeFile(
      MANIFEST_PATH,
      `${JSON.stringify({ version: MANIFEST_VERSION, settings: currentSettings(), files }, null, 2)}\n`,
    );
  }

  const elapsed = Number(process.hrtime.bigint() - startedAt) / 1e9;

  if (encoded.length === 0 && failures.length === 0) {
    console.log(
      `[images] ${results.length} images already current (${elapsed.toFixed(2)}s).` +
        (pruned ? ` Pruned ${pruned} orphaned derivative(s).` : ""),
    );
    return;
  }

  printSummary(results);
  console.log(
    `\n[images] encoded ${encoded.length}, reused ${results.length - encoded.length}` +
      (pruned ? `, pruned ${pruned}` : "") +
      ` in ${elapsed.toFixed(2)}s.`,
  );

  if (failures.length > 0) {
    console.error(`\n[images] ${failures.length} image(s) failed to encode:`);
    for (const { key, error } of failures) {
      console.error(`  ${key}: ${error.message}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[images] fatal:", error);
  process.exitCode = 1;
});
