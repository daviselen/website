#!/usr/bin/env node
/**
 * Refresh `src/data/job-openings.json`, the committed build-time snapshot of
 * the ADP WorkforceNow openings.
 *
 * Why a committed snapshot rather than a gitignored derivative (the
 * `generate-image-formats.mjs` precedent): it is the guaranteed floor. If ADP
 * is unreachable, or rate-limits Vercel's build IPs, the deploy still ships
 * real listings and valid JobPosting schema instead of an empty page. It is
 * also a few KB of diffable text, so "this deploy changed the job list" turns
 * up in code review.
 *
 * Why N+1: `requisitionDescription` exists ONLY on the per-requisition detail
 * endpoint, and schema.org requires `description` on a JobPosting. So this
 * script pays for one request per opening at build time — and the browser
 * deliberately does not (see spec §2.1); it fetches the cheap list endpoint
 * and re-uses these descriptions, matched by `itemID`.
 *
 * Determinism is a hard requirement, not a nicety. Identical upstream data
 * must produce a byte-identical file, or every build dirties the working tree
 * and people learn to ignore the diff. Hence: a fixed sort, the fixed key
 * order that `normalize()` establishes, 2-space indent, a trailing newline,
 * and NO `fetchedAt`/`generatedAt` field. Provenance is the git commit date.
 *
 * Wired into `prebuild` only, never `predev`: a network round-trip on every
 * dev-server boot would be slow and offline-hostile, and the committed
 * snapshot already gives local dev real data. Refresh by hand with
 * `npm run jobs`.
 *
 * Usage:
 *   node scripts/fetch-job-openings.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { jobDetailUrl, jobListUrl } from "../src/data/adp.js";
import { normalize } from "../src/lib/job-openings.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SNAPSHOT_PATH = join(ROOT, "src", "data", "job-openings.json");
const SNAPSHOT_LABEL = relative(ROOT, SNAPSHOT_PATH);

/** Per-request ceiling. A hung socket must not hang the whole build. */
const REQUEST_TIMEOUT_MS = 15_000;

/** In-flight detail requests. Small on purpose — this is someone's API. */
const CONCURRENCY = 4;

function warn(message) {
  console.warn(`[jobs] ${message}`);
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * The previous snapshot, keyed by id. Used to carry a description forward
 * when a detail request fails — a stale description beats no schema at all,
 * and the alternative is silently dropping a posting from Google.
 */
async function readPreviousSnapshot() {
  try {
    const parsed = JSON.parse(await readFile(SNAPSHOT_PATH, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Missing on the very first run, and unparseable only if hand-edited.
    // Either way there is nothing to carry forward.
    return [];
  }
}

/** Run `worker` over `items` with a bounded number of in-flight requests. */
async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () =>
      (async () => {
        while (cursor < items.length) {
          const index = cursor++;
          results[index] = await worker(items[index]);
        }
      })(),
    ),
  );

  return results;
}

/**
 * Newest first, with the id as the tie-break. The tie-break is what makes
 * this a total order: two openings posted in the same minute must not be
 * able to swap places between runs and manufacture a diff.
 */
function byPostDateDesc(a, b) {
  const at = a.datePosted ? Date.parse(a.datePosted) : Number.NaN;
  const bt = b.datePosted ? Date.parse(b.datePosted) : Number.NaN;
  const av = Number.isNaN(at) ? Number.NEGATIVE_INFINITY : at;
  const bv = Number.isNaN(bt) ? Number.NEGATIVE_INFINITY : bt;
  if (av !== bv) return bv - av;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
}

/**
 * Fetch one opening's detail record for its `requisitionDescription`.
 *
 * The detail endpoint returns a BARE requisition object, not the
 * `{ jobRequisitions: [...] }` wrapper the list endpoint uses — the two
 * shapes are not symmetric.
 *
 * On failure the list-derived opening is kept and the previous snapshot's
 * description is carried forward if there is one. What is never written is a
 * half-populated entry: the opening either has a real description or none,
 * and the section only emits JSON-LD for the ones that have it.
 */
