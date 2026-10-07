// Vite glob import: automatically loads all article JSON files in this
// directory. manifest.json is the shared asset/embed lookup, not an article.
const modules = import.meta.glob(["./*.json", "!./manifest.json"], {
  eager: true,
});

const publishedAt = (article) =>
  new Date(article.entries?.[0]?.fields?.publishedAt?.["en-US"] ?? 0);

// Extract the default or module exports and sort them newest first
export const articles = Object.values(modules)
  .map((mod) => mod.default || mod)
  .sort((a, b) => publishedAt(b) - publishedAt(a));
