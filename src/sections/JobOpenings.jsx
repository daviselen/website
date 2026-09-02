// The `/careers` job list. There is no Figma frame for this section (see spec
// §6 item 6), so the layout below is composed from existing named tokens and
// deliberately plain: when a frame does exist, replacing token-only markup is
// cheap, whereas unpicking a bespoke design is not. It is also why this
// section is absent from tests/visual/design-diff.spec.js — there is nothing
// to diff against.
import { useEffect, useState } from "react";
import HeadingReveal from "../design-system/components/HeadingReveal.jsx";
import snapshot from "../data/job-openings.json";
import { applyUrl, jobListUrl } from "../data/adp.js";
import { normalize, toJobPosting } from "../lib/job-openings.js";

// User-supplied copy. Rendered verbatim — do not reword, abbreviate, or pair
// it with a catch-all link to the ADP career center that was not asked for.
const EMPTY_COPY = "There are no available openings at this time.";

// `description` exists ONLY on ADP's per-opening detail endpoint, so the
// build-time script pays an N+1 for it and the runtime fetch does not (spec
// §2.1). Since the description is schema-only and never visible, the runtime
// path re-uses the bundled snapshot's copy, joined on `itemID`. Consequence,
// accepted: a job posted since the last deploy shows to humans immediately
// but gets no JSON-LD until the next deploy — schema.org requires
// `description`, and an object that fails validation is worse than none.
const SNAPSHOT_DESCRIPTIONS = new Map(
  snapshot
    .filter((opening) => opening.description)
    .map((opening) => [opening.id, opening.description]),
);

// Cheap identity of the VISIBLE content, used to skip a pointless re-render
// when the runtime list matches the snapshot — which is the normal case, since
// the snapshot is refreshed on every deploy. Deliberately excludes
// `description`: deep-comparing several KB of HTML blobs to decide whether to
// repaint two lines of text would cost more than the repaint.
//
// The delimiters are control characters — written as `\u` escapes so this file
// stays plain ASCII on disk and therefore reviewable in a diff. Do not paste
// literal control bytes back in; git treats the file as binary if you do.
function visibleSignature(openings) {
  return openings
    .map(
      (opening) =>
        `${opening.id}\u0000${opening.title}\u0000${opening.locations.join("\u0001")}`,
    )
    .join("\u0002");
}

export default function JobOpenings() {
  // The snapshot IS the initial state, not a fetch target: it is `import`ed,
  // so Vite inlines it into the bundle and it is synchronously available on
  // first render. Hence no loading flag, no spinner, and no empty first paint.
  const [openings, setOpenings] = useState(snapshot);

  // Not driving any UI. It exists so the source of what's on screen is
  // inspectable (and assertable from a Playwright spec) without inferring it
  // from the list contents — "fetched and genuinely empty" and "fetch hasn't
  // resolved yet" are otherwise indistinguishable in the DOM.
  const [status, setStatus] = useState("snapshot");

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      try {
        const response = await fetch(jobListUrl(), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        // The list endpoint wraps its results; the detail endpoint returns a
        // bare object. Do not assume symmetry between the two.
        const payload = await response.json();
        const raw = Array.isArray(payload?.jobRequisitions)
          ? payload.jobRequisitions
          : [];

        // normalize() returns null for a payload with no itemID to key on.
        const live = raw
          .map(normalize)
          .filter(Boolean)
          .map((opening) => {
            const description = SNAPSHOT_DESCRIPTIONS.get(opening.id);
            return description ? { ...opening, description } : opening;
          });

        setOpenings((current) =>
          visibleSignature(current) === visibleSignature(live) ? current : live,
        );
        setStatus("live");
      } catch {
        // Deliberately silent, including on AbortError. The snapshot stays on
        // screen and the visitor sees nothing — an error banner over a
        // listing that is stale by hours would be worse than the staleness
        // (spec §2.4). This is the entire reason both data paths exist.
        if (!controller.signal.aborted) setStatus("error");
      }
    }

    refresh();
    return () => controller.abort();
  }, []);

  // No useStaggerReveal here, unlike the other sections. A scroll-triggered
  // stagger binds to the elements present when it initialises, and this list
  // can change identity after mount when the runtime fetch resolves — exactly
  // the case it handles badly. Worth revisiting once/if the swap is proven to
  // be a no-op in practice.
  return (
    <section
      id="job-openings"
      data-status={status}
      className="flex flex-col gap-1000 px-8"
    >
      <HeadingReveal
        as="h1"
        text={`Get \na Job`}
        className="font-display text-6xl uppercase leading-none md:text-8xl lg:text-display-h3"
      />

      {openings.length === 0 ? (
        <p className="font-narrow text-2xl">{EMPTY_COPY}</p>
      ) : (
        <ul className="flex flex-col">
          {openings.map((opening) => (
            <li
              key={opening.id}
              className="border-t-2 border-neutral-0 last:border-b-2"
            >
              {/* A real anchor rather than a div with onClick, for the same
                  reason documented in MediaObject.jsx: the whole row is one
                  hit target, and only an <a href> gives keyboard focus,
                  middle-click, and "open in new tab" for free. External, so
                  target=_blank + rel="noopener noreferrer".

                  Visible content is title + location(s) only, on purpose. The
                  `description` on this object is raw third-party HTML and is
                  never rendered — see the field's comment in
                  src/lib/job-openings.js. */}
              <a
                href={applyUrl(opening.externalJobId)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-100 py-400 hover:text-primary-300 md:flex-row md:items-baseline md:justify-between md:gap-400"
              >
                <span className="font-display text-4xl uppercase md:text-display-stat">
                  {opening.title}
                </span>
                {/* Omitted entirely rather than rendered empty: one live
                    opening has `requisitionLocations: []`. */}
                {opening.locations.length > 0 && (
                  <span className="shrink-0 font-narrow text-link-social uppercase text-neutral-500">
                    {opening.locations.join(" / ")}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* JSON-LD, not the microdata used in HomePage.jsx and Footer.jsx — the
          reasoning lives at toJobPosting() in src/lib/job-openings.js. One
          script per opening, and only for openings that HAVE a description,
          since schema.org requires it. No openings means no JSON-LD at all:
          there is no posting to describe. */}
      {openings
        .filter((opening) => opening.description)
        .map((opening) => (
          <script
            key={opening.id}
            type="application/ld+json"
            // Children, not dangerouslySetInnerHTML: React inserts this as a
            // text node, so the script's textContent is the exact JSON string
            // and JSON.parse() round-trips it.
          >
            {JSON.stringify(toJobPosting(opening))}
          </script>
        ))}
    </section>
  );
}
