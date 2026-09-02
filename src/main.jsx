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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);