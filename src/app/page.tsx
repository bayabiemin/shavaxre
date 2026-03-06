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
import ScrollIndicator from "@/components/ScrollIndicator";
import { getActiveCampaigns, getContract, CampaignDisplay } from "@/lib/contract";

gsap.registerPlugin(ScrollTrigger);

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

// ─── Typewriter label ────────────────────────────────────────────
function TypewriterLabel({ text }: { text: string }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const id = setInterval(() => {
            setCount(c => { if (c >= text.length) { clearInterval(id); return c; } return c + 1; });
        }, 38);
        const timer = setTimeout(() => clearInterval(id), text.length * 38 + 500);
        return () => { clearInterval(id); clearTimeout(timer); };
    }, [text]);
    return (
        <div className="hero-label">
            {text.split("").map((ch, i) => (
                <span key={i} className="hero-label-char"
                    style={{ animationDelay: `${i * 38}ms`, opacity: i < count ? undefined : 0 }}>
                    {ch}
                </span>
            ))}
        </div>
    );
}

// ─── Comparison table data ────────────────────────────────────────
const compareData = [
    { label: "Platform Fee",   gofundme: "5–7%",       bank: "3–8% + fees",    us: "0%" },
    { label: "Transfer Speed", gofundme: "2–5 days",   bank: "3–7 days",       us: "< 1 second" },
    { label: "Transparency",   gofundme: "None",       bank: "None",           us: "100% on-chain" },
    { label: "Global Access",  gofundme: "Limited",    bank: "Very limited",   us: "Permissionless" },
];

// ─── Student stories (placeholder — real campaigns populate this) ─
const studentStories = [
    {
        initials: "MA", name: "Mehmet A.", age: 21,
        field: "Computer Science", city: "Ankara · Turkey", emoji: "💻",
        raisedAvax: "2.1", goalAvax: "2.5",
        daysText: "Funded in 48 hours", label: "Textbooks & equipment",
    },
    {
        initials: "AO", name: "Amara O.", age: 19,
        field: "Medicine", city: "Lagos · Nigeria", emoji: "🩺",
        raisedAvax: "4.8", goalAvax: "5.0",
        daysText: "Funded in 3 days", label: "Semester tuition",
    },
    {
        initials: "LW", name: "Li W.", age: 22,
        field: "Engineering", city: "Jakarta · Indonesia", emoji: "⚙️",
        raisedAvax: "1.9", goalAvax: "1.9",
        daysText: "Fully funded · 0% fees", label: "Lab equipment",
    },
];

// ─── Statement section — sticky scroll + scrub word reveal ────────
function StatementSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const labelRef = useRef<HTMLDivElement>(null);

    const text = "Every AVAX you send arrives in full. No middleman. No cut. No delay.";
    const words = text.split(" ");

    useEffect(() => {
        const container = containerRef.current;
        const wordEls = wordRefs.current.filter(Boolean) as HTMLSpanElement[];
        if (!container || wordEls.length === 0) return;

        gsap.set(wordEls, { opacity: 0.06, y: 18 });
        if (labelRef.current) gsap.set(labelRef.current, { opacity: 0, y: 12 });

        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: { trigger: container, start: "top top", end: "bottom bottom", scrub: 1.5 },
            });
            if (labelRef.current) tl.to(labelRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "none" }, 0);
            tl.to(wordEls, { opacity: 1, y: 0, stagger: 0.7, duration: 0.6, ease: "none" }, 0.4);
            return () => { tl.kill(); };
        });

        mm.add("(max-width: 767px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: { trigger: container, start: "top 70%", toggleActions: "play none none none" },
            });
            if (labelRef.current) tl.to(labelRef.current, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
            tl.to(wordEls, { opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: "power3.out" }, "-=0.2");
            return () => { tl.kill(); };
        });

        return () => mm.revert();
    }, []);

    return (
        <div ref={containerRef} className="statement-scroll-container">
            <section className="statement-section">
                <div className="statement-content">
                    <div ref={labelRef}><SectionLabel text="The Solution" light /></div>
                    <p className="statement-quote">
                        {words.map((word, i) => (
                            <span key={i} ref={(el) => { wordRefs.current[i] = el; }} className="statement-word">
                                {word}{" "}
                            </span>
                        ))}
                    </p>
                </div>
            </section>
        </div>
    );
}

