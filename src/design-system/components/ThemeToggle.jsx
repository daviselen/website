import { useState } from "react";
import SegmentedToggle from "./SegmentedToggle.jsx";

// The choice lives on <html data-theme>, which the `light:` variant in
// tailwind.config.js reads. index.html sets it before first paint, so this
// only has to read it back. No saved choice means dark.
const STORAGE_KEY = "theme";

const OPTIONS = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );

  const choose = (next) => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage blocked (private window, site data cleared): the choice still
      // applies for this visit, it just won't be remembered.
    }
    setTheme(next);
  };

  return (
    <SegmentedToggle label="Theme" options={OPTIONS} value={theme} onChange={choose} />
  );
}
