import {useEffect, useRef, useState} from "react";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {useGSAP} from "@gsap/react";
import {Menu} from "lucide-react";
import {NavLink} from "react-router-dom";
import NavDrawer from "./NavDrawer.tsx";
import {BRAND, inlineLinks} from "./nav.config.ts";
import "./Navbar.scss";
import ThemeToggle from "../../Context/ThemeToggle.tsx";

gsap.registerPlugin(ScrollTrigger);

// Scroll distance before the bar frosts and shrinks.
const SHRINK_AT = 40;

type Props = {
    // When true the bar sits transparent over a hero at the top of the page and
    // turns frosted once scrolled. When false it's solid from the start.
    isHero?: boolean;
    // Optional extra controls rendered in the right cluster, left of the menu
    // button (e.g. a theme toggle). Keeps commerce/i18n concerns out of here.
    actions?: React.ReactNode;
};

export default function Navbar({isHero = false, actions}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);

    useGSAP(() => {
        const nav = navRef.current;
        if (!nav) return;

        const setScrolled = (on: boolean) => nav.classList.toggle("is-scrolled", on);

        // onToggle fires only when the active state flips, where onUpdate would
        // run on every scroll frame to usually change nothing. The explicit end
        // keeps the active window well-defined rather than inferred.
        ScrollTrigger.create({
            start: SHRINK_AT,
            end: () => Math.max(ScrollTrigger.maxScroll(window), SHRINK_AT + 1),
            onToggle: (self) => setScrolled(self.isActive),
        });

        setScrolled(window.scrollY > SHRINK_AT);
    });

    // Lock body scroll while the drawer is open, restoring whatever was there
    // before rather than blanking it — something else may own body.overflow.
    useEffect(() => {
        if (!isOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isOpen]);

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
                className={`navbar${isHero ? "" : " navbar--solid"}`}
                ref={navRef}
            >
                <div className="navbar_bar">
                    <NavLink
                        className="navbar_logo"
                        to="/"
                        aria-label={`${BRAND} — home`}
                    >
                        {BRAND}
                    </NavLink>

                    <div className="navbar_right">
                        <ul className="navbar_inline">
                            {inlineLinks.map((link) => (
                                <li key={link.href}>
                                    <NavLink
                                        to={link.href}
                                        className={({isActive}) =>
                                            isActive ? "is-active" : undefined
                                        }
                                    >
                                        {link.label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>

                        {actions}

                        <ThemeToggle />

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