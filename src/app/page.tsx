"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { JsonRpcProvider } from "ethers";
import { useWallet } from "@/components/WalletProvider";
import CampaignCard from "@/components/CampaignCard";
import ScrollReveal, { StaggerContainer } from "@/components/ScrollReveal";
import SectionLabel from "@/components/SectionLabel";
import CountUp from "@/components/CountUp";
import ScrollIndicator from "@/components/ScrollIndicator";
import { getActiveCampaigns, getContract, CampaignDisplay } from "@/lib/contract";

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

// ─── Typewriter label ─────────────────────────────────────────
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

// ─── White statement section with wipe reveal ─────────────────
function StatementSection() {
    const ref = useRef<HTMLElement>(null);
    const [revealed, setRevealed] = useState(false);
    const [wordsVisible, setWordsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setRevealed(true);
                    setTimeout(() => setWordsVisible(true), 900);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.25 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const text = "Where blockchain meets education, every AVAX creates a future.";
    const words = text.split(" ");

    return (
        <section ref={ref} className={`statement-section ${revealed ? "statement-revealed" : ""}`}>
            <div className="statement-bg" />
            <div className="statement-inner">
                <SectionLabel text="The Solution" light />
                <p className="statement-quote">
                    {words.map((word, i) => (
                        <span
                            key={i}
                            className={`statement-word ${wordsVisible ? "word-visible" : ""}`}
                            style={{ transitionDelay: wordsVisible ? `${i * 55}ms` : "0ms" }}
                        >
                            {word}
                        </span>
                    ))}
                </p>
            </div>
        </section>
    );
}

// ─── Red impact section with wipe reveal ──────────────────────
function ImpactSection() {
    const ref = useRef<HTMLElement>(null);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) { setRevealed(true); observer.unobserve(el); }
            },
            { threshold: 0.25 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={ref} className={`impact-section ${revealed ? "impact-revealed" : ""}`}>
            <div className="impact-bg" />
            <div className="impact-inner">
                <p className="impact-quote">
                    &ldquo;Education funded on-chain is education that can&rsquo;t be stolen.&rdquo;
                </p>
                <span className="impact-source">
                    Sha(vax)re &nbsp;·&nbsp; Built on Avalanche &nbsp;·&nbsp; Build Games 2026
                </span>
            </div>
        </section>
    );
}

// ─── How-it-works card with connector ─────────────────────────
function HowCard({ num, title, description, icon, connectorAfter }: {
    num: string; title: string; description: string;
    icon: React.ReactNode; connectorAfter?: boolean;
}) {
    const connRef = useRef<HTMLDivElement>(null);
    const [lineRevealed, setLineRevealed] = useState(false);

    useEffect(() => {
        if (!connectorAfter) return;
        const el = connRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setLineRevealed(true); observer.unobserve(el); } },
            { threshold: 0.8 }
        );
        observer.observe(el);
        return () => observer.disconnect();
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
                <div ref={connRef} className={`how-connector ${lineRevealed ? "line-revealed" : ""}`}>
                    <div className="how-connector-line" />
                </div>
            )}
        </>
    );
}

