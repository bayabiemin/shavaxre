"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface CountUpProps {
    end: number;
    suffix?: string;
    prefix?: string;
    duration?: number;   // kept for API compat, ignored with scrub
    decimals?: number;
    className?: string;
}

export default function CountUp({
    end,
    suffix = "",
    prefix = "",
    decimals = 0,
    className = "",
}: CountUpProps) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const counter = { val: 0 };
        const factor = Math.pow(10, decimals);

        const anim = gsap.to(counter, {
            val: end,
            ease: "none",
            scrollTrigger: {
                trigger: el,
                start: "top 75%",
                end: "top 10%",
                scrub: 1,
            },
            onUpdate: () => {
                const v = decimals > 0
                    ? (Math.round(counter.val * factor) / factor).toFixed(decimals)
                    : Math.round(counter.val).toLocaleString();
                el.textContent = `${prefix}${v}${suffix}`;
            },
        });

        return () => {
            anim.scrollTrigger?.kill();
            anim.kill();
        };
    }, [end, prefix, suffix, decimals]);

    return (
        <span ref={ref} className={className}>
            {prefix}0{suffix}
        </span>
    );
}
