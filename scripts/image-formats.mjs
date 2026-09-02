/**
 * Single source of truth for whether the AVIF/WebP pipeline is active.
 *
 * Two processes have to agree on this, or images break:
 *   - scripts/generate-image-formats.mjs, which writes the derivatives
 *   - vite.config.js, which forwards the answer to the client as
 *     `import.meta.env.VITE_IMAGE_DERIVATIVES` for <Picture> and .hi-x-ai-bg
 *
 * They must agree because neither <picture> nor image-set() has a
 * load-failure fallback: a browser picks the first <source>/candidate whose
 * *type* it supports and stops there. If the generator is skipped but the
 * markup still advertises `.avif`, the request 404s and the image is simply
 * missing — the `.jpg` behind it is never tried. So the flag gates both ends
 * together rather than just the encode.
 *
 * That agreement is also why the rule below reads one explicit signal instead
 * of NODE_ENV or Vite's `mode`: `npm run images` runs as its own Node process
 * from a `prebuild` hook, and Vite sets NODE_ENV in the *other* process only.
 * Anything derived from the build mode would resolve differently on each side.
 *
 *   VERCEL_ENV=production            -> on   (the deploy users actually hit)
 *   anything else, including unset   -> off  (staging previews and local work;
 *                                             not worth the encode on every
 *                                             push, and the .jpg originals
 *                                             render identically)
 *
 * `IMAGE_FORMATS=1` / `=0` overrides the rule. That is how you get production
 * parity locally: `IMAGE_FORMATS=1 npm run build`.
 */

const TRUTHY = new Set(["1", "true", "yes", "on"]);
const FALSY = new Set(["0", "false", "no", "off"]);

export function imageFormatsEnabled(env = process.env) {
  const override = env.IMAGE_FORMATS?.trim().toLowerCase();
  if (override) {
    if (TRUTHY.has(override)) return true;
    if (FALSY.has(override)) return false;
  }

  return env.VERCEL_ENV === "production";
}
