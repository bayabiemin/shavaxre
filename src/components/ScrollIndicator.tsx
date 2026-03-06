"use client";

import { useEffect, useState } from "react";

export default function ScrollIndicator() {
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const onScroll = () => {
            const pct = Math.min(window.scrollY / (window.innerHeight * 0.35), 1);
            setOpacity(1 - pct);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div
            className="scroll-indicator"
            style={{ opacity, pointerEvents: opacity < 0.05 ? "none" : "auto" }}
            aria-hidden="true"
        >
            <div className="scroll-indicator-ring">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                    <circle cx="28" cy="28" r="22" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
                    <circle
                        cx="28" cy="28" r="22"
                        stroke="#E84142"
                        strokeWidth="1.5"
                        strokeDasharray="138"
                        strokeDashoffset="138"
                        strokeLinecap="round"
                        transform="rotate(-90 28 28)"
                        className="scroll-ring-draw"
                    />
                </svg>
                <span className="scroll-indicator-text">SCROLL</span>
            </div>
        </div>
    );
}
