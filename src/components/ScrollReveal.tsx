"use client";

import { useRef, useEffect, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type AnimationType =
    | "fade-up"
    | "fade-down"
    | "fade-left"
    | "fade-right"
    | "scale-up"
    | "blur-in"
    | "glow-in";

function getFrom(animation: AnimationType): gsap.TweenVars {
    switch (animation) {
        case "fade-up":    return { y: 60, opacity: 0 };
        case "fade-down":  return { y: -40, opacity: 0 };
        case "fade-left":  return { x: -60, opacity: 0 };
        case "fade-right": return { x: 60, opacity: 0 };
        case "scale-up":   return { scale: 0.88, opacity: 0 };
        case "blur-in":    return { filter: "blur(16px)", opacity: 0 };
        case "glow-in":    return { scale: 0.96, opacity: 0 };
        default:           return { y: 60, opacity: 0 };
    }
}

function getTo(animation: AnimationType): gsap.TweenVars {
    switch (animation) {
        case "fade-up":
        case "fade-down":  return { y: 0, opacity: 1 };
        case "fade-left":
        case "fade-right": return { x: 0, opacity: 1 };
        case "scale-up":   return { scale: 1, opacity: 1 };
        case "blur-in":    return { filter: "blur(0px)", opacity: 1 };
        case "glow-in":    return { scale: 1, opacity: 1 };
        default:           return { y: 0, opacity: 1 };
    }
}

interface ScrollRevealProps {
    children: ReactNode;
    animation?: AnimationType;
    delay?: number;
    duration?: number;
    scrub?: boolean | number;
    className?: string;
    // kept for backward compat
    threshold?: number;
    once?: boolean;
}

export default function ScrollReveal({
    children,
    animation = "fade-up",
    delay = 0,
    duration = 0.9,
    scrub = false,
    className = "",
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const from = getFrom(animation);
        const to = getTo(animation);

        const anim = gsap.fromTo(el, from, {
            ...to,
            duration,
            delay: scrub ? 0 : delay / 1000,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 88%",
                end: "top 25%",
                scrub: scrub || false,
                toggleActions: scrub ? undefined : "play none none none",
            },
        });

        return () => {
            anim.scrollTrigger?.kill();
            anim.kill();
        };
    }, [animation, delay, duration, scrub]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}

// ─── Stagger Container — GSAP ───────────────────────────────────

interface StaggerContainerProps {
    children: ReactNode[] | ReactNode;
    animation?: AnimationType;
    staggerDelay?: number;
    baseDelay?: number;
    duration?: number;
    threshold?: number;
    className?: string;
    scrub?: boolean | number;
}

export function StaggerContainer({
    children,
    animation = "fade-up",
    staggerDelay = 120,
    baseDelay = 0,
    duration = 0.7,
    className = "",
    scrub = false,
}: StaggerContainerProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = ref.current;
        if (!container) return;

        const items = Array.from(container.children) as HTMLElement[];
        const from = getFrom(animation);
        const to = getTo(animation);

        const anim = gsap.fromTo(items, from, {
            ...to,
            duration,
            delay: baseDelay / 1000,
            stagger: staggerDelay / 1000,
            ease: "power3.out",
            scrollTrigger: {
                trigger: container,
                start: "top 82%",
                end: "top 20%",
                scrub: scrub || false,
                toggleActions: scrub ? undefined : "play none none none",
            },
        });

        return () => {
            anim.scrollTrigger?.kill();
            anim.kill();
        };
    }, [animation, staggerDelay, baseDelay, duration, scrub]);

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}
