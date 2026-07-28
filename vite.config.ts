import {fileURLToPath, URL} from "node:url";
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import {VitePWA} from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        // Offline support. Update everything under `manifest` for your own app
        VitePWA({
            // The new service worker takes over on the next load, no prompt.
            registerType: "autoUpdate",
            injectRegister: "auto",
            // Served from public/, so not fingerprinted and not caught by globPatterns.
            includeAssets: ["favicon.ico", "favicon16.png", "favicon32.png", "favicon64.png", "apple-touch-icon.png"],
            manifest: {
                name: "vite-react-ts",
                short_name: "vite-react-ts",
                description: "Vite + React + TypeScript starter",
                start_url: "/",
                display: "standalone",
                background_color: "#fbfaf9",
                theme_color: "#fbfaf9",
                icons: [
                    {src: "/android-chrome192.png", sizes: "192x192", type: "image/png"},
                    {src: "/android-chrome512.png", sizes: "512x512", type: "image/png"},
                    // Android crops any icon it can't identify as maskable, so the same art is offered again with padding-aware placement.
                    {src: "/android-chrome512.png", sizes: "512x512", type: "image/png", purpose: "maskable"}
                ]
            },
            workbox: {
                // Code, styles, markup and fonts are precached.
                // Images are not: they are the part that scales with the app,
                // and CacheFirst below picks them up once they're actually viewed.
                globPatterns: ["**/*.{js,css,html,woff2}"],
                cleanupOutdatedCaches: true,
                // Offline deep links land on the shell, which then routes client-side.
                navigateFallback: "/index.html",
                runtimeCaching: [
                    {
                        urlPattern: ({request}) => request.destination === "image" || request.destination === "video",
                        handler: "CacheFirst",
                        options: {
                            cacheName: "media",
                            expiration: {maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30},
                            // 0 keeps opaque cross-origin responses cacheable.
                            cacheableResponse: {statuses: [0, 200]},
                            rangeRequests: true
                        }
                    }
                ]
            }
        })
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});