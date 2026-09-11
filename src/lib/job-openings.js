// Pure mapping layer for job openings: raw ADP WorkforceNow payload in,
// app shape out, and app shape in, schema.org JobPosting out.
//
// No React, no DOM, no I/O — deliberately. The same two functions run in the
// browser (src/sections/JobOpenings.jsx) and under plain Node in the prebuild
// snapshot script, and keeping the whole mapping surface in one side-effect-
// free module is what makes it inspectable and testable without mounting a
// component or opening a socket.

import { applyUrl } from "../data/adp.js";

/**
 * @typedef {Object} JobAddress
 * @property {string}  locality   city, e.g. "Los Angeles"
 * @property {string=} region     state/province code, e.g. "CA"
 * @property {string=} postalCode e.g. "90017"
 * @property {string}  country    ISO-ish country code, e.g. "US"
 */

/**
 * @typedef {Object} JobSalary
 * @property {number=} min      minimumRate.amountValue, when > 0
 * @property {number=} max      maximumRate.amountValue, when > 0
 * @property {string}  currency ISO currency code, e.g. "USD"
 * @property {string=} unitText schema.org duration: HOUR/DAY/WEEK/MONTH/YEAR
 */

/**
 * @typedef {Object} JobOpening
 * @property {string}      id             // itemID — the stable key, and the snapshot join key
 * @property {string}      title          // requisitionTitle
 * @property {string[]}    locations      // display-ready, composed + deduped: ["Los Angeles, CA"]
 * @property {JobAddress[]} addresses     // structured, for schema jobLocation
 * @property {string=}     datePosted     // postDate, already ISO 8601
 * @property {string=}     externalJobId  // ExternalJobID — drives the apply URL
 * @property {string=}     employmentType // raw workLevelCode.shortName, mapped at schema time
 * @property {JobSalary=}  salary         // omitted when payGradeRange is absent
 * @property {string=}     description
 *
 *   NEVER RENDER `description`. It is raw third-party HTML straight out of
 *   ADP's Froala editor — <link> tags to ADP stylesheets, inline styles, its
 *   own <h1>s. It exists on this object for exactly one reason: schema.org
 *   requires `description` on a JobPosting, so it is handed to JSON.stringify
 *   inside a <script type="application/ld+json"> and nowhere else. Putting it
 *   in the DOM as visible content would mean sanitizing and restyling
 *   somebody else's markup, and the visible UI is scoped to title +
 *   location(s) on purpose. If you are here to "just render the
 *   description", don't — that is a product decision, not a cleanup.
 */

const HIRING_ORGANIZATION = {
  "@type": "Organization",
  name: "Davis Elen Advertising",
  url: "https://daviselen.com",
};

// ADP's `workLevelCode.shortName` is ADP's vocabulary ("Regular Full-Time",
// "Co-op Student Part-Time"), not schema.org's employmentType enum. The
// values are compound, so this matches on terms rather than looking up whole
// strings, and schema.org permits an array — "Contract Full-Time" is more
// faithfully ["CONTRACTOR", "FULL_TIME"] than either half alone.
//
// Order matters: it is the order terms appear in the emitted array, chosen so
// the engagement type leads and the hours follow ("Regular" itself carries no
// schema.org meaning and matches nothing).
const EMPLOYMENT_TYPE_TERMS = [
  { type: "CONTRACTOR", pattern: /contract|contractor|freelance/ },
  { type: "TEMPORARY", pattern: /temporary|temp\b|seasonal|per diem/ },
  { type: "INTERN", pattern: /intern|co-?op|student|apprentice/ },
  { type: "VOLUNTEER", pattern: /volunteer/ },
  { type: "FULL_TIME", pattern: /full[\s-]?time/ },
  { type: "PART_TIME", pattern: /part[\s-]?time/ },
];

// ADP `SalaryType` custom field → schema.org QuantitativeValue.unitText.
// Keyed by both the code (`AN`) and the label (`Annually`) because the
// payload carries both and neither is documented as guaranteed.
const SALARY_UNIT_TEXT = {
  an: "YEAR",
  annually: "YEAR",
  annual: "YEAR",
  yearly: "YEAR",
  mo: "MONTH",
  monthly: "MONTH",
  wk: "WEEK",
  weekly: "WEEK",
  dy: "DAY",
  daily: "DAY",
  hr: "HOUR",
  hourly: "HOUR",
};

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function customField(raw, group, nameCodeValue, key) {
  const fields = raw?.customFieldGroup?.[group];
  if (!Array.isArray(fields)) return undefined;
  const match = fields.find(
    (field) =>
      field?.nameCode?.codeValue === nameCodeValue ||
      field?.categoryCode?.codeValue === nameCodeValue,
  );
  return match?.[key];
}

