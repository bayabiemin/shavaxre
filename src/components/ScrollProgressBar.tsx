"use client";

import { useScrollProgress } from "@/hooks/useScrollProgress";

export default function ScrollProgressBar() {
    const progress = useScrollProgress();

    return (
        <div className="scroll-progress" aria-hidden="true">
            <div
                className="scroll-progress-fill"
                style={{ height: `${progress * 100}%` }}
            />
        </div>
    );
}
