import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import "./index.css";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Careers from "./pages/Careers";

// Define routes using createBrowserRouter
const router = createBrowserRouter([
  {
    element: <Layout />, // PixelLayout wraps all child routes
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/careers",
        element: <Careers />,
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