// `requisitionLocations[].nameCode.shortName` is NOT trustworthy for display.
// Observed live: a leading space (" Los Angeles, CA, US"), and elsewhere a
// site-name prefix that isn't the city at all ("SAN DIEGO, Los Angeles, CA,
// US"). So compose from the structured `address` object and only fall back to
// shortName when there is no address to compose from.
function composeLocation(location) {
  const city = text(location?.address?.cityName);
  const region = text(location?.address?.countrySubdivisionLevel1?.codeValue);
  if (city) return region ? `${city}, ${region}` : city;
  return text(location?.nameCode?.shortName);
}

// The country only ever appears as the trailing segment of the untrusted
// shortName (" Los Angeles, CA, US"), so it is parsed from there rather than
// hardcoded — the field format plainly allows non-US values. Anything that
// doesn't look like a country code falls back to "US".
function parseCountry(location) {
  const segments = text(location?.nameCode?.shortName)
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const tail = segments[segments.length - 1];
  if (tail && /^[A-Za-z]{2,3}$/.test(tail)) return tail.toUpperCase();
  return "US";
}

function normalizeLocations(raw) {
  const rawLocations = Array.isArray(raw?.requisitionLocations)
    ? raw.requisitionLocations
    : [];

  const locations = [];
  const addresses = [];
  const seenLocations = new Set();
  const seenAddresses = new Set();

  for (const location of rawLocations) {
    const display = composeLocation(location);
    if (display && !seenLocations.has(display)) {
      seenLocations.add(display);
      locations.push(display);
    }

    // A location with no structured `address` contributes a display string
    // but no structured address, so it shows in the UI and is absent from
    // `jobLocation`. Deliberate: shortName is the only signal in that case,
    // and it is the field that carries the site-name prefix — a wrong
    // addressLocality in the schema is worse than a missing Place.
    const locality = text(location?.address?.cityName);
    if (!locality) continue;

    // Assigned in schema order (locality, region, postalCode, country) so
    // the committed snapshot's key order reads naturally and stays stable.
    const address = { locality };
    const region = text(location?.address?.countrySubdivisionLevel1?.codeValue);
    if (region) address.region = region;
    const postalCode = text(location?.address?.postalCode);
    if (postalCode) address.postalCode = postalCode;
    address.country = parseCountry(location);

    const key = `${address.locality}|${address.region ?? ""}|${
      address.postalCode ?? ""
    }|${address.country}`;
    if (seenAddresses.has(key)) continue;
    seenAddresses.add(key);
    addresses.push(address);
  }

  return { locations, addresses };
}

function amount(rate) {
  const value = rate?.amountValue;
  // 0 is ADP's "not entered" placeholder, not a real figure: the max-only
  // posting observed live pairs `minimumRate.amountValue: 0` with ADP's own
  // pre-formatted label "Up to 50000.00 (USD) Annually". Treating 0 as absent
  // is what keeps that posting's schema honest.
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : undefined;
}

function normalizeSalary(raw) {
  const range = raw?.payGradeRange;
  if (!range) return undefined;

  const min = amount(range.minimumRate);
  const max = amount(range.maximumRate);
  if (min === undefined && max === undefined) return undefined;

  const salary = {};
  if (min !== undefined) salary.min = min;
  if (max !== undefined) salary.max = max;
  salary.currency =
    text(range.minimumRate?.currencyCode) ||
    text(range.maximumRate?.currencyCode) ||
    "USD";

  const salaryTypeCode = text(
    customField(raw, "codeFields", "SalaryType", "codeValue"),
  );
  const salaryTypeName = text(
    customField(raw, "codeFields", "SalaryType", "shortName"),
  );
  const unitText =
    SALARY_UNIT_TEXT[salaryTypeCode.toLowerCase()] ??
    SALARY_UNIT_TEXT[salaryTypeName.toLowerCase()];
  // Left off entirely when unrecognized — an unqualified amount is vague,
  // but a wrongly-qualified one is false.
  if (unitText) salary.unitText = unitText;

  return salary;
}

/**
 * Raw ADP requisition (from either the list or the detail endpoint) → the
 * internal JobOpening shape, so nothing downstream branches on which
 * endpoint the data came from. Only the detail endpoint carries
 * `requisitionDescription`, so `description` is simply absent on list data.
 *
 * Keys are assigned in a fixed order: this object is what the prebuild script
 * serializes into the committed snapshot, and JSON.stringify follows
 * insertion order, so the order here is what keeps that file's diff clean.
 *
 * @param {Object} raw
 * @returns {JobOpening|null} null when the payload lacks an itemID to key on
 */
