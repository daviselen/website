import React, { lazy, Suspense, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { PostHogErrorBoundary, PostHogProvider } from "posthog-js/react";
import {
  createBrowserRouter,
  RouterProvider,
  useRouteError,
} from "react-router-dom";
import Layout from "./components/Layout";
import ErrorPage from "./components/ErrorPage";
import "./index.css";
import {
  isChunkError,
  recoverFromChunkError,
  registerRouter,
} from "./lib/chunkRecovery.js";
import "./lib/restoreScroll.js";
import posthog, { isPostHogConfigured } from "./lib/posthog.js";
import { holdSite, releaseSite, skipPreloader } from "./lib/siteReady.js";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";

const RetailMap = lazy(() => import("./pages/RetailMap"));
// Route-split: pulls in @contentful/rich-text-react-renderer and every
// article's full JSON body (src/data/news/, eager-globbed), none of which
// is needed until someone actually visits a /news/:slug page.
const NewsArticlePage = lazy(() => import("./pages/NewsArticle"));

// Route-split via the router's own `lazy`, not React.lazy + Suspense: the
// router resolves the chunk before committing the navigation, so Layout's
// cover/reveal transition never swaps in a Suspense fallback mid-fade. Only
// the home page ships in the entry bundle.
const lazyPage = (module) => ({ Component: module.default });

// Renders inside Layout's outlet, so a page crash keeps the nav and footer.
// A stale-deploy chunk failure reloads once (chunkRecovery.js) rather than
// reporting a 404 for a URL that exists.
function RouteErrorBoundary() {
  const error = useRouteError();
  const chunk = isChunkError(error);

  useEffect(() => {
    if (chunk) recoverFromChunkError(error);
    else if (isPostHogConfigured) posthog.captureException(error);
  }, [error, chunk]);

  return <ErrorPage chunk={chunk} />;
}

// Layout itself threw: nothing of the chrome can be trusted, so static markup.
function RootErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    if (isPostHogConfigured) posthog.captureException(error);
  }, [error]);

  return <ErrorPage />;
}

// Pair with $pageview: pageviews without app_mounted are failed boots.
function AppMounted() {
  useEffect(() => {
    if (isPostHogConfigured)
      posthog.capture("app_mounted", { sha: import.meta.env.VITE_COMMIT_SHA });
  }, []);
  return null;
}

// Define routes using createBrowserRouter
const router = createBrowserRouter([
  {
    element: <Layout />, // PixelLayout wraps all child routes
    errorElement: <RootErrorBoundary />,
    children: [
      {
        // Pathless: scopes errors to the page, inside Layout.
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            path: "/",
            element: <HomePage />,
          },
          {
            path: "/about",
            lazy: () => import("./pages/About").then(lazyPage),
          },
          {
            path: "/about/retail-map",
            element: (
              <Suspense
                fallback={
                  <div
                    className="mx-8 flex min-h-[50vh] items-center justify-center text-xl"
                    aria-busy="true"
                  >
                    Loading map&hellip;
                  </div>
                }
              >
                <RetailMap />
              </Suspense>
            ),
          },
          {
            path: "/careers",
            lazy: () => import("./pages/Careers").then(lazyPage),
          },
          {
            path: "/contact",
            lazy: () => import("./pages/Contact").then(lazyPage),
          },
          {
            path: "/work/social-media",
            lazy: () => import("./pages/SocialMedia").then(lazyPage),
          },
          {
            path: "/work/lakers-and-toyota-legendary-partners",
            lazy: () => import("./pages/LakersToyota").then(lazyPage),
          },
          {
            path: "/work/super-snorkel-tours",
            lazy: () => import("./pages/BodyGlove").then(lazyPage),
          },
          {
            path: "/work/:slug",
            lazy: () => import("./pages/CaseStudy").then(lazyPage),
          },
          {
            path: "/work/dice-branding",
            lazy: () => import("./pages/Dice").then(lazyPage),
          },
          {
            path: "/privacy-policy",
            lazy: () => import("./pages/PrivacyPolicy").then(lazyPage),
          },
          {
            path: "/news/:slug",
            element: (
              <Suspense
                fallback={
                  <div
                    className="flex min-h-screen items-center justify-center text-xl"
                    aria-busy="true"
                  >
                    Loading article&hellip;
                  </div>
                }
              >
                <NewsArticlePage />
              </Suspense>
            ),
          },
          {
            path: "*",
            element: <NotFound />,
          },
        ],
      },
    ],
  },
]);

registerRouter(router);

// Opts the stylesheet into the generated AVIF/WebP siblings. Only
// .hi-x-ai-bg needs it — it is the one raster the site paints as a CSS
// background rather than through <Picture>, so it cannot read the flag
// itself. vite.config.js sets VITE_IMAGE_DERIVATIVES from the same predicate
// the generator uses (scripts/image-formats.mjs), which is production-only;
// without the class the plain .png declaration renders instead.
if (import.meta.env.VITE_IMAGE_DERIVATIVES === true) {
  document.documentElement.classList.add("image-derivatives");
}

// Before first render, so no reveal can start ahead of the preloader; it
// releases the site when it lifts (see SitePreloader). A refresh or a bot
// has no preloader, so nothing is held.
if (skipPreloader) releaseSite();
else holdSite();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <PostHogErrorBoundary fallback={<ErrorPage />}>
        <RouterProvider router={router} />
        <AppMounted />
      </PostHogErrorBoundary>
    </PostHogProvider>
  </React.StrictMode>,
);
