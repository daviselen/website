try {
  if (localStorage.getItem("theme") === "light")
    document.documentElement.dataset.theme = "light";
  const motion = localStorage.getItem("motion");
  document.documentElement.dataset.motion =
    motion ||
    (matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "reduce"
      : "full");
} catch {}
