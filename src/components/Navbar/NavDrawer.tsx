import {useRef, useState} from "react";
import {gsap} from "gsap";
import {useGSAP} from "@gsap/react";
import {ChevronLeft, ChevronRight, X} from "lucide-react";
import {type DrawerItem, menuGroups} from "./nav.config.ts";
import "./Navbar.scss";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

// A level in the navigation stack. Root (depth 0) has no title and uses the
// grouped layout; deeper levels are a single list with a Back header.
type Level = {
    key: string; // stable id for animation keys
    label: string | null; // subtitle; null at root
    groups: DrawerItem[][]; // root has multiple groups; branches have one
};

const ROOT: Level = {key: "root", label: null, groups: menuGroups};

export default function NavDrawer({isOpen, onClose}: Props) {
    // The navigation stack. Last entry is what's currently shown.
    const [stack, setStack] = useState<Level[]>([ROOT]);
    // The panel we're animating away from during a transition (null when idle).
    const [outgoing, setOutgoing] = useState<{
        level: Level;
        direction: "forward" | "back";
    } | null>(null);

    const trackRef = useRef<HTMLDivElement>(null);

    const current = stack[stack.length - 1];

    const drill = (branch: Extract<DrawerItem, { type: "branch" }>) => {
        const level: Level = {
            key: branch.key,
            label: branch.label,
            groups: [branch.children],
        };
        setOutgoing({level: current, direction: "forward"});
        setStack((s) => [...s, level]);
    };

    const back = () => {
        if (stack.length < 2) return;
        setOutgoing({level: current, direction: "back"});
        setStack((s) => s.slice(0, -1));
    };

    // Animate the slide whenever the current level changes. The incoming panel
    // starts off-screen (right on forward, left on back) and settles to 0; the
    // outgoing panel slides the opposite way, then unmounts.
    useGSAP(
        () => {
            const track = trackRef.current;
            if (!track) return;
            if (!outgoing) return;

            const incoming = track.querySelector<HTMLElement>(
                "[data-role='incoming']"
            );
            const leaving = track.querySelector<HTMLElement>(
                "[data-role='leaving']"
            );
            if (!incoming) return;

            const fromX = outgoing.direction === "forward" ? 100 : -100;
            const leaveX = outgoing.direction === "forward" ? -100 : 100;

            gsap.fromTo(
                incoming,
                {xPercent: fromX},
                {xPercent: 0, duration: 0.4, ease: "power3.out"}
            );
            if (leaving) {
                gsap.to(leaving, {
                    xPercent: leaveX,
                    duration: 0.4,
                    ease: "power3.out",
                    onComplete: () => setOutgoing(null),
                });
            } else {
                setOutgoing(null);
            }
        },
        {dependencies: [stack.length, current.key]}
    );

    // When the drawer closes, reset to root after the close transition so it
    // reopens at the top level.
    useGSAP(
        () => {
            if (!isOpen && stack.length > 1) {
                const id = window.setTimeout(() => {
                    setStack([ROOT]);
                    setOutgoing(null);
                }, 450);
                return () => window.clearTimeout(id);
            }
        },
        {dependencies: [isOpen]}
    );

    const closeSoon = () => setTimeout(onClose, 100);

    const renderItems = (groups: DrawerItem[][]) =>
        groups.map((group, gi) => (
            <ul className="navdrawer_group" key={gi}>
                {group.map((item) =>
                    item.type === "link" ? (
                        <li key={item.href}>
                            <a
                                href={item.href}
                                className="navdrawer_link"
                                onClick={closeSoon}
                            >
                                {item.label}
                            </a>
                        </li>
                    ) : (
                        <li key={item.key}>
                            <button
                                className="navdrawer_link navdrawer_branch"
                                onClick={() => drill(item)}
                            >
                                <span>{item.label}</span>
                                <ChevronRight size={18} />
                            </button>
                        </li>
                    )
                )}
            </ul>
        ));

    const renderPanel = (level: Level, role: "incoming" | "leaving") => (
        <div className="navdrawer_panel" data-role={role} key={`${role}-${level.key}`}>
            {level.label !== null && (
                <>
                    <button className="navdrawer_back" onClick={back}>
                        <ChevronLeft size={18} />
                        <span>Back</span>
                    </button>
                    <h2 className="navdrawer_subtitle">{level.label}</h2>
                </>
            )}
            <nav className="navdrawer_nav">{renderItems(level.groups)}</nav>
        </div>
    );

    return (
        <>
            <div
                className={`navdrawer_backdrop${isOpen ? " is-open" : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`navdrawer${isOpen ? " is-open" : ""}`}
                aria-hidden={!isOpen}
            >
                <div className="navdrawer_head">
                    <button
                        className="navdrawer_close"
                        onClick={onClose}
                        aria-label="Close menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="navdrawer_track" ref={trackRef}>
                    {/* Outgoing panel (only during a transition). */}
                    {outgoing && renderPanel(outgoing.level, "leaving")}
                    {/* Current panel. */}
                    {renderPanel(current, "incoming")}
                </div>
            </aside>
        </>
    );
}