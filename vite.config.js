import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { imageFormatsEnabled } from "./scripts/image-formats.mjs";

// Whether scripts/generate-image-formats.mjs will have written .avif/.webp
// siblings for this build. Baked in as a literal so <Picture> and the
// .hi-x-ai-bg backdrop only advertise formats that are actually on disk —
// neither <picture> nor image-set() falls back on a 404, so a client that
// disagrees with the generator renders nothing at all. See
// scripts/image-formats.mjs.
const IMAGE_DERIVATIVES = imageFormatsEnabled();

export default defineConfig({
  plugins: [react()],
  define: {
    "import.meta.env.VITE_IMAGE_DERIVATIVES": JSON.stringify(IMAGE_DERIVATIVES),
  },
});
