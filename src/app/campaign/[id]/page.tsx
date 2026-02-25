"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useWallet } from "@/components/WalletProvider";

// Demo campaign data (will be replaced by on-chain reads)
const demoCampaigns: Record<string, any> = {
    "0": {
        title: "Computer Science Degree — Final Year Tuition",
        description:
            "I'm a senior CS student at Istanbul Technical University and need help covering my last semester tuition. I've maintained a 3.8 GPA and have been building on Avalanche for the past year. Every AVAX gets me closer to graduation and launching my Web3 career full-time. I plan to contribute back to the Avalanche ecosystem by building open-source developer tools.",
        category: "Tuition",
        goalAvax: "50.00",
        raisedAvax: "32.50",
        donorCount: 14,
        progress: 65,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        student: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B",
    },
    "1": {
        title: "Medical Research Books & Lab Equipment",
        description:
            "I'm pursuing a master's in biomedical engineering at Boğaziçi University. I need funds for specialized textbooks and lab materials not covered by my scholarship. My research focuses on affordable diagnostic tools for developing countries. The funds will cover: 3 advanced textbooks ($200), lab equipment rental ($400), and research publication fees ($200).",
        category: "Research",
        goalAvax: "25.00",
        raisedAvax: "18.75",
        donorCount: 9,
        progress: 75,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        student: "0x2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1C",
    },
    "2": {
        title: "Blockchain Development Bootcamp Scholarship",
        description:
            "Self-taught developer from Ankara seeking funding for a professional blockchain development bootcamp. I've been coding for 2 years and want to transition into Web3 full-time. I will build my first dApp on Avalanche during the bootcamp and contribute to open-source projects in the ecosystem.",
        category: "Technology",
        goalAvax: "15.00",
        raisedAvax: "3.20",
        donorCount: 4,
        progress: 21,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        student: "0x3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1C2D",
    },
};

export default function CampaignDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { signer, isConnected, connect } = useWallet();
    const [donateAmount, setDonateAmount] = useState("");
    const [isDonating, setIsDonating] = useState(false);

    const campaign = demoCampaigns[id];

    if (!campaign) {
        return (
            <div className="page-container">
                <div className="not-found">
                    <h2>Campaign Not Found</h2>
                    <p>This campaign doesn&apos;t exist or has been removed.</p>
                    <a href="/campaigns" className="btn-primary">
                        Browse Campaigns
                    </a>
                </div>
            </div>
        );
    }

    const daysLeft = Math.max(
        0,
        Math.ceil((campaign.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    const handleDonate = async () => {
        if (!isConnected) {
            await connect();
            return;
        }
        if (!donateAmount || parseFloat(donateAmount) <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        try {
            setIsDonating(true);
            // On mainnet this would call: donateToCampaign(signer, parseInt(id), donateAmount)
            alert(`Demo mode: Would donate ${donateAmount} AVAX to campaign #${id}`);
        } catch (err) {
            console.error("Donation failed:", err);
        } finally {
            setIsDonating(false);
        }
    };

    const categoryIcons: Record<string, string> = {
        Tuition: "🎓",
        Books: "📚",
        Research: "🔬",
        Housing: "🏠",
        Technology: "💻",
        Other: "✨",
    };

    const quickAmounts = ["1", "5", "10", "25"];

    return (
        <div className="page-container">
            <div className="campaign-detail">
                {/* Left Column - Info */}
                <div className="detail-main">
                    <div className="detail-header">
                        <span className="detail-category">
                            {categoryIcons[campaign.category] || "✨"} {campaign.category}
                        </span>
                        <span className="detail-days">{daysLeft > 0 ? `${daysLeft} days left` : "Ended"}</span>
                    </div>

                    <h1 className="detail-title">{campaign.title}</h1>

                    <div className="detail-student">
                        <div className="student-avatar">
                            {campaign.student.slice(2, 4).toUpperCase()}
                        </div>
                        <div>
                            <p className="student-label">Created by</p>
                            <p className="student-address">{campaign.student}</p>
                        </div>
                    </div>

                    <div className="detail-description">
                        <h3>About this Campaign</h3>
                        <p>{campaign.description}</p>
                    </div>

                    <div className="detail-transparency">
                        <h3>🔗 On-Chain Transparency</h3>
                        <div className="transparency-grid">
                            <div className="transparency-item">
                                <span className="t-label">Contract</span>
                                <span className="t-value">Verified on Snowtrace</span>
                            </div>
                            <div className="transparency-item">
                                <span className="t-label">Network</span>
                                <span className="t-value">Avalanche C-Chain</span>
                            </div>
                            <div className="transparency-item">
                                <span className="t-label">Commission</span>
                                <span className="t-value highlight">0% — Direct P2P</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Donate */}
                <div className="detail-sidebar">
                    <div className="donate-card">
                        <div className="donate-progress">
                            <div className="donate-amounts">
                                <span className="donate-raised">{campaign.raisedAvax} AVAX</span>
                                <span className="donate-goal">of {campaign.goalAvax} AVAX</span>
                            </div>
                            <div className="donate-bar">
                                <div
                                    className="donate-bar-fill"
                                    style={{ width: `${campaign.progress}%` }}
                                />
                            </div>
                            <div className="donate-meta">
                                <span>👥 {campaign.donorCount} donors</span>
                                <span>{campaign.progress}% funded</span>
                            </div>
                        </div>

                        <div className="donate-form">
                            <label>Donation Amount (AVAX)</label>
                            <div className="donate-input-wrap">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={donateAmount}
                                    onChange={(e) => setDonateAmount(e.target.value)}
                                />
                                <span className="input-suffix">AVAX</span>
                            </div>

                            <div className="quick-amounts">
                                {quickAmounts.map((amt) => (
                                    <button
                                        key={amt}
                                        type="button"
                                        className={`quick-btn ${donateAmount === amt ? "active" : ""}`}
                                        onClick={() => setDonateAmount(amt)}
                                    >
                                        {amt} AVAX
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleDonate}
                                className="btn-primary btn-full"
                                disabled={isDonating}
                            >
                                {!isConnected
                                    ? "Connect Wallet to Donate"
                                    : isDonating
                                        ? "Processing..."
                                        : `Donate ${donateAmount || "0"} AVAX`}
                            </button>

                            <p className="donate-note">
                                Funds go directly to the student&apos;s wallet. Zero fees. Fully transparent.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
