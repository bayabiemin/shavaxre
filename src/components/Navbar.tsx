"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useWallet } from "./WalletProvider";
import { useTheme } from "@/contexts/ThemeContext";
import { useLang } from "@/contexts/LangContext";

export default function Navbar() {
    const { address, isConnecting, isConnected, connect, disconnect } = useWallet();
    const { theme, toggle: toggleTheme } = useTheme();
    const { lang, toggle: toggleLang, t } = useLang();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (v) => {
        setScrolled(v > 60);
    });

    const short = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

    const navLinks = [
        { href: "/", label: t("nav.home") },
        { href: "/campaigns", label: t("nav.campaigns") },
        { href: "/create", label: t("nav.create") },
        ...(isConnected ? [{ href: "/dashboard", label: t("nav.dashboard") }] : []),
    ];

    const isDark = theme === "dark";
    const navBg = scrolled
        ? isDark ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.85)"
        : isDark ? "rgba(0, 0, 0, 0)" : "rgba(255, 255, 255, 0)";
    const navBorder = scrolled
        ? isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)"
        : "rgba(0,0,0,0)";
    const navShadow = scrolled
        ? isDark ? "0 4px 30px rgba(0, 0, 0, 0.4)" : "0 2px 20px rgba(0,0,0,0.06)"
        : "0 0 0 rgba(0,0,0,0)";

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
                    background: navBg,
                    borderColor: navBorder,
                    backdropFilter: scrolled ? "blur(24px)" : "blur(0px)",
                    boxShadow: navShadow,
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
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`nav-link${pathname === link.href ? " nav-link--active" : ""}`}
                            style={{ position: "relative" }}
                        >
                            <span>{link.label}</span>
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

                <div className="navbar-actions">
                    {/* Language Toggle */}
                    <motion.button
                        onClick={toggleLang}
                        className="navbar-toggle-btn"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={lang === "en" ? "Türkçe'ye geç" : "Switch to English"}
                    >
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={lang}
                                initial={{ y: -12, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 12, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{ display: "block", lineHeight: 1 }}
                            >
                                {lang === "en" ? "TR" : "EN"}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>

                    {/* Theme Toggle */}
                    <motion.button
                        onClick={toggleTheme}
                        className="navbar-toggle-btn"
                        whileHover={{ scale: 1.1, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                        title={isDark ? "Light mode" : "Dark mode"}
                    >
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={theme}
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 90 }}
                                transition={{ duration: 0.25 }}
                                style={{ display: "block", fontSize: "1rem", lineHeight: 1 }}
                            >
                                {isDark ? "☀" : "☾"}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>

                    {/* Wallet */}
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
                                        t("nav.connect")
                                    )}
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </motion.nav>
    );
}
