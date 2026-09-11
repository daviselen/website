import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { preparePage } from "./support/prepare-page.js";
import {
  EMPTY_LIST_PAYLOAD,
  FALLBACK_LOCATION_JOB_ID,
  FIXTURE_OPENINGS,
  LIST_PAYLOAD,
  MULTI_LOCATION_JOB_ID,
} from "./support/adp-fixture.js";
import { ADP_CAREER_CENTER_URL, applyUrl } from "../../src/data/adp.js";

// Functional spec for the /careers job list. NOT a pixel test: this section
// has no Figma export and no entry in design-diff.spec.js (spec §6 item 6),
// so everything here is asserted through the DOM.
//
// Every test mocks the ADP list endpoint. Asserting against live ADP data
// would be flaky by construction — the openings change whenever a role is
// filled (spec §5).

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

// Read rather than `import`: Playwright's loader has no JSON-module support,
// and tests/visual/vercel-config.spec.js already establishes readFileSync as
// this suite's way of reaching a repo data file.
const snapshot = JSON.parse(
  fs.readFileSync(path.join(rootDir, "src/data/job-openings.json"), "utf-8"),
);

// The committed snapshot is refreshed from live ADP by `npm run jobs`, so its
// CONTENTS are never asserted — only structural invariants that must hold for
// whatever it happens to contain. Titles/ids come from the fixture instead.
const snapshotWithDescriptions = snapshot.filter(
  (opening) => opening.description,
);

// Matches the list endpoint and NOT the per-opening detail endpoint: `?`
// consumes one character and `*` does not cross a `/`, so
// ".../job-requisitions/{itemID}?..." falls through.
const LIST_ROUTE = "**/job-requisitions?*";

// Anything under the detail endpoint. The runtime path must never request it
// (spec §2.1) — descriptions come from the bundled snapshot.
const DETAIL_URL_FRAGMENT = "/job-requisitions/";

const ROWS = "#job-openings ul > li > a";
const JSON_LD = '#job-openings script[type="application/ld+json"]';

const EMPTY_COPY = "There are no available openings at this time.";

/** Serve `payload` for the list endpoint, and record any detail request. */
async function mockList(page, payload) {
  const detailRequests = [];
  page.on("request", (request) => {
    if (request.url().includes(DETAIL_URL_FRAGMENT)) {
      detailRequests.push(request.url());
    }
  });
  await page.route(LIST_ROUTE, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(payload),
    }),
  );
  return detailRequests;
}

/** Kill the runtime fetch outright, leaving the bundled snapshot on screen. */
async function abortList(page) {
  await page.route(LIST_ROUTE, (route) => route.abort());
}

/** Strip ADP's editor HTML down to words, for "is this text on screen?". */
function plainText(html) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/** A distinctive 8-word run from the middle of a description. */
function samplePhrase(html) {
  const words = plainText(html).split(" ").filter(Boolean);
  const start = Math.max(0, Math.floor(words.length / 2) - 4);
  return words.slice(start, start + 8).join(" ");
}

