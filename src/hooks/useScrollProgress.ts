"use client";

import { useEffect, useState } from "react";

export function useScrollProgress(): number {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handle = () => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(total > 0 ? window.scrollY / total : 0);
        };
        window.addEventListener("scroll", handle, { passive: true });
        handle();
        return () => window.removeEventListener("scroll", handle);
    }, []);

    return progress;
}

export function useScrollY(): number {
    const [y, setY] = useState(0);

    useEffect(() => {
        const handle = () => setY(window.scrollY);
        window.addEventListener("scroll", handle, { passive: true });
        return () => window.removeEventListener("scroll", handle);
    }, []);

    return y;
}