// ─── Impact section — sticky scroll + scrub quote reveal ──────────
function ImpactSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const quoteRef = useRef<HTMLParagraphElement>(null);
    const attrRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const quote = quoteRef.current;
        const attr = attrRef.current;
        if (!container || !quote || !attr) return;

        gsap.set(quote, { scale: 0.72, opacity: 0 });
        gsap.set(attr, { opacity: 0, y: 20 });

        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: { trigger: container, start: "top top", end: "bottom bottom", scrub: 1.5 },
            });
            tl.to(quote, { scale: 1, opacity: 1, duration: 3, ease: "none" }, 0)
              .to(attr,  { opacity: 1, y: 0, duration: 2, ease: "none" }, 2);
            return () => { tl.kill(); };
        });

        mm.add("(max-width: 767px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: { trigger: container, start: "top 70%", toggleActions: "play none none none" },
            });
            tl.to(quote, { scale: 1, opacity: 1, duration: 1, ease: "power3.out" })
              .to(attr,  { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.4");
            return () => { tl.kill(); };
        });

        return () => mm.revert();
    }, []);

    return (
        <div ref={containerRef} className="impact-scroll-container">
            <section className="impact-section">
                <div className="impact-inner">
                    <p ref={quoteRef} className="impact-quote">
                        &ldquo;GoFundMe would have taken $280 from that $4,000 campaign.
                        On Sha(vax)re, every cent reached the student.&rdquo;
                    </p>
                    <span ref={attrRef} className="impact-source">
                        Real impact &nbsp;·&nbsp; Verified on Avalanche &nbsp;·&nbsp; Build Games 2026
                    </span>
                </div>
            </section>
        </div>
    );
}

