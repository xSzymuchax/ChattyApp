export const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

export function realtimeSocketUrl() {
    const configured = import.meta.env.VITE_RT_API_URL || "/ws";

    if (configured.startsWith("ws://") || configured.startsWith("wss://")) {
        return configured;
    }

    const path = configured.startsWith("/") ? configured : `/${configured}`;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    return `${protocol}//${window.location.host}${path}`;
}
