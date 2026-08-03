import {lazy, StrictMode, Suspense, useEffect} from "react";
import {createRoot} from "react-dom/client";
import {Route, Switch, useLocation} from "wouter";

import "./index.scss";
import HomePage from "./pages/Home/Home.tsx";
import NotFoundPage from "./pages/NotFound/NotFound.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import OfflineToast from "./components/OfflineToast/OfflineToast.tsx";
import {ThemeProvider} from "./Context/ThemeContext.tsx";

// A deploy replaces every hashed filename, so a tab opened against an older build can ask for a chunk that no longer exists.
// Vite fires this instead of throwing, and a reload lands on the current build.
// Timestamped so a deploy that is actually broken surfaces the error instead of reloading forever.
const PRELOAD_RELOAD_KEY = "preload-reloaded-at";

window.addEventListener("vite:preloadError", (event) => {
    if (Date.now() - Number(sessionStorage.getItem(PRELOAD_RELOAD_KEY) ?? 0) < 10_000) return;

    sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(Date.now()));
    event.preventDefault();
    window.location.reload();
});

const LazyAboutPage = lazy(() => import("./pages/About/About.tsx"));

// export const isDev = import.meta.env.DEV || import.meta.env.MODE === "development";

// Client-side navigation preserves scroll position, so a route change would
// otherwise land you partway down the new page.
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
                <OfflineToast />
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