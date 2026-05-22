import {lazy, StrictMode, Suspense} from "react";
import {createRoot} from "react-dom/client";
import {createBrowserRouter, RouterProvider} from "react-router-dom";

import "./index.scss";
import HomePage from "./pages/Home/Home.tsx";
import NotFoundPage from "./pages/NotFound/NotFound.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

const LazyAboutPage = lazy(() => import("./pages/About/About.tsx"));

// export const isDev = import.meta.env.DEV || import.meta.env.MODE === "development";

const router = createBrowserRouter([
    {
        path: "/", element: <HomePage />
    },
    {
        path: "/about",
        element: (
            <Suspense fallback={null}>
                <LazyAboutPage />
            </Suspense>
        )
    },
    {
        path: "*", element: <NotFoundPage />
    }
]);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
    <StrictMode>
        <ErrorBoundary>
            <RouterProvider router={router} />
        </ErrorBoundary>
    </StrictMode>
);