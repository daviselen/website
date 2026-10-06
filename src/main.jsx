import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import "./index.css";
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

// Define routes using createBrowserRouter
const router = createBrowserRouter([
  {
    element: <Layout />, // PixelLayout wraps all child routes
    errorElement: <NotFound />,
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
                className="mx-8 flex min-h-[50vh] items-center justify-center text-lg"
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
        path: "/news/:slug",
        element: (
          <Suspense
            fallback={
              <div
                className="flex min-h-screen items-center justify-center text-lg"
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
]);

// Opts the stylesheet into the generated AVIF/WebP siblings. Only
// .hi-x-ai-bg needs it — it is the one raster the site paints as a CSS
// background rather than through <Picture>, so it cannot read the flag
// itself. vite.config.js sets VITE_IMAGE_DERIVATIVES from the same predicate
// the generator uses (scripts/image-formats.mjs), which is production-only;
// without the class the plain .png declaration renders instead.
if (import.meta.env.VITE_IMAGE_DERIVATIVES === true) {
  document.documentElement.classList.add("image-derivatives");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);