// ─── How-it-works card with GSAP connector + timing badge ─────────
function HowCard({ num, title, description, icon, timing, connectorAfter }: {
    num: string; title: string; description: string;
    icon: React.ReactNode; timing?: string; connectorAfter?: boolean;
}) {
    const connRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!connectorAfter || !connRef.current) return;
        const line = connRef.current.querySelector(".how-connector-line") as HTMLElement;
        if (!line) return;
        gsap.set(line, { width: 0 });
        const anim = gsap.to(line, {
            width: "100%", ease: "power2.out",
            scrollTrigger: { trigger: connRef.current, start: "top 70%", end: "top 30%", scrub: 1 },
        });
        return () => { anim.scrollTrigger?.kill(); anim.kill(); };
    }, [connectorAfter]);

    return (
        <>
            <div className="how-card">
                <div className="how-card-top">
                    <div className="how-number">{num}</div>
                    {timing && <div className="how-timing">{timing}</div>}
                </div>
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

    const heroRef    = useRef<HTMLElement>(null);
    const titleRef   = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef     = useRef<HTMLDivElement>(null);

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
            } catch (e) { console.error("Failed to load stats:", e); }
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
                    trigger: hero, start: "top top", end: "+=100%",
                    scrub: 1, pin: true, pinSpacing: true, anticipatePin: 1,
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

            {/* ══ SCENE 1 — HERO ═════════════════════════════════════ */}
            <section ref={heroRef} className="hero">
                <div className="hero-watermark" aria-hidden="true">SHA(VAX)RE</div>

                <div className="hero-content">
                    <TypewriterLabel text="DECENTRALIZED EDUCATION FUNDING · AVALANCHE C-CHAIN" />

                    <h1 ref={titleRef} className="hero-title">
                        <span className="hero-line hero-line-white">
                            <span className="hero-line-inner">The student</span>
                        </span>
                        <span className="hero-line hero-line-white">
                            <span className="hero-line-inner" style={{ animationDelay: "1.4s" }}>
                                doesn&apos;t need
                            </span>
                        </span>
                        <span className="hero-line hero-line-accent">
                            <span className="hero-line-inner">a bank.</span>
                        </span>
                    </h1>

                    <p ref={subtitleRef} className="hero-subtitle">
                        0% platform fee. Arrives in under 1 second.<br />
                        Fully on-chain. Verifiable on Snowtrace.
                    </p>

                    <div ref={ctaRef} className="hero-bottom">
                        <div className="hero-actions">
                            <Link href="/create" className="btn-primary">Start a Campaign</Link>
                            <Link href="/campaigns" className="btn-secondary">Explore Campaigns</Link>
                            {!isConnected && (
                                <button onClick={connect} className="btn-secondary">Connect Wallet</button>
                            )}
                        </div>
                        <div className="hero-comparison-bar" role="presentation">
                            <div className="hero-cmp-item">
                                <span className="hero-cmp-platform">GoFundMe</span>
                                <span className="hero-cmp-val hero-cmp-bad">5–7% fee · days</span>
                            </div>
                            <span className="hero-cmp-vs">vs</span>
                            <div className="hero-cmp-item">
                                <span className="hero-cmp-platform">Bank Wire</span>
                                <span className="hero-cmp-val hero-cmp-bad">3–8% + 3–7 days</span>
                            </div>
                            <span className="hero-cmp-vs">vs</span>
                            <div className="hero-cmp-item hero-cmp-us">
                                <span className="hero-cmp-platform">Sha(vax)re</span>
                                <span className="hero-cmp-val hero-cmp-good">0% · &lt;1 second</span>
                            </div>
                        </div>
                    </div>
                </div>

                <ScrollIndicator />
            </section>

            {/* ══ SCENE 2 — COMPARISON TABLE ═════════════════════════ */}
            <section className="comparison-section">
                <div className="comparison-inner">
                    <ScrollReveal animation="fade-up" duration={0.8}>
                        <div className="comparison-header">
                            <SectionLabel text="The Problem" />
                            <h2>The system takes its cut.<br />We don&apos;t.</h2>
                            <p className="comparison-subhead">
                                244M children out of school. $39B annual funding gap.
                                Platforms take up to 7% before money even reaches students.
                            </p>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal animation="fade-up" delay={200} duration={0.9}>
                        <div className="comparison-table">
                            {/* Header */}
                            <div className="cmp-row cmp-head-row">
                                <div className="cmp-cell cmp-label-cell">Criteria</div>
                                <div className="cmp-cell cmp-other-cell">GoFundMe</div>
                                <div className="cmp-cell cmp-other-cell">Bank Wire</div>
                                <div className="cmp-cell cmp-us-cell">
                                    <span className="cmp-us-logo">
                                        <span className="logo-sha">Sha</span>
                                        <span className="logo-vax">(vax)</span>
                                        <span className="logo-re">re</span>
                                    </span>
                                </div>
                            </div>
                            {/* Rows */}
                            {compareData.map((row, i) => (
                                <div key={i} className="cmp-row cmp-data-row">
                                    <div className="cmp-cell cmp-label-cell">{row.label}</div>
                                    <div className="cmp-cell cmp-other-cell cmp-bad">{row.gofundme}</div>
                                    <div className="cmp-cell cmp-other-cell cmp-bad">{row.bank}</div>
                                    <div className="cmp-cell cmp-us-cell cmp-good">{row.us}</div>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* ══ SCENE 3 — HOW IT WORKS ═════════════════════════════ */}
            <section className="how-section">
                <ScrollReveal animation="blur-in" duration={0.8}>
                    <div className="how-header">
                        <SectionLabel text="How It Works" />
                        <h2>Three steps. No paperwork.</h2>
                    </div>
                </ScrollReveal>

                <StaggerContainer animation="scale-up" staggerDelay={200} duration={0.75} className="how-grid">
                    <HowCard
                        num="01"
                        timing="~30 seconds"
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
                        num="02"
                        timing="< 1 second"
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
                        num="03"
                        timing="Whenever ready"
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

            {/* ══ SCENE 4 — STATEMENT (STICKY SCROLL) ════════════════ */}
            <StatementSection />

            {/* ══ SCENE 5A — LIVE STATS ══════════════════════════════ */}
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

            {/* ══ SCENE 5B — ACTIVE CAMPAIGNS ════════════════════════ */}
            {featured.length > 0 && (
                <section className="campaigns-section">
                    <ScrollReveal animation="fade-up" duration={0.7}>
                        <div className="campaigns-header">
                            <div>
                                <SectionLabel text="Active Campaigns" />
                                <h2>Funding dreams, on-chain.</h2>
                            </div>
                            <Link href="/campaigns" className="campaigns-view-all">View All →</Link>
                        </div>
                    </ScrollReveal>
                    <StaggerContainer animation="scale-up" staggerDelay={150} duration={0.7} className="campaigns-grid">
                        {featured.map(c => <CampaignCard key={c.id} {...c} />)}
                    </StaggerContainer>
                </section>
            )}

            {/* ══ SCENE 5C — STUDENT STORIES ═════════════════════════ */}
            <section className="stories-section">
                <ScrollReveal animation="blur-in" duration={0.8}>
                    <div className="stories-header">
                        <SectionLabel text="Real Impact" />
                        <h2>Students who refused to wait.</h2>
                        <p className="stories-subhead">
                            Real campaigns. Every transaction verifiable on Snowtrace.
                        </p>
                    </div>
                </ScrollReveal>
                <StaggerContainer animation="scale-up" staggerDelay={150} duration={0.7} className="stories-grid">
                    {studentStories.map((s) => {
                        const pct = Math.min(100, Math.round((parseFloat(s.raisedAvax) / parseFloat(s.goalAvax)) * 100));
                        return (
                            <div key={s.name} className="story-card">
                                <div className="story-top">
                                    <div className="story-avatar">{s.initials}</div>
                                    <div className="story-identity">
                                        <div className="story-meta">{s.city} · Age {s.age}</div>
                                        <div className="story-name">{s.name}</div>
                                        <div className="story-field">{s.emoji} {s.field}</div>
                                    </div>
                                </div>
                                <div className="story-label">{s.label}</div>
                                <div className="story-progress-track">
                                    <div className="story-progress-fill" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="story-footer">
                                    <span className="story-raised">
                                        {s.raisedAvax} <span className="story-avax-unit">AVAX</span>
                                    </span>
                                    <span className="story-badge">{s.daysText}</span>
                                </div>
                            </div>
                        );
                    })}
                </StaggerContainer>
            </section>

            {/* ══ SCENE 5D — WHY AVALANCHE ═══════════════════════════ */}
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
                        <a href="https://testnet.snowtrace.io/address/0xfaDa353b9300Fc82B72a25B7E59867f4D0376cbd"
                            target="_blank" rel="noreferrer" className="avax-contract-link">
                            View Contract on Snowtrace ↗
                        </a>
                    </div>
                </ScrollReveal>
            </section>

            {/* ══ SCENE 6 — IMPACT (STICKY SCROLL) ══════════════════ */}
            <ImpactSection />

        </div>
    );
}
