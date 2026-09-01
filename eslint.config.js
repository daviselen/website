import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tailwindcss from "eslint-plugin-tailwindcss";
import eslintConfigPrettier from "eslint-config-prettier";

// Files that existed before the tailwindcss token-fidelity rules were turned
// on. They carry pre-existing arbitrary-value / custom-classname usage that
// hasn't been migrated to design tokens yet, so those two rules are dropped
// to `warn` here (and only here). Any file added after this list is held to
// the repo-wide `error` severity below — that split is the point of this
// override, not a "new vs old" heuristic ESLint's flat config can express.
// Pre-existing content flagged by rules that are otherwise `error`. Same
// existing-file-only exception pattern as the tailwindcss split above: these
// two lines predate the linter, get a one-time pass here, and any new
// violation elsewhere in the codebase still fails at `error`.
const EXISTING_CONTENT_RULE_OVERRIDES = {
  "src/sections/CTABanner.jsx": { "react/no-unescaped-entities": "warn" },
  "src/sections/NewsAwards.jsx": { "react/no-unescaped-entities": "warn" },
  "src/sections/PortfolioGrid.jsx": { "jsx-a11y/img-redundant-alt": "warn" },
};

const TAILWIND_TOKEN_RULES_WARN_FILES = [
  "src/main.jsx",
  "src/pages/HomePage.jsx",
  "src/sections/NavBar.jsx",
  "src/sections/Masthead.jsx",
  "src/sections/Proof.jsx",
  "src/sections/PortfolioGrid.jsx",
  "src/sections/HumanAI.jsx",
  "src/sections/FromInsideOut.jsx",
  "src/sections/NewsAwards.jsx",
  "src/sections/CTABanner.jsx",
  "src/sections/Footer.jsx",
  "src/sections/SocialPR.jsx",
  "src/design-system/components/Button.jsx",
  "src/design-system/components/Card.jsx",
  "src/design-system/components/DeLogo.jsx",
];

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "public/**",
      "test-results/**",
      "playwright-report/**",
      "tests/visual/output/**",
      "tests/visual/design/**",
      // Host Workflow-runtime scripts: injected globals (agent/phase/args)
      // and top-level return/await that a standard ES-module parse rejects.
      // Not app/browser code — linting them under this config is wrong.
      ".claude/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      tailwindcss,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...reactHooks.configs["recommended-latest"].rules,
      ...jsxA11y.configs.recommended.rules,
      ...tailwindcss.configs["flat/recommended"][1].rules,

      // React 18 new JSX transform: no `React` import needed in scope.
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",

      // Token-fidelity rules (FIGMA_WORKFLOW.md #2): error by default,
      // dropped to warn only for the enumerated pre-existing files below.
      "tailwindcss/no-arbitrary-value": "error",
      "tailwindcss/no-custom-classname": "error",

      // No PropTypes dependency anywhere in this codebase (plain JS, no
      // TypeScript) - prop-types validation isn't this project's
      // convention, so the rule has no signal to enforce.
      "react/prop-types": "off",
    },
  },
  {
    files: TAILWIND_TOKEN_RULES_WARN_FILES,
    rules: {
      "tailwindcss/no-arbitrary-value": "warn",
      "tailwindcss/no-custom-classname": "warn",
    },
  },
  ...Object.entries(EXISTING_CONTENT_RULE_OVERRIDES).map(([file, rules]) => ({
    files: [file],
    rules,
  })),
  {
    // Node-context scripts (test helpers and build tooling, not app/browser
    // code). `scripts/` holds the build-time image generator, which runs under
    // plain Node and needs `process`/`console` in scope.
    files: [
      "tests/visual/**/*.mjs",
      "tests/visual/support/**/*.js",
      "scripts/**/*.mjs",
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  eslintConfigPrettier,
];
