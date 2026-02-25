"use client";

import Link from "next/link";
import { useWallet } from "@/components/WalletProvider";
import CampaignCard from "@/components/CampaignCard";

// Demo campaigns for the pitch — replace with on-chain data after deploy
const demoCampaigns = [
  {
    id: 0,
    title: "Computer Science Degree — Final Year Tuition",
    description:
      "I'm a senior CS student and need help covering my last semester tuition. Every AVAX gets me closer to graduation and launching my Web3 career.",
    category: "Tuition",
    goalAvax: "50.00",
    raisedAvax: "32.50",
    donorCount: 14,
    progress: 65,
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    student: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B",
  },
  {
    id: 1,
    title: "Medical Research Books & Lab Equipment",
    description:
      "Pursuing a master's in biomedical engineering. Need funds for specialized textbooks and lab materials not covered by my scholarship.",
    category: "Research",
    goalAvax: "25.00",
    raisedAvax: "18.75",
    donorCount: 9,
    progress: 75,
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    student: "0x2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1C",
  },
  {
    id: 2,
    title: "Blockchain Development Bootcamp Scholarship",
    description:
      "Self-taught developer seeking funding for a professional blockchain bootcamp to transition into Web3 full-time. Will build on Avalanche.",
    category: "Technology",
    goalAvax: "15.00",
    raisedAvax: "3.20",
    donorCount: 4,
    progress: 21,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    student: "0x3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1C2D",
  },
];

export default function Home() {
  const { connect, isConnected } = useWallet();

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
            100% of donations go directly to students — zero middlemen,
            zero commission.
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

      {/* ═══ STATS ═══ */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🔗</span>
            <h3 className="stat-value">100%</h3>
            <p className="stat-label">On-Chain Transparent</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💸</span>
            <h3 className="stat-value">0%</h3>
            <p className="stat-label">Platform Commission</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⚡</span>
            <h3 className="stat-value">&lt;2s</h3>
            <p className="stat-label">Transaction Finality</p>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🤝</span>
            <h3 className="stat-value">P2P</h3>
            <p className="stat-label">Direct to Students</p>
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
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Featured Campaigns</h2>
          <Link href="/campaigns" className="section-link">
            View All →
          </Link>
        </div>
        <div className="campaigns-grid">
          {demoCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} {...campaign} />
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cta-section">
        <div className="cta-card">
          <h2>Ready to Make a Difference?</h2>
          <p>
            Whether you&apos;re a student seeking funding or a donor looking to create impact,
            Sha(vax)re makes education accessible through blockchain transparency.
          </p>
          <div className="cta-buttons">
            <Link href="/create" className="btn-primary">
              Start a Campaign
            </Link>
            <Link href="/campaigns" className="btn-secondary">
              Donate Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
