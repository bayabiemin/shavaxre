"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { JsonRpcProvider } from "ethers";
import { useWallet } from "@/components/WalletProvider";
import CampaignCard from "@/components/CampaignCard";
import { getActiveCampaigns, getContract, CampaignDisplay } from "@/lib/contract";

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

export default function Home() {
    const { connect, isConnected } = useWallet();
    const [featured, setFeatured] = useState<CampaignDisplay[]>([]);
    const [stats, setStats] = useState({ campaigns: 0, raised: "0", donors: 0 });

    useEffect(() => {
        async function load() {
            try {
                const provider = new JsonRpcProvider(FUJI_RPC);
                const contract = getContract(provider);

                // Featured campaigns (latest 3)
                const campaigns = await getActiveCampaigns(provider);
                setFeatured(campaigns.slice(-3).reverse());

                // Live stats
                const count = await contract.campaignCount();
                const campaignCount = Number(count);

                let totalRaised = 0n;
                let totalDonors = 0;
                for (let i = 0; i < campaignCount; i++) {
                    const c = await contract.getCampaign(i);
                    totalRaised += c.raisedAmount;
                    totalDonors += Number(c.donorCount);
                }

                const raisedAvax = (Number(totalRaised) / 1e18).toFixed(2);
                setStats({ campaigns: campaignCount, raised: raisedAvax, donors: totalDonors });
            } catch (err) {
                console.error("Failed to load live stats:", err);
            }
        }
        load();
    }, []);

    return (
        <div className="home">
            {/* ═══ HERO ═══ */}
            <section className="hero">
                <div className="hero-bg-orbs">
                    <div className="orb orb-1" />
                    <div className="orb orb-2" />
                    <div className="orb orb-3" />
                </div>

                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-dot" />
                        Built on Avalanche C-Chain
                    </div>

                    <h1 className="hero-title">
                        Fund Education,
                        <br />
                        <span className="gradient-text">On-Chain.</span>
                    </h1>

                    <p className="hero-subtitle">
                        Sha(vax)re enables transparent, trustless education crowdfunding.
                        <br />
                        100% of donations go directly to students — zero middlemen, zero commission.
                    </p>

                    <div className="hero-actions">
                        <Link href="/campaigns" className="btn-primary">
                            Explore Campaigns
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path
                                    d="M3 8H13M13 8L9 4M13 8L9 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </Link>
                        {!isConnected && (
                            <button onClick={connect} className="btn-secondary">
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══ LIVE STATS ═══ */}
            <section className="stats-section">
                <div className="stats-grid">
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
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section className="how-section">
                <h2 className="section-title">How It Works</h2>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">01</div>
                        <h3>Connect Wallet</h3>
                        <p>Connect your MetaMask or Core Wallet to the Avalanche network.</p>
                    </div>
                    <div className="step-connector">→</div>
                    <div className="step-card">
                        <div className="step-number">02</div>
                        <h3>Create or Browse</h3>
                        <p>Students create campaigns. Donors browse and choose who to support.</p>
                    </div>
                    <div className="step-connector">→</div>
                    <div className="step-card">
                        <div className="step-number">03</div>
                        <h3>Fund & Claim</h3>
                        <p>Donate AVAX directly. Students claim funds — no middlemen, no fees.</p>
                    </div>
                </div>
            </section>

            {/* ═══ FEATURED CAMPAIGNS ═══ */}
            {featured.length > 0 && (
                <section className="featured-section">
                    <div className="section-header">
                        <h2 className="section-title">Featured Campaigns</h2>
                        <Link href="/campaigns" className="section-link">View All →</Link>
                    </div>
                    <div className="campaigns-grid">
                        {featured.map((campaign) => (
                            <CampaignCard key={campaign.id} {...campaign} />
                        ))}
                    </div>
                </section>
            )}

            {/* ═══ CTA ═══ */}
            <section className="cta-section">
                <div className="cta-card">
                    <h2>Ready to Make a Difference?</h2>
                    <p>
                        Whether you&apos;re a student seeking funding or a donor looking to create impact,
                        Sha(vax)re makes education accessible through blockchain transparency.
                    </p>
                    <div className="cta-buttons">
                        <Link href="/create" className="btn-primary">Start a Campaign</Link>
                        <Link href="/campaigns" className="btn-secondary">Donate Now</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
