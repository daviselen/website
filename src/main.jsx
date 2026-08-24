import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./components/Layout";
import "./index.css";
import HomePage from "./pages/HomePage";
import About from "./pages/About";

const RetailMap = lazy(() => import("./pages/RetailMap"));

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
        path: "/about/retail-map",
        element: (
          <Suspense fallback={<div className="mx-8 min-h-[50vh]" aria-busy="true" />}>
            <RetailMap />
          </Suspense>
        ),
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);