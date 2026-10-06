import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import {
  imageFormatsEnabled,
  RESPONSIVE_WIDTHS,
} from "./scripts/image-formats.mjs";

// Whether scripts/generate-image-formats.mjs will have written .avif/.webp
// siblings for this build. Baked in as a literal so <Picture> and the
// .hi-x-ai-bg backdrop only advertise formats that are actually on disk —
// neither <picture> nor image-set() falls back on a 404, so a client that
// disagrees with the generator renders nothing at all. See
// scripts/image-formats.mjs.
const IMAGE_DERIVATIVES = imageFormatsEnabled();

// The masthead poster (MastheadVideo's `poster`) is the home page's LCP
// image, but <Picture> only requests it once the JS has rendered. This
// preloads it straight from index.html instead. It has to name exactly what
// <Picture> will pick — the AVIF srcset when derivatives exist, the original
// file when they don't — or the browser downloads the image twice.
const MASTHEAD_POSTER = "/images/masthead";

function mastheadPosterPreload() {
  const attrs = IMAGE_DERIVATIVES
    ? {
        rel: "preload",
        as: "image",
        type: "image/avif",
        imagesrcset: RESPONSIVE_WIDTHS.map(
          (width) => `${MASTHEAD_POSTER}-${width}.avif ${width}w`
        ).join(", "),
        // Matches <Picture>'s default `sizes`.
        imagesizes: "100vw",
        fetchpriority: "high",
      }
    : {
        rel: "preload",
        as: "image",
        href: `${MASTHEAD_POSTER}.jpg`,
        fetchpriority: "high",
      };

  return {
    name: "masthead-poster-preload",
    transformIndexHtml: () => [{ tag: "link", attrs, injectTo: "head" }],
  };
}

export default defineConfig({
  plugins: [react(), mastheadPosterPreload()],
  define: {
    "import.meta.env.VITE_IMAGE_DERIVATIVES": JSON.stringify(IMAGE_DERIVATIVES),
    "import.meta.env.VITE_IMAGE_WIDTHS": JSON.stringify(RESPONSIVE_WIDTHS),
  },
});
