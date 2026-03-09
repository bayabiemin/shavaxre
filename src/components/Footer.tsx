"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import { useLang } from "@/contexts/LangContext";

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const { t } = useLang();
    const footerRef = useRef<HTMLElement>(null);
    const megaTextRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mega = megaTextRef.current;
        const footer = footerRef.current;
        if (!mega || !footer) return;

        const anim = gsap.fromTo(
            mega,
            { clipPath: "inset(0% 50% 0% 50%)", opacity: 0.05 },
            {
                clipPath: "inset(0% 0% 0% 0%)",
                opacity: 0.18,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: footer,
                    start: "top 85%",
                    end: "top 15%",
                    scrub: 1,
                },
            }
        );

        return () => {
            anim.scrollTrigger?.kill();
            anim.kill();
        };
    }, []);

    const taglineParts = t("footer.tagline").split("\n");

    return (
        <footer ref={footerRef} className="footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <span className="logo-sha">Sha</span>
                        <span className="logo-vax">(vax)</span>
                        <span className="logo-re">re</span>
                    </div>
                    <p className="footer-tagline">
                        {taglineParts[0]}<br />
                        {taglineParts[1] || ""}
                    </p>
                </div>

                <div className="footer-nav">
                    <h4 className="footer-nav-title">{t("footer.platform")}</h4>
                    <Link href="/campaigns" className="footer-link">{t("footer.browse")}</Link>
                    <Link href="/create" className="footer-link">{t("footer.create")}</Link>
                </div>

                <div className="footer-chain-info">
                    <h4 className="footer-nav-title">{t("footer.onChain")}</h4>
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

            <div ref={megaTextRef} className="footer-mega" aria-hidden="true">
                SHA(VAX)RE
            </div>

            <div className="footer-bottom">
                <span>© 2026 Sha(vax)re</span>
                <span>{t("footer.builtOn")}</span>
                <a href="https://build.avax.network" target="_blank" rel="noreferrer" className="footer-bottom-link">
                    Avalanche Build Games 2026
                </a>
            </div>
        </footer>
    );
}
