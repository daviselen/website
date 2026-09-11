// Single source of truth for every ADP WorkforceNow URL this app builds.
//
// Both the browser bundle (src/sections/JobOpenings.jsx) and the Node
// prebuild script (scripts/fetch-job-openings.mjs) import from here, so the
// two can't drift apart on a credential or a path segment. Plain `.js` with
// no React/DOM/Node imports, precisely so both runtimes can load it.
//
// `cid` and `ccId` are NOT secrets. They are public identifiers that already
// appear in the career-center links published on daviselen.com, which is why
// they live in source rather than in .env — an env var would imply a
// confidentiality that doesn't exist and would break the Node script's
// ability to run without setup.

export const ADP_CID = "c90dd8c9-c878-4bba-b091-b9c71937f4eb";
export const ADP_CC_ID = "19000101_000001";
export const ADP_LANG = "en_US";

// The public career-center JSON API. Undocumented by ADP but stable, serves
// `Access-Control-Allow-Origin: *`, and needs no auth — which is the whole
// reason this feature needs no proxy or serverless function.
const API_BASE =
  "https://workforcenow.adp.com/mascsr/default/careercenter/public/events/staffing/v1/job-requisitions";

// The human-facing career center. A different path from the API, on the same
// host: this one is the ADP SPA that renders a posting and its apply form.
const RECRUITMENT_BASE =
  "https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html";

// Query string built in a fixed key order (cid, ccId, [jobId], lang) so the
// URLs this module emits are byte-stable — the snapshot writer and the
// Playwright route matcher both compare these as strings.
function adpQuery(extra) {
  const params = new URLSearchParams();
  params.set("cid", ADP_CID);
  params.set("ccId", ADP_CC_ID);
  for (const [key, value] of Object.entries(extra ?? {})) {
    params.set(key, value);
  }
  params.set("lang", ADP_LANG);
  return params.toString();
}

/** Every currently-posted opening, without `requisitionDescription`. */
export function jobListUrl() {
  return `${API_BASE}?${adpQuery()}`;
}

/**
 * One opening, WITH `requisitionDescription`. The description exists only
 * here, which is what forces the build-time N+1 (see spec §2.1).
 *
 * @param {string} itemId raw ADP `itemID`, e.g. "9202829972433_1"
 */
export function jobDetailUrl(itemId) {
  return `${API_BASE}/${encodeURIComponent(itemId)}?${adpQuery()}`;
}

/**
 * The generic career center, listing every opening. Verified reachable
 * (HTTP 200) and used as the fallback whenever a specific job's deep link
 * can't be built.
 */
export const ADP_CAREER_CENTER_URL = `${RECRUITMENT_BASE}?${adpQuery()}`;

//
// !! UNVERIFIED — REQUIRES A HUMAN CLICK-TEST BEFORE THIS SHIPS !!
//
// The ADP payload contains no apply URL (`links[]` and `postingInstructions[]`
// are empty on every opening), so this is constructed from ExternalJobID.
// It could NOT be verified by request: that path is an SPA shell that returns
// HTTP 200 for ANY jobId, including a bogus one, so a 200 proves nothing.
//
// Verify by hand: open the URL for a real opening and confirm it lands on THAT
// job's posting, not a generic career-center landing page.
//
// If the click-test fails, change ONLY this function. Every apply link on the
// site and the `url` property of every JobPosting object resolve through here.
// The documented fallback is the generic career center (ADP_CAREER_CENTER_URL),
// which IS verified reachable.
//
// Corroborating evidence found while implementing, which is not a substitute
// for the click-test: the CURRENT production daviselen.com/careers page links
// its openings with exactly this URL shape, and its `jobId` values (571590,
// 572358, 572640, …) are the `ExternalJobID` field of this API — not
// `clientRequisitionID` (1104, 1105, 1107, …). So the identifier choice below
// matches what the live site already ships.
//
export function applyUrl(externalJobId) {
  if (!externalJobId) return ADP_CAREER_CENTER_URL;
  return `${RECRUITMENT_BASE}?${adpQuery({ jobId: String(externalJobId) })}`;
}
