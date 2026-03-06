"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CONTRACT_ADDRESS } from "@/lib/contract";

function FooterMega() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
            { threshold: 0.2 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`footer-mega ${visible ? "mega-visible" : ""}`} aria-hidden="true">
            SHA(VAX)RE
        </div>
    );
}

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <span className="logo-sha">Sha</span>
                        <span className="logo-vax">(vax)</span>
                        <span className="logo-re">re</span>
                    </div>
                    <p className="footer-tagline">
                        Decentralized education funding on Avalanche.<br />
                        Transparent. Trustless. Direct.
                    </p>
                </div>

                <div className="footer-nav">
                    <h4 className="footer-nav-title">Platform</h4>
                    <Link href="/campaigns" className="footer-link">Browse Campaigns</Link>
                    <Link href="/create" className="footer-link">Create Campaign</Link>
                </div>

                <div className="footer-chain-info">
                    <h4 className="footer-nav-title">On-Chain</h4>
                    <a
                        href={`https://testnet.snowtrace.io/address/${CONTRACT_ADDRESS}`}
                        target="_blank" rel="noreferrer"
                        className="footer-contract"
                    >
                        {CONTRACT_ADDRESS.slice(0, 10)}…{CONTRACT_ADDRESS.slice(-8)}
                    </a>
                    <a href="https://docs.avax.network/" target="_blank" rel="noreferrer" className="footer-link">
                        Avalanche Docs ↗
                    </a>
                    <a href="https://testnet.snowtrace.io/" target="_blank" rel="noreferrer" className="footer-link">
                        Snowtrace Explorer ↗
                    </a>
                </div>
            </div>

            <FooterMega />

            <div className="footer-bottom">
                <span>© 2026 Sha(vax)re</span>
                <span>Built on Avalanche · Fuji Testnet</span>
                <a href="https://build.avax.network" target="_blank" rel="noreferrer" className="footer-bottom-link">
                    Avalanche Build Games 2026
                </a>
            </div>
        </footer>
    );
}