async function withDescription(listOpening, previousById, failures) {
  try {
    const detail = await fetchJson(jobDetailUrl(listOpening.id));
    const normalized = normalize(detail);
    if (normalized?.description) return normalized;
    failures.push(`${listOpening.id}: detail payload carried no description`);
  } catch (error) {
    failures.push(`${listOpening.id}: ${error.message}`);
  }

  const carried = previousById.get(listOpening.id)?.description;
  if (carried) {
    // Key order still matches `normalize()`'s: description is assigned last
    // there too, so a carried-forward entry serializes identically to a
    // freshly-fetched one.
    return { ...listOpening, description: carried };
  }
  return listOpening;
}

async function main() {
  // Node 18+ ships a global fetch, and Vite 5 already requires Node 18+, so
  // this branch means the toolchain is misconfigured rather than the network
  // being down. That is worth failing on — unlike an unreachable ADP, which
  // is transient and handled by keeping the existing snapshot below.
  if (typeof fetch !== "function") {
    console.error(
      "[jobs] global fetch is unavailable. This script needs Node 18 or newer" +
        ` (running ${process.version}). Upgrade Node, or drop the "jobs" step` +
        ` from "prebuild" to build against the committed ${SNAPSHOT_LABEL}.`,
    );
    process.exitCode = 1;
    return;
  }

  const previous = await readPreviousSnapshot();
  const previousById = new Map(
    previous.map((opening) => [opening.id, opening]),
  );

  let list;
  try {
    list = await fetchJson(jobListUrl());
  } catch (error) {
    // The whole point of committing the snapshot: warn, change nothing, and
    // let the build carry on with the last known-good listings.
    warn(`could not reach ADP (${error.message}).`);
    warn(
      `keeping the committed ${SNAPSHOT_LABEL} (${previous.length} opening(s)).`,
    );
    return;
  }

  const rawOpenings = Array.isArray(list?.jobRequisitions)
    ? list.jobRequisitions
    : null;
  if (!rawOpenings) {
    warn("ADP returned an unexpected shape (no `jobRequisitions` array).");
    warn(
      `keeping the committed ${SNAPSHOT_LABEL} (${previous.length} opening(s)).`,
    );
    return;
  }

  // `normalize()` returns null for a requisition with no itemID — there would
  // be nothing to key the snapshot join or the React list on.
  const listOpenings = rawOpenings.map(normalize).filter(Boolean);
  const skipped = rawOpenings.length - listOpenings.length;
  if (skipped > 0) warn(`skipped ${skipped} requisition(s) with no itemID.`);

  const failures = [];
  const openings = (
    await mapWithConcurrency(listOpenings, CONCURRENCY, (opening) =>
      withDescription(opening, previousById, failures),
    )
  ).sort(byPostDateDesc);

  if (failures.length > 0) {
    warn(`${failures.length} detail request(s) failed:`);
    for (const failure of failures) console.warn(`[jobs]   ${failure}`);
  }

  const missingDescription = openings.filter((o) => !o.description);
  if (missingDescription.length > 0) {
    warn(
      `${missingDescription.length} opening(s) have no description and will` +
        " render without JSON-LD: " +
        missingDescription.map((o) => o.title || o.id).join(", "),
    );
  }

  if (openings.length === 0 && previous.length > 0) {
    // Not an error — ADP really can go to zero, and the section has a
    // user-supplied empty state for it. Loud anyway, because "all our jobs
    // vanished" should never slip through code review unnoticed.
    warn(
      `ADP returned zero openings; the snapshot drops from ${previous.length} to 0.`,
    );
  }

  const serialized = `${JSON.stringify(openings, null, 2)}\n`;
  let existing = null;
  try {
    existing = await readFile(SNAPSHOT_PATH, "utf8");
  } catch {
    existing = null;
  }

  if (existing === serialized) {
    console.log(
      `[jobs] ${openings.length} opening(s); ${SNAPSHOT_LABEL} already current.`,
    );
    return;
  }

  await writeFile(SNAPSHOT_PATH, serialized);
  console.log(
    `[jobs] wrote ${openings.length} opening(s) to ${SNAPSHOT_LABEL}` +
      ` (was ${previous.length}).`,
  );
}

main().catch((error) => {
  // Anything unanticipated still leaves the committed snapshot in place, so
  // the build can proceed. Exit 0 is deliberate — see the file header.
  warn(`unexpected failure: ${error.message}`);
  warn(`keeping the committed ${SNAPSHOT_LABEL}.`);
});
