import {useEffect, useRef, useState} from "react";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {useGSAP} from "@gsap/react";
import {Menu} from "lucide-react";
import NavDrawer from "./NavDrawer.tsx";
import {Link} from "wouter";
import {BRAND, inlineLinks} from "./nav.config.ts";
import "./Navbar.scss";

gsap.registerPlugin(ScrollTrigger);

// Scroll distance before the bar frosts and shrinks.
const SHRINK_AT = 40;

type Props = {
    // When true the bar sits transparent over a hero at the top of the page and
    // turns frosted once scrolled. When false it's solid from the start.
    isHero?: boolean;
    // Locks the bar in its compact state. The scroll trigger is never created,
    // so the bar never expands regardless of scroll position.
    isShrunk?: boolean;
    // Extra controls rendered in the right cluster, left of the menu button.
    // Nothing is rendered here by default. e.g. pass <ThemeToggle /> for a theme switch.
    actions?: React.ReactNode;
};

export default function Navbar({isHero = false, isShrunk = false, actions}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        // Locked compact: the class is already on the element from render, so
        // there's nothing to toggle and no trigger worth creating.
        if (isShrunk) return;

        const nav = navRef.current;
        if (!nav) return;

        const setScrolled = (on: boolean) => nav.classList.toggle("is-scrolled", on);

        // onToggle fires only when the active state flips, where onUpdate would run on every scroll frame to usually change nothing.
        ScrollTrigger.create({
            start: SHRINK_AT,
            end: () => Math.max(ScrollTrigger.maxScroll(window), SHRINK_AT + 1),
            onToggle: (self) => setScrolled(self.isActive),
        });

        setScrolled(window.scrollY > SHRINK_AT);
    });

    // Escape closes the drawer.
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isOpen]);

    return (
        <>
            <nav
                className={`navbar${isHero ? "" : " navbar--solid"}${isShrunk ? " is-scrolled" : ""}`}
                ref={navRef}
            >
                <div className="navbar_bar">
                    <Link
                        className="navbar_logo"
                        href="/"
                        aria-label={`${BRAND} — home`}
                    >
                        {BRAND}
                    </Link>

                    <div className="navbar_right">
                        <ul className="navbar_inline">
                            {inlineLinks.map((link) => (
                                <li key={link.href}>
                                    {/* wouter passes the match result to a className function,
                                        so the active rule needs no extra hook. */}
                                    <Link
                                        href={link.href}
                                        className={(isActive) => (isActive ? "is-active" : undefined)}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {actions}

                        <button
                            className="navbar_toggle"
                            onClick={() => setIsOpen(true)}
                            aria-label="Open menu"
                            aria-expanded={isOpen}
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </div>
            </nav>

            <NavDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}