"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useWallet } from "./WalletProvider";

export default function Navbar() {
    const { address, isConnecting, isConnected, connect, disconnect } = useWallet();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (v) => {
        setScrolled(v > 60);
    });

    const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/campaigns", label: "Campaigns" },
        { href: "/create", label: "Create" },
        ...(isConnected ? [{ href: "/dashboard", label: "Dashboard" }] : []),
    ];

    return (
        <motion.nav
            className="navbar"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
            <motion.div
                className="navbar-inner"
                animate={{
                    background: scrolled ? "rgba(0, 0, 0, 0.85)" : "rgba(0, 0, 0, 0)",
                    borderColor: scrolled ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0)",
                    backdropFilter: scrolled ? "blur(24px)" : "blur(0px)",
                    boxShadow: scrolled ? "0 4px 30px rgba(0, 0, 0, 0.4)" : "0 0 0 rgba(0,0,0,0)",
                }}
                transition={{ duration: 0.35, ease: "easeOut" }}
            >
                <Link href="/" className="navbar-logo">
                    <motion.span
                        className="logo-sha"
                        whileHover={{ color: "var(--accent)" }}
                        transition={{ duration: 0.2 }}
                    >
                        Sha
                    </motion.span>
                    <span className="logo-vax">(vax)</span>
                    <span className="logo-re">re</span>
                </Link>

                <div className="navbar-links">
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className="nav-link" style={{ position: "relative" }}>
                            <motion.span
                                whileHover={{ color: "#fff" }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    color: pathname === link.href ? "var(--accent)" : undefined,
                                }}
                            >
                                {link.label}
                            </motion.span>
                            {pathname === link.href && (
                                <motion.div
                                    layoutId="nav-indicator"
                                    style={{
                                        position: "absolute",
                                        bottom: 2,
                                        left: "50%",
                                        width: 4,
                                        height: 4,
                                        borderRadius: "50%",
                                        background: "var(--accent)",
                                        transform: "translateX(-50%)",
                                    }}
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </Link>
                    ))}
                </div>

                <div className="navbar-wallet">
                    <AnimatePresence mode="wait">
                        {isConnected ? (
                            <motion.div
                                key="connected"
                                className="wallet-connected"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.25 }}
                            >
                                <motion.span
                                    className="wallet-dot"
                                    animate={{ scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span className="wallet-address">{short}</span>
                                <button onClick={disconnect} className="btn-disconnect" aria-label="Disconnect">✕</button>
                            </motion.div>
                        ) : (
                            <motion.button
                                key="connect"
                                onClick={connect}
                                disabled={isConnecting}
                                className="btn-connect"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ scale: 1.05, boxShadow: "0 0 25px var(--accent-glow)" }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isConnecting ? (
                                    <motion.span
                                        className="spinner"
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 0.6, ease: "linear" }}
                                    />
                                ) : (
                                    "Connect Wallet"
                                )}
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.nav>
    );
}
