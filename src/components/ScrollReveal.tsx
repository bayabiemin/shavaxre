"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════
//  ScrollReveal — Intersection Observer based scroll animations
//  Cinematic reveal effects for Sha(vax)re sections
// ═══════════════════════════════════════════════════════════════

type AnimationType =
    | "fade-up"
    | "fade-down"
    | "fade-left"
    | "fade-right"
    | "scale-up"
    | "blur-in"
    | "glow-in";

interface ScrollRevealProps {
    children: ReactNode;
    animation?: AnimationType;
    delay?: number;       // ms
    duration?: number;    // ms
    threshold?: number;   // 0-1
    className?: string;
    stagger?: number;     // ms between children
    once?: boolean;       // animate only once
}

export default function ScrollReveal({
    children,
    animation = "fade-up",
    delay = 0,
    duration = 800,
    threshold = 0.15,
    className = "",
    once = true,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.unobserve(el);
                } else if (!once) {
                    setIsVisible(false);
                }
            },
            { threshold, rootMargin: "0px 0px -50px 0px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold, once]);

    return (
        <div
            ref={ref}
            className={`scroll-reveal ${animation} ${isVisible ? "revealed" : ""} ${className}`}
            style={{
                transitionDelay: `${delay}ms`,
                transitionDuration: `${duration}ms`,
            }}
        >
            {children}
        </div>
    );
}

// ─── Staggered children wrapper ───
interface StaggerContainerProps {
    children: ReactNode[];
    animation?: AnimationType;
    staggerDelay?: number;
    baseDelay?: number;
    duration?: number;
    threshold?: number;
    className?: string;
}

export function StaggerContainer({
    children,
    animation = "fade-up",
    staggerDelay = 120,
    baseDelay = 0,
    duration = 700,
    threshold = 0.1,
    className = "",
}: StaggerContainerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold, rootMargin: "0px 0px -30px 0px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return (
        <div ref={ref} className={className}>
            {Array.isArray(children) && children.map((child, i) => (
                <div
                    key={i}
                    className={`scroll-reveal ${animation} ${isVisible ? "revealed" : ""}`}
                    style={{
                        transitionDelay: `${baseDelay + i * staggerDelay}ms`,
                        transitionDuration: `${duration}ms`,
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
}
