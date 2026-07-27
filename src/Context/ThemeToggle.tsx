import {type LucideIcon, Moon, Sun, SunMoon} from "lucide-react";
import {type ThemePreference, useTheme} from "./ThemeContext.tsx";
import "./ThemeToggle.scss";

// Cycles through every theme in THEMES + "auto".
// The icon reflects the user's preference (includes "auto"), while the actual colors follow the resolved theme.

// Typed as a full Record, so adding a theme to THEMES without adding an icon here is an error.
const ICONS: Record<ThemePreference, LucideIcon> = {
    light: Sun,
    dark: Moon,
    auto: SunMoon,
};

export default function ThemeToggle() {
    const {preference, cycleTheme} = useTheme();
    const Icon = ICONS[preference];
    const label = `Theme: ${preference}`;

    return (
        <button
            className="theme-toggle"
            onClick={cycleTheme}
            aria-label={label}
            title={label}
        >
            <Icon size={20} />
        </button>
    );
}