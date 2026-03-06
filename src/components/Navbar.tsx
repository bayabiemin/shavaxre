"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useWallet } from "./WalletProvider";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
    const { address, isConnecting, isConnected, connect, disconnect } = useWallet();
    const navRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = navRef.current;
        if (!el) return;

        const st = ScrollTrigger.create({
            trigger: document.body,
            start: "top top-=80",
            onEnter: () => el.classList.add("navbar--scrolled"),
            onLeaveBack: () => el.classList.remove("navbar--scrolled"),
        });

        return () => st.kill();
    }, []);

    const short = address
        ? `${address.slice(0, 6)}…${address.slice(-4)}`
        : "";

    return (
        <nav ref={navRef} className="navbar">
            <div className="navbar-inner">
                <Link href="/" className="navbar-logo">
                    <span className="logo-sha">Sha</span>
                    <span className="logo-vax">(vax)</span>
                    <span className="logo-re">re</span>
                </Link>

                <div className="navbar-links">
                    <Link href="/campaigns" className="nav-link">Campaigns</Link>
                    <Link href="/create" className="nav-link">Create</Link>
                    {isConnected && (
                        <Link href="/dashboard" className="nav-link">Dashboard</Link>
                    )}
                </div>

                <div className="navbar-wallet">
                    {isConnected ? (
                        <div className="wallet-connected">
                            <span className="wallet-dot" />
                            <span className="wallet-address">{short}</span>
                            <button onClick={disconnect} className="btn-disconnect" aria-label="Disconnect">✕</button>
                        </div>
                    ) : (
                        <button onClick={connect} disabled={isConnecting} className="btn-connect">
                            {isConnecting ? <span className="spinner" /> : "Connect Wallet"}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
