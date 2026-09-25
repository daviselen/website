// Vite glob import: automatically loads all JSON files in this directory
const modules = import.meta.glob("./*.json", { eager: true });

// Extract the default or module exports and sort them newest first
export const articles = Object.values(modules)
  .map((mod) => mod.default || mod)
  .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));