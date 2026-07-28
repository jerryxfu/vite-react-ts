import {useEffect, useState} from "react";
import {WifiOff} from "lucide-react";
import "./OfflineToast.scss";

// navigator.onLine reports whether the device has a network interface, not
// whether anything is actually reachable — so treat this as a hint. Pages still
// load from the service worker cache; anything that calls an API will not.
export default function OfflineToast() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const offline = () => setIsOffline(true);
        const online = () => setIsOffline(false);

        window.addEventListener("offline", offline);
        window.addEventListener("online", online);

        return () => {
            window.removeEventListener("offline", offline);
            window.removeEventListener("online", online);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="offline-toast" role="status" aria-live="polite">
            <WifiOff size={16} strokeWidth={1.9} />
            <span>Offline — some features may not work</span>
        </div>
    );
}
