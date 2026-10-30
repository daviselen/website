import SegmentedToggle from "./SegmentedToggle.jsx";
import { prefersReducedMotion } from "../../lib/reducedMotion.js";

// Off = reduced motion, same as the OS setting. Stored values are the
// data-motion values themselves, so index.html can apply them before paint.
const STORAGE_KEY = "motion";

const OPTIONS = [
  { value: "full", label: "On" },
  { value: "reduce", label: "Off" },
];

export default function MotionToggle() {
  const motion = prefersReducedMotion() ? "reduce" : "full";

  const choose = (next) => {
    if (next === motion) return;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage blocked: the reload below still applies it for this visit.
    }
    // Animations read this once at mount, so only a reload applies it to all
    // of them. The CSS side updates live, but the JS side wouldn't.
    window.location.reload();
  };

  return (
    <SegmentedToggle label="Motion" options={OPTIONS} value={motion} onChange={choose} />
  );
}
