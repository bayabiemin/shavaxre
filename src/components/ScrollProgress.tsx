"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScrollProgress() {
    const circleRef = useRef<SVGCircleElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const circle = circleRef.current;
        if (!circle) return;

        circle.style.strokeDasharray = `${CIRCUMFERENCE}`;
        circle.style.strokeDashoffset = `${CIRCUMFERENCE}`;

        const anim = gsap.to(circle, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.3,
            },
        });

        return () => {
            anim.scrollTrigger?.kill();
            anim.kill();
        };
    }, []);

    return (
        <div ref={wrapperRef} className="scroll-progress-indicator" aria-hidden="true">
            <svg width="60" height="60" viewBox="0 0 60 60">
                {/* Track */}
                <circle
                    cx="30" cy="30" r={RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1.5"
                />
                {/* Fill */}
                <circle
                    ref={circleRef}
                    cx="30" cy="30" r={RADIUS}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
            </svg>
            <span className="scroll-progress-label">SCROLL</span>
        </div>
    );
}
