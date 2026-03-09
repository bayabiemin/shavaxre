"use client";

import { motion } from "framer-motion";

const COLORS = ["#f59e0b", "#ef4444", "#10b981", "#6366f1", "#ec4899", "#f97316"];

export default function Confetti({ count = 35 }: { count?: number }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: -10,
            backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
          initial={{ y: -20, opacity: 1, scale: 1, rotate: 0 }}
          animate={{
            y: typeof window !== "undefined" ? window.innerHeight + 50 : 900,
            opacity: 0,
            rotate: Math.random() * 720 - 360,
            x: (Math.random() - 0.5) * 300,
            scale: Math.random() * 0.5 + 0.5,
          }}
          transition={{
            duration: 1.5 + Math.random() * 1,
            delay: Math.random() * 0.4,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
