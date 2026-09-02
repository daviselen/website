// Frozen ADP WorkforceNow list-endpoint payloads for tests/visual/job-openings.spec.js.
//
// The spec mocks the network against these instead of hitting ADP, because
// asserting on live data would be flaky by construction: a spec that expects
// "Copywriter is listed" fails the day that role is filled (spec §5).
//
// Field shapes are copied from a real `GET /v1/job-requisitions` response —
// including the parts that look like mistakes but are not:
//
//   * `nameCode.shortName` carries a LEADING SPACE (" Los Angeles, CA, US").
//   * that same field can carry a site-name prefix that is not the city
//     ("SAN DIEGO, Los Angeles, CA, US" for a Los Angeles role), which is why
//     display strings are composed from the structured `address` instead.
//   * `amountValue: 0` is ADP's "not entered" placeholder, not a real figure.
//   * `requisitionLocations` can be empty, and `stringFields` entries can
//     exist with no `stringValue` at all.
//
// Titles and `itemID`s here are deliberately FICTIONAL, and deliberately
// absent from the committed snapshot (src/data/job-openings.json). Two
// consequences the spec relies on:
//
//   1. Seeing a fixture title on screen proves the runtime list superseded
//      the bundled snapshot — no snapshot entry could have produced it.
//   2. No fixture `itemID` joins a snapshot description, so the runtime path
//      emits no JSON-LD for them. That is the §2.1 trade-off under test, not
//      a gap in the fixture.

/** Recruitment-center id of the multi-location fixture opening. */
export const MULTI_LOCATION_JOB_ID = "900123";

/** Recruitment-center id of the address-less (shortName fallback) opening. */
export const FALLBACK_LOCATION_JOB_ID = "900456";

const LOS_ANGELES = {
  aliasNames: [],
  address: {
    cityName: "Los Angeles",
    countrySubdivisionLevel1: { codeValue: "CA" },
    postalCode: "90017",
  },
  // The site-name-prefix quirk: the real city is Los Angeles, and "SAN DIEGO"
  // is the ADP work site's name. Composing display text from this field would
  // print the wrong city.
  nameCode: { shortName: "SAN DIEGO, Los Angeles, CA, US" },
};

const ARLINGTON = {
  aliasNames: [],
  address: {
    cityName: "Arlington",
    countrySubdivisionLevel1: { codeValue: "VA" },
    postalCode: "22203",
  },
  nameCode: { shortName: " Arlington, VA, US" },
};

function stringField(codeValue, stringValue) {
  // An entry with no `stringValue` key is what ADP actually sends for an
  // unset string field — not `null`, not `""`.
  return stringValue === undefined
    ? { nameCode: { codeValue } }
    : { stringValue, nameCode: { codeValue } };
}

function codeField(codeValue, shortName, name) {
  return { codeValue, shortName, nameCode: { codeValue: name } };
}

/**
 * Two locations plus an exact duplicate of the first, so both the display
 * string and the structured address have to be deduped. Salaried range,
 * ExternalJobID present.
 */
const MULTI_LOCATION = {
  itemID: "fixture_multi_location_1",
  postingInstructions: [],
  links: [],
  requisitionTitle: "Fixture Broadcast Producer",
  postDate: "2026-08-18T20:27:00.000-04:00",
  requisitionLocations: [LOS_ANGELES, ARLINGTON, LOS_ANGELES],
  payGradeRange: {
    minimumRate: { amountValue: 65000, currencyCode: "USD" },
    maximumRate: { amountValue: 75000, currencyCode: "USD" },
  },
  workLevelCode: { shortName: "Regular Full-Time" },
  customFieldGroup: {
    codeFields: [
      codeField("AN", "Annually", "SalaryType"),
      codeField("RANGE", "RANGE", "SalaryRangeType"),
    ],
    stringFields: [
      stringField("ExternalJobID", MULTI_LOCATION_JOB_ID),
      stringField("CareerCenterRefId"),
    ],
  },
  clientRequisitionID: "9001",
};

/**
 * One location with NO structured `address`, so the display string has to
 * fall back to the untrusted `shortName` — trimmed. Min-only pay range
 * (ADP writes `amountValue: 0` for the unset half) and a compound
 * `workLevelCode` that maps to two schema.org employment types.
 */
const FALLBACK_LOCATION = {
  itemID: "fixture_fallback_location_1",
  postingInstructions: [],
  links: [],
  requisitionTitle: "Fixture Contract Motion Designer",
  postDate: "2026-08-11T09:00:00.000-04:00",
  requisitionLocations: [
    { aliasNames: [], nameCode: { shortName: " Chicago, IL, US" } },
  ],
  payGradeRange: {
    minimumRate: { amountValue: 48, currencyCode: "USD" },
    maximumRate: { amountValue: 0, currencyCode: "USD" },
  },
  workLevelCode: { shortName: "Contract Full-Time" },
  customFieldGroup: {
    codeFields: [codeField("HR", "Hourly", "SalaryType")],
    stringFields: [stringField("ExternalJobID", FALLBACK_LOCATION_JOB_ID)],
  },
  clientRequisitionID: "9002",
};

/**
 * No locations and no ExternalJobID — both observed live (one current
 * opening has `requisitionLocations: []`). Its apply link must therefore
 * fall back to the generic career center rather than emit `jobId=undefined`.
 */
const NO_LOCATION = {
  itemID: "fixture_no_location_1",
  postingInstructions: [],
  links: [],
  requisitionTitle: "Fixture Studio Intern",
  postDate: "2026-08-04T11:30:00.000-04:00",
  requisitionLocations: [],
  workLevelCode: { shortName: "Co-op Student Part-Time" },
  customFieldGroup: {
    stringFields: [stringField("ExternalJobID")],
  },
  clientRequisitionID: "9003",
};

/** Order here is render order: the section does not re-sort the list. */
export const FIXTURE_OPENINGS = [
  MULTI_LOCATION,
  FALLBACK_LOCATION,
  NO_LOCATION,
];

/** A successful `GET /v1/job-requisitions` — note the `jobRequisitions` wrapper. */
export const LIST_PAYLOAD = {
  jobRequisitions: FIXTURE_OPENINGS,
  meta: {
    startSequence: 1,
    totalNumber: FIXTURE_OPENINGS.length,
    links: [],
  },
};

/** ADP with nothing posted. Same wrapper, empty array. */
export const EMPTY_LIST_PAYLOAD = {
  jobRequisitions: [],
  meta: { startSequence: 0, totalNumber: 0, links: [] },
};
