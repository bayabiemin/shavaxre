"use client";

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            smoothWheel: true,
        });
        lenisRef.current = lenis;

        // Sync Lenis with GSAP ScrollTrigger
        const onScroll = () => ScrollTrigger.update();
        lenis.on("scroll", onScroll);

        const rafFn = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(rafFn);
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.off("scroll", onScroll);
            gsap.ticker.remove(rafFn);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
