"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { JsonRpcProvider } from "ethers";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWallet } from "@/components/WalletProvider";
import CampaignCard from "@/components/CampaignCard";
import ScrollReveal, { StaggerContainer } from "@/components/ScrollReveal";
import SectionLabel from "@/components/SectionLabel";
import CountUp from "@/components/CountUp";
import ScrollIndicator from "@/components/ScrollIndicator";
import { getActiveCampaigns, getContract, CampaignDisplay } from "@/lib/contract";

gsap.registerPlugin(ScrollTrigger);

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

// ─── Typewriter label (CSS-only, no IO) ────────────────────────
function TypewriterLabel({ text }: { text: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setCount(c => {
                if (c >= text.length) { clearInterval(id); return c; }
                return c + 1;
            });
        }, 38);
        const timer = setTimeout(() => clearInterval(id), text.length * 38 + 500);
        return () => { clearInterval(id); clearTimeout(timer); };
    }, [text]);

    return (
        <div className="hero-label">
            {text.split("").map((ch, i) => (
                <span
                    key={i}
                    className="hero-label-char"
                    style={{ animationDelay: `${i * 38}ms`, opacity: i < count ? undefined : 0 }}
                >
                    {ch}
                </span>
            ))}
        </div>
    );
}

// ─── Statement section — GSAP PIN + white wipe + word reveal ───
function StatementSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

    const text = "Where blockchain meets education, every AVAX creates a future.";
    const words = text.split(" ");

    useEffect(() => {
        const section = sectionRef.current;
        const bg = bgRef.current;
        const wordEls = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
        if (!section || !bg || wordEls.length === 0) return;

        // Set initial states
        gsap.set(bg, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(wordEls, { opacity: 0, y: 20 });

        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "+=200%",
                    scrub: 1,
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1,
                },
            });

            // Phase 1: white wipe
            tl.to(bg, { scaleX: 1, ease: "none", duration: 0.4 });

            // Phase 2: word-by-word reveal
            wordEls.forEach((word, i) => {
                tl.to(word, { opacity: 1, y: 0, ease: "none", duration: 0.05 }, 0.42 + i * 0.04);
            });

            return () => { tl.kill(); };
        });

        mm.add("(max-width: 767px)", () => {
            // Mobile: simple fade-in without pin
            gsap.to(bg, {
                scaleX: 1, ease: "power2.out", duration: 1,
                scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none none" },
            });
            gsap.to(wordEls, {
                opacity: 1, y: 0, stagger: 0.04, duration: 0.5, ease: "power2.out",
                scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none none" },
            });
            return () => {};
        });

        return () => mm.revert();
    }, []);

    return (
        <section ref={sectionRef} className="statement-section">
            <div ref={bgRef} className="statement-wipe-bg" />
            <div className="statement-content">
                <SectionLabel text="The Solution" light />
                <p className="statement-quote">
                    {words.map((word, i) => (
                        <span
                            key={i}
                            ref={(el) => { wordRefs.current[i] = el; }}
                            className="statement-word"
                        >
                            {word}{" "}
                        </span>
                    ))}
                </p>
            </div>
        </section>
    );
}

// ─── Impact section — GSAP PIN + red wipe + quote pop ──────────
function ImpactSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const redOverlayRef = useRef<HTMLDivElement>(null);
    const quoteRef = useRef<HTMLParagraphElement>(null);
    const attrRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const section = sectionRef.current;
        const overlay = redOverlayRef.current;
        const quote = quoteRef.current;
        const attr = attrRef.current;
        if (!section || !overlay || !quote || !attr) return;

        // Initial states
        gsap.set(overlay, { scaleX: 0, transformOrigin: "right center" });
        gsap.set(quote, { scale: 0.5, opacity: 0 });
        gsap.set(attr, { y: 20, opacity: 0 });

        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: "top top",
                    end: "+=200%",
                    scrub: 1,
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1,
                },
            });

            // Phase 1: red wipe
            tl.to(overlay, { scaleX: 1, ease: "none", duration: 0.4 });
            // Phase 2: quote pop-in
            tl.to(quote, { scale: 1, opacity: 1, ease: "back.out(1.7)", duration: 0.3 }, 0.45);
            // Phase 3: attribution
            tl.to(attr, { y: 0, opacity: 1, ease: "none", duration: 0.15 }, 0.7);

            return () => { tl.kill(); };
        });

        mm.add("(max-width: 767px)", () => {
            gsap.to(overlay, {
                scaleX: 1, duration: 1, ease: "power2.out",
                scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none none" },
            });
            gsap.to([quote, attr], {
                scale: 1, opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease: "power2.out",
                scrollTrigger: { trigger: section, start: "top 70%", toggleActions: "play none none none" },
            });
            return () => {};
        });

        return () => mm.revert();
    }, []);

    return (
        <section ref={sectionRef} className="impact-section">
            <div ref={redOverlayRef} className="impact-wipe-bg" />
            <div className="impact-inner">
                <p ref={quoteRef} className="impact-quote">
                    &ldquo;Education funded on-chain is education that can&rsquo;t be stolen.&rdquo;
                </p>
                <span ref={attrRef} className="impact-source">
                    Sha(vax)re &nbsp;·&nbsp; Built on Avalanche &nbsp;·&nbsp; Build Games 2026
                </span>
            </div>
        </section>
    );
}

