import {lazy, StrictMode, Suspense, useEffect} from "react";
import {createRoot} from "react-dom/client";
import {Route, Switch, useLocation} from "wouter";

import "./index.scss";
import HomePage from "./pages/Home/Home.tsx";
import NotFoundPage from "./pages/NotFound/NotFound.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import {ThemeProvider} from "./Context/ThemeContext.tsx";

const LazyAboutPage = lazy(() => import("./pages/About/About.tsx"));

// export const isDev = import.meta.env.DEV || import.meta.env.MODE === "development";

// Client-side navigation preserves scroll position,
// so a route change would otherwise land you partway down the new page
function ScrollToTop() {
    const [pathname] = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
    <StrictMode>
        <ErrorBoundary>
            <ThemeProvider>
                <ScrollToTop />
                <Switch>
                    <Route path="/"><HomePage /></Route>
                    <Route path="/about">
                        <Suspense fallback={null}>
                            <LazyAboutPage />
                        </Suspense>
                    </Route>
                    <Route><NotFoundPage /></Route>
                </Switch>
            </ThemeProvider>
        </ErrorBoundary>
    </StrictMode>
);