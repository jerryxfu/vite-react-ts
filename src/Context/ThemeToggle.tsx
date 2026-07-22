import {Moon, Sun, SunMoon} from "lucide-react";
import {useTheme} from "./ThemeContext.tsx";
import "./ThemeToggle.scss";

// Cycles light -> dark -> auto on click.
// The icon reflects the user's *preference* (so "auto" is visible as its own state),
// while the actual colors follow the resolved theme.

const LABELS = {
    light: "Theme: light",
    dark: "Theme: dark",
    auto: "Theme: auto",
} as const;

export default function ThemeToggle() {
    const {preference, cycleTheme} = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={cycleTheme}
            aria-label={LABELS[preference]}
            title={LABELS[preference]}
        >
            {preference === "light" && <Sun size={20} />}
            {preference === "dark" && <Moon size={20} />}
            {preference === "auto" && <SunMoon size={20} />}
        </button>
    );
}