export function normalize(raw) {
  const id = text(raw?.itemID);
  if (!id) return null;

  const { locations, addresses } = normalizeLocations(raw);

  const opening = { id, title: text(raw?.requisitionTitle) };
  opening.locations = locations;
  opening.addresses = addresses;

  const datePosted = text(raw?.postDate);
  if (datePosted) opening.datePosted = datePosted;

  const externalJobId = text(
    customField(raw, "stringFields", "ExternalJobID", "stringValue"),
  );
  if (externalJobId) opening.externalJobId = externalJobId;

  const employmentType = text(raw?.workLevelCode?.shortName);
  if (employmentType) opening.employmentType = employmentType;

  const salary = normalizeSalary(raw);
  if (salary) opening.salary = salary;

  const description = text(raw?.requisitionDescription);
  if (description) opening.description = description;

  return opening;
}

/**
 * ADP's employment vocabulary → schema.org employmentType. Returns a string
 * for a single match, an array for compound values, and "OTHER" for anything
 * unrecognized — never a passthrough of ADP's raw string, which would put a
 * non-enum value in the schema.
 */
function toEmploymentType(rawEmploymentType) {
  const haystack = text(rawEmploymentType).toLowerCase();
  if (!haystack) return undefined;

  const matched = [];
  for (const { type, pattern } of EMPLOYMENT_TYPE_TERMS) {
    if (pattern.test(haystack) && !matched.includes(type)) matched.push(type);
  }

  if (matched.length === 0) return "OTHER";
  return matched.length === 1 ? matched[0] : matched;
}

function toBaseSalary(salary) {
  if (!salary) return undefined;

  const value = { "@type": "QuantitativeValue" };
  if (salary.min !== undefined && salary.max !== undefined) {
    value.minValue = salary.min;
    value.maxValue = salary.max;
  } else if (salary.min !== undefined) {
    // Min-only and max-only postings both exist upstream, so neither half of
    // the range can be assumed present.
    value.minValue = salary.min;
  } else {
    value.maxValue = salary.max;
  }
  if (salary.unitText) value.unitText = salary.unitText;

  return {
    "@type": "MonetaryAmount",
    currency: salary.currency,
    value,
  };
}

function toPlace(address) {
  const postalAddress = {
    "@type": "PostalAddress",
    addressLocality: address.locality,
  };
  if (address.region) postalAddress.addressRegion = address.region;
  if (address.postalCode) postalAddress.postalCode = address.postalCode;
  postalAddress.addressCountry = address.country;

  return { "@type": "Place", address: postalAddress };
}

/**
 * JobOpening → a schema.org JobPosting object, ready for JSON.stringify into
 * a <script type="application/ld+json"> tag.
 *
 * JSON-LD rather than the microdata used in src/pages/HomePage.jsx and
 * src/sections/Footer.jsx — a deliberate deviation. Microdata has to hang off
 * DOM nodes containing the matching visible text, and most of this payload
 * (description, baseSalary, employmentType, identifier) is never displayed.
 * As microdata it would be a pile of empty <meta> tags, which is exactly the
 * pattern JSON-LD exists to replace. Google also prefers JSON-LD for
 * JobPosting.
 *
 * Callers should only emit this for openings that HAVE a description —
 * schema.org requires it, and an object that fails validation is worse than
 * an absent one.
 *
 * Two properties are omitted on purpose:
 *   - `validThrough`: there is no expiry field anywhere in the ADP payload,
 *     and an invented one would eventually mark live jobs as expired.
 *   - `directApply`: its correctness depends entirely on the unverified apply
 *     URL (see src/data/adp.js). Asserting it before the click-test would be
 *     a guess encoded as a claim.
 *
 * @param {JobOpening} opening
 * @returns {Object|null}
 */
export function toJobPosting(opening) {
  if (!opening?.id) return null;

  const posting = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: opening.title,
  };

  if (opening.description) posting.description = opening.description;
  if (opening.datePosted) posting.datePosted = opening.datePosted;

  const employmentType = toEmploymentType(opening.employmentType);
  if (employmentType) posting.employmentType = employmentType;

  posting.hiringOrganization = HIRING_ORGANIZATION;

  if (opening.externalJobId) {
    // Google's documented PropertyValue shape for this property names the
    // hiring organization, with the requisition id as the value.
    posting.identifier = {
      "@type": "PropertyValue",
      name: HIRING_ORGANIZATION.name,
      value: opening.externalJobId,
    };
  }

  // Omitted rather than emitted empty when an opening carries no locations —
  // which does happen upstream (one live opening has `requisitionLocations:
  // []`). An empty array is not a valid jobLocation, and we have no signal
  // that such a posting is remote, so `jobLocationType: "TELECOMMUTE"` would
  // be a fabrication. Such a posting is knowingly incomplete for Google Jobs.
  if (opening.addresses?.length) {
    posting.jobLocation = opening.addresses.map(toPlace);
  }

  const baseSalary = toBaseSalary(opening.salary);
  if (baseSalary) posting.baseSalary = baseSalary;

  posting.url = applyUrl(opening.externalJobId);

  return posting;
}
