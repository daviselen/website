# PostHog error tracking

> ⚠️ **Needs your attention**
> - In the Vercel project’s **Production** environment, add `POSTHOG_API_KEY`, `POSTHOG_PROJECT_ID`, and `POSTHOG_HOST` so production builds upload source maps. Use the exact variable names; mark `POSTHOG_API_KEY` sensitive.
> - In Vercel Production runtime settings, ensure `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`, `POSTHOG_PROJECT_TOKEN`, and `POSTHOG_HOST` are present for the browser SDK and serverless functions.
> - Trigger a production deploy after those variables are configured. The repository has no deploy workflow to update; Vercel’s Git integration owns the deployment.

## What error tracking does now

Uncaught errors reach PostHog through several layers:

- Browser initialization in `src/lib/posthog.js` enables exception capture using the existing `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` configuration.
- `src/main.jsx` wraps the app with `PostHogProvider` and `PostHogErrorBoundary`, so React render errors are reported.
- The root router error boundary in `src/main.jsx` reports errors intercepted by React Router while preserving the existing error UI.
- `api/posthog.js` provides the shared `posthog-node` singleton, enables Node exception autocapture, and exposes a guarded immediate-capture helper.
- `api/contact.js` and `api/locations.js` capture exceptions at their Vercel function boundaries. Existing response and rethrow behavior remains intact.

The project started this command without the server SDK and now has `posthog-node` installed and initialized for its server functions. The browser SDK was already initialized and remains enabled.

## Source-map uploads

Source-map upload is wired in:

- `vite.config.js`
- `package.json`
- `package-lock.json`
- `.claude/skills/error-tracking-upload-source-maps-vite/.posthog-wizard`
- `.claude/skills/error-tracking-upload-source-maps-vite/SKILL.md`
- `.claude/skills/error-tracking-upload-source-maps-vite/references/COMMANDMENTS.md`
- `.claude/skills/error-tracking-upload-source-maps-vite/references/cli.md`
- `.claude/skills/error-tracking-upload-source-maps-vite/references/upload-source-maps.md`
- `.claude/skills/error-tracking-upload-source-maps-vite/references/vite.md`

The exact production build command is:

```sh
npm run build
```

Every production build uploads source maps when `POSTHOG_API_KEY`, `POSTHOG_PROJECT_ID`, and `POSTHOG_HOST` are available in the build environment. The configuration deletes uploaded maps from the public artifact. If those variables are absent, the build safely skips the upload; after adding them to Vercel, the next production build will upload.

## Production build verification

`npm run build` passed after transforming 416 modules. The PostHog uploader created a release, found 16 source-map pairs, and uploaded all 16 symbol-set chunks. Chunk IDs were injected into 17 emitted JavaScript bundles, and uploaded source maps were removed from the deploy artifact. The exact generated release name was not retained in the handoff. The only noted output was Vite’s existing large-chunk advisory.

The verification reused the configure step’s final credentialed production build rather than running a duplicate upload.

## What you still need to do

1. In the Vercel project’s **Settings → Environment Variables**, add `POSTHOG_API_KEY` as a sensitive Production variable, and add `POSTHOG_PROJECT_ID` and `POSTHOG_HOST` as Production variables. The local project already has the upload credentials; Vercel needs the same variable names where `npm run build` runs.
2. In the same Vercel Production environment, ensure `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` are configured for the browser bundle, and `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` are configured for the Vercel functions. `POSTHOG_HOST` is shared by the uploader and server runtime.
3. Trigger the next production deployment. There is no repository-owned CI/deploy pipeline to edit; Vercel’s Git integration runs the build and provides its standard `VERCEL_GIT_*` metadata.

No new personal API key creation step is required here because the credentials step already wrote the source-map-upload key locally. No project-owned CI files were changed because GitHub Actions only validates builds and does not deploy or publish their artifacts.

## How to verify in PostHog

Trigger an error and inspect [PostHog Error Tracking](https://us.posthog.com/project/682046/error_tracking). Uploaded symbol sets appear at [Error Tracking configuration](https://us.posthog.com/project/682046/error_tracking/configuration). After the next Vercel production deployment, confirm that the stack trace is source-resolved and identifies the relevant release and commit metadata.
