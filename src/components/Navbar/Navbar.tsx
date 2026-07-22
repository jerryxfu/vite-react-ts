import {useEffect, useRef, useState} from "react";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {useGSAP} from "@gsap/react";
import {Menu} from "lucide-react";
import {NavLink} from "react-router-dom";
import NavDrawer from "./NavDrawer.tsx";
import {BRAND, inlineLinks} from "./nav.config.ts";
import "./Navbar.scss";

gsap.registerPlugin(ScrollTrigger);

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
        ScrollTrigger.create({
            start: 40,
            onUpdate: (self) => {
                nav.classList.toggle("is-scrolled", self.scroll() > 40);
            },
        });
        nav.classList.toggle("is-scrolled", window.scrollY > 40);
    });

    // Lock body scroll while the drawer is open.
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
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