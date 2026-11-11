// One lazy chunk per article, keyed by filename (which equals the slug).
// manifest.json is the shared asset/embed lookup, not an article.
const loaders = import.meta.glob(["./*.json", "!./manifest.json"], {
  import: "default",
});

// Resolves to the article JSON, or null when the slug has no file.
export const loadArticle = (slug) =>
  loaders[`./${slug}.json`]?.() ?? Promise.resolve(null);