test.describe("job openings", () => {
  test("lists every opening from the runtime ADP response", async ({
    page,
  }) => {
    const detailRequests = await mockList(page, LIST_PAYLOAD);
    await preparePage(page, "/careers");

    // data-status flips to "live" only once the fetch has resolved and been
    // committed, so this waits on the real signal instead of racing on row
    // counts — the snapshot renders synchronously and also has rows.
    await expect(page.locator("#job-openings")).toHaveAttribute(
      "data-status",
      "live",
    );

    await expect(page.locator(ROWS)).toHaveCount(FIXTURE_OPENINGS.length);
    for (const opening of FIXTURE_OPENINGS) {
      await expect(
        page.getByRole("link", { name: new RegExp(opening.requisitionTitle) }),
      ).toBeVisible();
    }

    // The N+1 is a build-time cost only; making every visitor pay it for
    // invisible schema data is the thing spec §2.1 exists to avoid.
    expect(detailRequests).toEqual([]);
  });

  test("composes location text from the structured address, not shortName", async ({
    page,
  }) => {
    await mockList(page, LIST_PAYLOAD);
    await preparePage(page, "/careers");
    await expect(page.locator("#job-openings")).toHaveAttribute(
      "data-status",
      "live",
    );

    const rows = page.locator(ROWS);

    // Two locations, joined — and the exact-duplicate third entry in the
    // fixture is deduped away rather than printing Los Angeles twice.
    await expect(rows.nth(0)).toContainText("Los Angeles, CA / Arlington, VA");

    // The site-name prefix quirk: that opening's shortName says
    // "SAN DIEGO, Los Angeles, CA, US". If display text were taken from
    // shortName, the wrong city would be on screen.
    await expect(page.locator("body")).not.toContainText("SAN DIEGO");

    // No structured address on this one, so it falls back to shortName —
    // which carries a leading space upstream. An exact match proves the trim.
    const fallbackLocation = rows
      .nth(1)
      .locator("span")
      .filter({ hasText: "Chicago" });
    await expect(fallbackLocation).toHaveText("Chicago, IL, US");

    // requisitionLocations: [] renders no location element at all rather than
    // an empty one.
    await expect(rows.nth(2)).toHaveText("Fixture Studio Intern");
    await expect(rows.nth(2).locator("span")).toHaveCount(1);
  });

  test("apply links point at the constructed ADP career-center URL", async ({
    page,
  }) => {
    await mockList(page, LIST_PAYLOAD);
    await preparePage(page, "/careers");
    await expect(page.locator("#job-openings")).toHaveAttribute(
      "data-status",
      "live",
    );

    const rows = page.locator(ROWS);

    // Equality with applyUrl() pins the wiring; the parsed assertions below
    // pin the URL's meaning, so a change to the (still unverified — see
    // src/data/adp.js) construction has to be deliberate.
    await expect(rows.nth(0)).toHaveAttribute(
      "href",
      applyUrl(MULTI_LOCATION_JOB_ID),
    );
    await expect(rows.nth(1)).toHaveAttribute(
      "href",
      applyUrl(FALLBACK_LOCATION_JOB_ID),
    );

    const href = new URL(await rows.nth(0).getAttribute("href"));
    expect(`${href.origin}${href.pathname}`).toBe(
      "https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html",
    );
    // ExternalJobID, not clientRequisitionID (9001 in the fixture).
    expect(href.searchParams.get("jobId")).toBe(MULTI_LOCATION_JOB_ID);
    expect(href.searchParams.get("cid")).toBeTruthy();
    expect(href.searchParams.get("ccId")).toBeTruthy();

    // No ExternalJobID upstream → the generic career center, never a URL
    // carrying jobId=undefined.
    await expect(rows.nth(2)).toHaveAttribute("href", ADP_CAREER_CENTER_URL);
    expect(ADP_CAREER_CENTER_URL).not.toContain("jobId");

    for (let i = 0; i < FIXTURE_OPENINGS.length; i += 1) {
      await expect(rows.nth(i)).toHaveAttribute("target", "_blank");
      await expect(rows.nth(i)).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  test("runtime data supersedes the bundled snapshot", async ({ page }) => {
    test.skip(
      snapshot.length === 0,
      "committed snapshot is empty, so there is nothing for the fetch to supersede",
    );

    await mockList(page, LIST_PAYLOAD);
    await preparePage(page, "/careers");
    await expect(page.locator("#job-openings")).toHaveAttribute(
      "data-status",
      "live",
    );

    // No fixture title exists in the snapshot, so its presence can only come
    // from the runtime response...
    await expect(page.locator(ROWS).nth(0)).toContainText(
      FIXTURE_OPENINGS[0].requisitionTitle,
    );
    // ...and every snapshot title is gone, so the swap replaced the list
    // rather than appending to it.
    const section = page.locator("#job-openings");
    for (const opening of snapshot) {
      await expect(section).not.toContainText(opening.title);
    }
  });

  test("emits no JSON-LD for a runtime opening with no snapshot description", async ({
    page,
  }) => {
    await mockList(page, LIST_PAYLOAD);
    await preparePage(page, "/careers");
    await expect(page.locator("#job-openings")).toHaveAttribute(
      "data-status",
      "live",
    );
    await expect(page.locator(ROWS)).toHaveCount(FIXTURE_OPENINGS.length);

    // No fixture itemID joins a snapshot description, and schema.org requires
    // `description` — so these three openings are visible to humans and
    // absent from the schema. That is the accepted §2.1 trade-off: a job
    // posted since the last deploy gets no JSON-LD until the next one.
    await expect(page.locator(JSON_LD)).toHaveCount(0);
  });

  test("every JSON-LD block parses as a valid JobPosting", async ({ page }) => {
    test.skip(
      snapshotWithDescriptions.length === 0,
      "committed snapshot has no descriptions, so there is no JSON-LD to validate",
    );

    // Snapshot path: descriptions only ever come from the bundled snapshot,
    // so killing the fetch is what puts JSON-LD on the page.
    await abortList(page);
    await preparePage(page, "/careers");
    await expect(page.locator("#job-openings")).toHaveAttribute(
      "data-status",
      "error",
    );

    const blocks = page.locator(JSON_LD);
    await expect(blocks).toHaveCount(snapshotWithDescriptions.length);

    // textContent, not innerHTML: the section renders the JSON as script
    // children, so this round-trips through JSON.parse exactly.
    const raw = await blocks.allTextContents();
    let locatedPostings = 0;

    for (const json of raw) {
      const posting = JSON.parse(json);

      expect(posting["@context"]).toBe("https://schema.org");
      expect(posting["@type"]).toBe("JobPosting");
      expect(posting.title).toBeTruthy();
      expect(posting.description).toBeTruthy();
      expect(posting.datePosted).toBeTruthy();
      expect(Number.isNaN(Date.parse(posting.datePosted))).toBe(false);
      expect(posting.hiringOrganization).toMatchObject({
        "@type": "Organization",
        name: "Davis Elen Advertising",
      });
      expect(posting.url).toContain("workforcenow.adp.com");

      // Not asserted for every posting: one live opening has
      // `requisitionLocations: []`, and jobLocation is omitted rather than
      // emitted empty for it (knowingly incomplete for Google Jobs — see
      // toJobPosting()). So validate the shape where present, and require
      // that at least one posting has it.
      if (posting.jobLocation) {
        expect(Array.isArray(posting.jobLocation)).toBe(true);
        expect(posting.jobLocation.length).toBeGreaterThan(0);
        locatedPostings += 1;
        for (const place of posting.jobLocation) {
          expect(place["@type"]).toBe("Place");
          expect(place.address["@type"]).toBe("PostalAddress");
          expect(place.address.addressLocality).toBeTruthy();
          expect(place.address.addressCountry).toBeTruthy();
        }
      }

      // Never a passthrough of ADP's own vocabulary ("Regular Full-Time").
      if (posting.employmentType) {
        const types = [posting.employmentType].flat();
        for (const type of types) {
          expect([
            "FULL_TIME",
            "PART_TIME",
            "CONTRACTOR",
            "TEMPORARY",
            "INTERN",
            "VOLUNTEER",
            "OTHER",
          ]).toContain(type);
        }
      }

      // Omitted on purpose (spec §4.4): no expiry exists upstream, and
      // directApply depends on the unverified apply URL.
      expect(posting.validThrough).toBeUndefined();
      expect(posting.directApply).toBeUndefined();
    }

    expect(locatedPostings).toBeGreaterThan(0);
  });

  test("never renders the ADP description as visible text", async ({
    page,
  }) => {
    test.skip(
      snapshotWithDescriptions.length === 0,
      "committed snapshot has no descriptions, so this invariant is unexercised",
    );

    await abortList(page);
    await preparePage(page, "/careers");
    await expect(page.locator("#job-openings")).toHaveAttribute(
      "data-status",
      "error",
    );
    await expect(page.locator(JSON_LD)).toHaveCount(
      snapshotWithDescriptions.length,
    );

    const visibleText = await page.evaluate(() => document.body.innerText);

    for (const opening of snapshotWithDescriptions) {
      const phrase = samplePhrase(opening.description);
      expect(phrase.length).toBeGreaterThan(0);
      // Guard against a vacuous pass: the phrase has to actually be in the
      // schema payload for its absence from the page to mean anything.
      expect(plainText(opening.description)).toContain(phrase);
      expect(visibleText).not.toContain(phrase);
    }

    // The description is raw editor HTML (<div>, <p>, its own <h1>, <link>
    // tags to ADP stylesheets). None of it should have leaked into the page
    // as either markup or escaped text.
    expect(visibleText).not.toContain("<p");
    expect(visibleText).not.toContain("<div");
    expect(visibleText).not.toContain("&nbsp;");
  });

  test("keeps the snapshot on screen when the runtime fetch fails", async ({
    page,
  }) => {
    test.skip(
      snapshot.length === 0,
      "committed snapshot is empty, so there is nothing to fall back to",
    );

    await abortList(page);
    await preparePage(page, "/careers");
    await expect(page.locator("#job-openings")).toHaveAttribute(
      "data-status",
      "error",
    );

    const section = page.locator("#job-openings");
    await expect(page.locator(ROWS)).toHaveCount(snapshot.length);
    for (const opening of snapshot) {
      await expect(section).toContainText(opening.title);
    }

    // Nothing is surfaced to the visitor: an error banner over a listing
    // that is a few hours stale would be worse than the staleness (§2.4).
    await expect(section).not.toContainText(EMPTY_COPY);
    const visibleText = await page.evaluate(() => document.body.innerText);
    expect(visibleText).not.toMatch(
      /error|unavailable|failed|try again|went wrong/i,
    );
  });

  test("renders the empty-state copy when there are no openings", async ({
    page,
  }) => {
    await mockList(page, EMPTY_LIST_PAYLOAD);
    await preparePage(page, "/careers");
    await expect(page.locator("#job-openings")).toHaveAttribute(
      "data-status",
      "live",
    );

    // User-supplied copy, asserted verbatim — it is not ours to reword.
    await expect(page.locator("#job-openings p")).toHaveText(EMPTY_COPY);

    // No list at all, not an empty <ul>.
    await expect(page.locator("#job-openings ul")).toHaveCount(0);
    // And no JSON-LD: there is no posting to describe.
    await expect(page.locator(JSON_LD)).toHaveCount(0);

    // The page still reads as intentional rather than broken, because
    // Careers.jsx keeps the CTA banner mounted in this state.
    await expect(page.locator("#cta-banner")).toBeVisible();
  });
});
