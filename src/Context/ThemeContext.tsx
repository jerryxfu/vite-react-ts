import {createContext, type ReactNode, useContext, useEffect, useState} from "react";

// Adding a theme:
// 1. add its name to THEMES below
// 2. add a [data-theme="name"] block in index.scss
// 3. add an icon for it in ThemeToggle.tsx
export const THEMES = ["light", "dark"] as const;
export type Theme = typeof THEMES[number];

// The order the toggle cycles through. "auto" always sits last.
export const THEME_PREFERENCES = [...THEMES, "auto"] as const;
export type ThemePreference = typeof THEME_PREFERENCES[number];

// Which themes "auto" resolves to
const AUTO_DARK: Theme = "dark";
const AUTO_LIGHT: Theme = "light";

interface ThemeContextValue {
    theme: Theme;                // the resolved theme actually applied
    preference: ThemePreference; // what the user picked, including "auto"
    cycleTheme: () => void;      // advance one step through THEME_PREFERENCES
    setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";

const prefersDark = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

const isPreference = (value: unknown): value is ThemePreference =>
    THEME_PREFERENCES.includes(value as ThemePreference);

function resolve(pref: ThemePreference): Theme {
    if (pref !== "auto") return pref;
    return prefersDark() ? AUTO_DARK : AUTO_LIGHT;
}

function getInitialPreference(): ThemePreference {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (isPreference(stored)) return stored;
    } catch {
        // localStorage unavailable (private mode, etc.) — fall through.
    }
    return "auto";
}

export function ThemeProvider({children}: { children: ReactNode }) {
    const [preference, setPreferenceState] = useState<ThemePreference>(getInitialPreference);
    const [theme, setTheme] = useState<Theme>(() => resolve(getInitialPreference()));

    // Apply the resolved theme to <html> and persist the preference.
    useEffect(() => {
        setTheme(resolve(preference));
        try {
            localStorage.setItem(STORAGE_KEY, preference);
        } catch {
            // Ignore write failures.
        }
    }, [preference]);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    // While on "auto", react to OS theme changes live.
    useEffect(() => {
        if (preference !== "auto") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = () => setTheme(resolve("auto"));
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, [preference]);

    const cycleTheme = () =>
        setPreferenceState((p) => {
            const index = THEME_PREFERENCES.indexOf(p);
            return THEME_PREFERENCES[(index + 1) % THEME_PREFERENCES.length]!;
        });

    const setPreference = (pref: ThemePreference) => setPreferenceState(pref);

    return (
        <ThemeContext.Provider value={{theme, preference, cycleTheme, setPreference}}>
            {children}
        </ThemeContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
    return ctx;
}