// ─── Animated footer mega text ─────────────────────────────────
function FooterMega() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return <div ref={ref} className={`footer-mega ${visible ? "mega-visible" : ""}`} aria-hidden="true">SHA(VAX)RE</div>;
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function Home() {
    const { connect, isConnected } = useWallet();
    const [featured, setFeatured] = useState<CampaignDisplay[]>([]);
    const [stats, setStats] = useState({ campaigns: 0, raised: 0, donors: 0 });

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

    return (
        <div className="home">

            {/* ══════════════════════════════════════════════
                SCENE 1 — HERO
                Statement-first, left-aligned, no globe
            ══════════════════════════════════════════════ */}
            <section className="hero">
                {/* Nearly-invisible watermark */}
                <div className="hero-watermark" aria-hidden="true">SHA(VAX)RE</div>

                <div className="hero-content">
                    <TypewriterLabel text="DECENTRALIZED EDUCATION ON AVALANCHE" />

                    <h1 className="hero-title">
                        <span className="hero-line hero-line-white">
                            <span className="hero-line-inner">Fund Education.</span>
                        </span>
                        <span className="hero-line hero-line-accent">
                            <span className="hero-line-inner">Change Lives.</span>
                        </span>
                    </h1>

                    <p className="hero-subtitle">
                        Zero commission, zero middlemen.<br />
                        Direct AVAX donations on Avalanche.
                    </p>

                    <div className="hero-actions">
                        <Link href="/create" className="btn-primary">
                            Start a Campaign
                        </Link>
                        <Link href="/campaigns" className="btn-secondary">
                            Explore Campaigns
                        </Link>
                        {!isConnected && (
                            <button onClick={connect} className="btn-secondary">
                                Connect Wallet
                            </button>
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
                    {/* Left — sticky large numbers */}
                    <div className="problem-stats">
                        <ScrollReveal animation="fade-right" duration={900}>
                            <div className="problem-stat">
                                <span className="problem-stat-number">
                                    <CountUp end={244} suffix="M" duration={2400} />
                                </span>
                                <span className="problem-stat-label">Children out of school globally</span>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal animation="fade-right" delay={200} duration={900}>
                            <div className="problem-stat">
                                <span className="problem-stat-number">
                                    <CountUp prefix="$" end={39} suffix="B" duration={2000} />
                                </span>
                                <span className="problem-stat-label">Annual education funding gap</span>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal animation="fade-right" delay={400} duration={900}>
                            <div className="problem-stat">
                                <span className="problem-stat-number">
                                    <CountUp end={68} suffix="%" duration={1800} />
                                </span>
                                <span className="problem-stat-label">Of donations lost to middlemen</span>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* Right — scrolling text */}
                    <ScrollReveal animation="fade-left" duration={1000}>
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
                Step-by-step with animated connector line
            ══════════════════════════════════════════════ */}
            <section className="how-section">
                <ScrollReveal animation="blur-in" duration={800}>
                    <div className="how-header">
                        <SectionLabel text="How It Works" />
                        <h2>Three steps. Zero friction.</h2>
                    </div>
                </ScrollReveal>

                <StaggerContainer animation="scale-up" staggerDelay={200} duration={750} className="how-grid">
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
                SCENE 4 — STATEMENT (100vh white wipe)
            ══════════════════════════════════════════════ */}
            <StatementSection />

            {/* ══════════════════════════════════════════════
                SCENE 5A — LIVE STATS
            ══════════════════════════════════════════════ */}
            <section className="stats-section">
                <StaggerContainer animation="fade-up" staggerDelay={120} duration={700} className="stats-grid">
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
                    <ScrollReveal animation="fade-up" duration={700}>
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

                    <StaggerContainer animation="scale-up" staggerDelay={150} duration={700} className="campaigns-grid">
                        {featured.map(c => <CampaignCard key={c.id} {...c} />)}
                    </StaggerContainer>
                </section>
            )}

            {/* ══════════════════════════════════════════════
                SCENE 5C — WHY AVALANCHE
            ══════════════════════════════════════════════ */}
            <section className="avax-section">
                <ScrollReveal animation="blur-in" duration={800}>
                    <div className="avax-header">
                        <SectionLabel text="Why Avalanche" />
                        <h2>Built for speed. Designed for impact.</h2>
                    </div>
                </ScrollReveal>

                <StaggerContainer animation="scale-up" staggerDelay={120} duration={700} className="avax-grid">
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

                <ScrollReveal animation="fade-up" duration={600} delay={300}>
                    <div className="avax-footer-cta">
                        <span className="avax-powered">Powered by Avalanche C-Chain</span>
                        <a
                            href={`https://testnet.snowtrace.io/address/0xfaDa353b9300Fc82B72a25B7E59867f4D0376cbd`}
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
                SCENE 6 — IMPACT (100vh red wipe)
            ══════════════════════════════════════════════ */}
            <ImpactSection />

        </div>
    );
}
