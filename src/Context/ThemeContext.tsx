import {createContext, type ReactNode, useContext, useEffect, useState} from "react";

// The two real themes plus "auto", which follows the OS setting.
export type Theme = "light" | "dark";
export type ThemePreference = Theme | "auto";

interface ThemeContextValue {
    theme: Theme;             // the resolved theme actually applied
    preference: ThemePreference; // what the user picked, including "auto"
    cycleTheme: () => void;   // light -> dark -> auto -> light
    setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";
const CYCLE: readonly ThemePreference[] = ["light", "dark", "auto"] as const;

const prefersDark = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

function resolve(pref: ThemePreference): Theme {
    if (pref !== "auto") return pref;
    return prefersDark() ? "dark" : "light";
}

function getInitialPreference(): ThemePreference {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "auto") {
            return stored;
        }
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
        setPreferenceState((p) => CYCLE[(CYCLE.indexOf(p) + 1) % CYCLE.length]);

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