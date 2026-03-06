"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
    end: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
    decimals?: number;
    className?: string;
}

export default function CountUp({
    end,
    suffix = "",
    prefix = "",
    duration = 2200,
    decimals = 0,
    className = "",
}: CountUpProps) {
    const [value, setValue] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    const startTime = performance.now();

                    const animate = (now: number) => {
                        const elapsed = now - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const factor = Math.pow(10, decimals);
                        setValue(Math.floor(eased * end * factor) / factor);
                        if (progress < 1) requestAnimationFrame(animate);
                        else setValue(end);
                    };

                    requestAnimationFrame(animate);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.4 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [end, duration, decimals]);

    const formatted =
        decimals > 0
            ? value.toFixed(decimals)
            : Math.floor(value).toLocaleString();

    return (
        <span ref={ref} className={className}>
            {prefix}{formatted}{suffix}
        </span>
    );
}