// ─── How-it-works card with GSAP connector ─────────────────────
function HowCard({ num, title, description, icon, connectorAfter }: {
    num: string; title: string; description: string;
    icon: React.ReactNode; connectorAfter?: boolean;
}) {
    const connRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!connectorAfter || !connRef.current) return;
        const line = connRef.current.querySelector(".how-connector-line") as HTMLElement;
        if (!line) return;

        gsap.set(line, { width: 0 });
        const anim = gsap.to(line, {
            width: "100%",
            ease: "power2.out",
            scrollTrigger: {
                trigger: connRef.current,
                start: "top 70%",
                end: "top 30%",
                scrub: 1,
            },
        });

        return () => {
            anim.scrollTrigger?.kill();
            anim.kill();
        };
    }, [connectorAfter]);

    return (
        <>
            <div className="how-card">
                <div className="how-number">{num}</div>
                <div className="how-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
            {connectorAfter && (
                <div ref={connRef} className="how-connector">
                    <div className="how-connector-line" />
                </div>
            )}
        </>
    );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function Home() {
    const { connect, isConnected } = useWallet();
    const [featured, setFeatured] = useState<CampaignDisplay[]>([]);
    const [stats, setStats] = useState({ campaigns: 0, raised: 0, donors: 0 });

    // Hero refs for parallax
    const heroRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);

    // Load live stats
    useEffect(() => {
        async function load() {
            try {
                const provider = new JsonRpcProvider(FUJI_RPC);
                const contract = getContract(provider);
                const [campaigns, count] = await Promise.all([
                    getActiveCampaigns(provider),
                    contract.campaignCount(),
                ]);
                setFeatured(campaigns.slice(-3).reverse());

                const n = Number(count);
                let totalRaised = 0n;
                let totalDonors = 0;
                for (let i = 0; i < n; i++) {
                    const c = await contract.getCampaign(i);
                    totalRaised += c.raisedAmount;
                    totalDonors += Number(c.donorCount);
                }
                setStats({
                    campaigns: n,
                    raised: Math.round(Number(totalRaised) / 1e14) / 1e4,
                    donors: totalDonors,
                });
            } catch (e) {
                console.error("Failed to load stats:", e);
            }
        }
        load();
    }, []);

    // Hero PIN + parallax fade-out
    useEffect(() => {
        const hero = heroRef.current;
        const title = titleRef.current;
        const subtitle = subtitleRef.current;
        const cta = ctaRef.current;
        if (!hero || !title || !subtitle || !cta) return;

        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "+=100%",
                    scrub: 1,
                    pin: true,
                    pinSpacing: true,
                    anticipatePin: 1,
                },
            });

            tl.to(title,    { y: -120, opacity: 0, ease: "none" }, 0)
              .to(subtitle,  { y: -70,  opacity: 0, ease: "none" }, 0)
              .to(cta,       { y: -40,  opacity: 0, ease: "none" }, 0.05);

            return () => { tl.kill(); };
        });

        return () => mm.revert();
    }, []);

    return (
        <div className="home">

            {/* ══════════════════════════════════════════════
                SCENE 1 — HERO (PIN + PARALLAX)
            ══════════════════════════════════════════════ */}
            <section ref={heroRef} className="hero">
                <div className="hero-watermark" aria-hidden="true">SHA(VAX)RE</div>

                <div className="hero-content">
                    <TypewriterLabel text="DECENTRALIZED EDUCATION ON AVALANCHE" />

                    <h1 ref={titleRef} className="hero-title">
                        <span className="hero-line hero-line-white">
                            <span className="hero-line-inner">Fund Education.</span>
                        </span>
                        <span className="hero-line hero-line-accent">
                            <span className="hero-line-inner">Change Lives.</span>
                        </span>
                    </h1>

                    <p ref={subtitleRef} className="hero-subtitle">
                        Zero commission, zero middlemen.<br />
                        Direct AVAX donations on Avalanche.
                    </p>

                    <div ref={ctaRef} className="hero-actions">
                        <Link href="/create" className="btn-primary">Start a Campaign</Link>
                        <Link href="/campaigns" className="btn-secondary">Explore Campaigns</Link>
                        {!isConnected && (
                            <button onClick={connect} className="btn-secondary">Connect Wallet</button>
                        )}
                    </div>
                </div>

                <ScrollIndicator />
            </section>

            {/* ══════════════════════════════════════════════
                SCENE 2 — PROBLEM
                Sticky left stats, scrolling right text
            ══════════════════════════════════════════════ */}
            <section className="problem-section">
                <div className="problem-inner">
                    <div className="problem-stats">
                        <ScrollReveal animation="fade-right" duration={0.9}>
                            <div className="problem-stat">
                                <span className="problem-stat-number">
                                    <CountUp end={244} suffix="M" />
                                </span>
                                <span className="problem-stat-label">Children out of school globally</span>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal animation="fade-right" delay={150} duration={0.9}>
                            <div className="problem-stat">
                                <span className="problem-stat-number">
                                    <CountUp prefix="$" end={39} suffix="B" />
                                </span>
                                <span className="problem-stat-label">Annual education funding gap</span>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal animation="fade-right" delay={300} duration={0.9}>
                            <div className="problem-stat">
                                <span className="problem-stat-number">
                                    <CountUp end={68} suffix="%" />
                                </span>
                                <span className="problem-stat-label">Of donations lost to middlemen</span>
                            </div>
                        </ScrollReveal>
                    </div>

                    <ScrollReveal animation="fade-left" duration={1}>
                        <div className="problem-text">
                            <SectionLabel text="The Problem" />
                            <h2>Traditional education funding is broken.</h2>
                            <p>
                                Bureaucracy eats donations. Students never see the money.
                                Platforms charge 10–30% commission. Transactions take weeks.
                                The system was designed for institutions — not students.
                            </p>
                            <br />
                            <p>
                                Sha(vax)re fixes this with blockchain. Every donation reaches
                                the student directly, instantly, with zero fees — all verifiable
                                on-chain.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ══════════════════════════════════════════════
                SCENE 3 — HOW IT WORKS
                Scrub stagger + connector draw
            ══════════════════════════════════════════════ */}
            <section className="how-section">
                <ScrollReveal animation="blur-in" duration={0.8}>
                    <div className="how-header">
                        <SectionLabel text="How It Works" />
                        <h2>Three steps. Zero friction.</h2>
                    </div>
                </ScrollReveal>

                <StaggerContainer animation="scale-up" staggerDelay={200} duration={0.75} className="how-grid">
                    <HowCard
                        num="001 · CREATE"
                        title="Create a Campaign"
                        description="Students publish their education goal on-chain. Every detail is permanent and publicly verifiable on Avalanche."
                        icon={
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="24" height="24" rx="3" />
                                <line x1="15" y1="9" x2="15" y2="21" />
                                <line x1="9" y1="15" x2="21" y2="15" />
                            </svg>
                        }
                        connectorAfter
                    />
                    <HowCard
                        num="002 · DONATE"
                        title="Donate AVAX Directly"
                        description="Donors send AVAX straight to the smart contract. Zero commission. Funds locked until the student claims them."
                        icon={
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 5L25 15L15 25" />
                                <line x1="5" y1="15" x2="25" y2="15" />
                            </svg>
                        }
                        connectorAfter
                    />
                    <HowCard
                        num="003 · IMPACT"
                        title="Student Claims Funds"
                        description="When ready, the student calls claimFunds(). 100% goes straight to their wallet — no paperwork, no waiting."
                        icon={
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="5 18 11 12 16 17 25 8" />
                            </svg>
                        }
                    />
                </StaggerContainer>
            </section>

            {/* ══════════════════════════════════════════════
                SCENE 4 — STATEMENT (PIN + WHITE WIPE)
            ══════════════════════════════════════════════ */}
            <StatementSection />

            {/* ══════════════════════════════════════════════
                SCENE 5A — LIVE STATS
            ══════════════════════════════════════════════ */}
            <section className="stats-section">
                <StaggerContainer animation="fade-up" staggerDelay={120} duration={0.7} className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-icon">🎓</span>
                        <h3 className="stat-value">{stats.campaigns}</h3>
                        <p className="stat-label">Campaigns Created</p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">💸</span>
                        <h3 className="stat-value">0%</h3>
                        <p className="stat-label">Platform Commission</p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🔗</span>
                        <h3 className="stat-value">{stats.raised} AVAX</h3>
                        <p className="stat-label">Total Raised</p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-icon">🤝</span>
                        <h3 className="stat-value">{stats.donors}</h3>
                        <p className="stat-label">Total Donors</p>
                    </div>
                </StaggerContainer>
            </section>

            {/* ══════════════════════════════════════════════
                SCENE 5B — ACTIVE CAMPAIGNS
            ══════════════════════════════════════════════ */}
            {featured.length > 0 && (
                <section className="campaigns-section">
                    <ScrollReveal animation="fade-up" duration={0.7}>
                        <div className="campaigns-header">
                            <div>
                                <SectionLabel text="Active Campaigns" />
                                <h2>Funding dreams, on-chain.</h2>
                            </div>
                            <Link href="/campaigns" className="campaigns-view-all">
                                View All →
                            </Link>
                        </div>
                    </ScrollReveal>

                    <StaggerContainer animation="scale-up" staggerDelay={150} duration={0.7} className="campaigns-grid">
                        {featured.map(c => <CampaignCard key={c.id} {...c} />)}
                    </StaggerContainer>
                </section>
            )}

            {/* ══════════════════════════════════════════════
                SCENE 5C — WHY AVALANCHE
            ══════════════════════════════════════════════ */}
            <section className="avax-section">
                <ScrollReveal animation="blur-in" duration={0.8}>
                    <div className="avax-header">
                        <SectionLabel text="Why Avalanche" />
                        <h2>Built for speed. Designed for impact.</h2>
                    </div>
                </ScrollReveal>

                <StaggerContainer animation="scale-up" staggerDelay={120} duration={0.7} className="avax-grid">
                    <div className="avax-card">
                        <span className="avax-metric">&lt; 1s</span>
                        <h3>Finality</h3>
                        <p>Donations confirm in under 1 second. Students see funds instantly — no waiting, no limbo.</p>
                    </div>
                    <div className="avax-card">
                        <span className="avax-metric">$0.02</span>
                        <h3>Avg Gas Fee</h3>
                        <p>Compared to <span className="avax-compare">$3.50+ on Ethereum</span>. More of your donation reaches the student.</p>
                    </div>
                    <div className="avax-card">
                        <span className="avax-metric">100%</span>
                        <h3>On-Chain</h3>
                        <p>Every transaction verifiable on Snowtrace. Zero off-chain databases — full trustless transparency.</p>
                    </div>
                </StaggerContainer>

                <ScrollReveal animation="fade-up" duration={0.6} delay={200}>
                    <div className="avax-footer-cta">
                        <span className="avax-powered">Powered by Avalanche C-Chain</span>
                        <a
                            href="https://testnet.snowtrace.io/address/0xfaDa353b9300Fc82B72a25B7E59867f4D0376cbd"
                            target="_blank"
                            rel="noreferrer"
                            className="avax-contract-link"
                        >
                            View Contract on Snowtrace ↗
                        </a>
                    </div>
                </ScrollReveal>
            </section>

            {/* ══════════════════════════════════════════════
                SCENE 6 — IMPACT (PIN + RED WIPE)
            ══════════════════════════════════════════════ */}
            <ImpactSection />

        </div>
    );
}
