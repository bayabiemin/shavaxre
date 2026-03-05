"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { JsonRpcProvider } from "ethers";
import { useWallet } from "@/components/WalletProvider";
import { getCampaignById, donateToCampaign, CampaignDisplay, CONTRACT_ADDRESS } from "@/lib/contract";

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

const categoryIcons: Record<string, string> = {
    Tuition: "🎓",
    Books: "📚",
    Research: "🔬",
    Housing: "🏠",
    Technology: "💻",
    Other: "✨",
};

const quickAmounts = ["1", "5", "10", "25"];

export default function CampaignDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const { signer, isConnected, connect } = useWallet();

    const [campaign, setCampaign] = useState<CampaignDisplay | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [donateAmount, setDonateAmount] = useState("");
    const [isDonating, setIsDonating] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [donateError, setDonateError] = useState<string | null>(null);

    async function loadCampaign() {
        try {
            setLoading(true);
            const provider = new JsonRpcProvider(FUJI_RPC);
            const data = await getCampaignById(provider, id);
            setCampaign(data);
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!isNaN(id)) loadCampaign();
        else setNotFound(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const handleDonate = async () => {
        if (!isConnected || !signer) {
            await connect();
            return;
        }
        if (!donateAmount || parseFloat(donateAmount) <= 0) {
            setDonateError("Please enter a valid amount.");
            return;
        }
        try {
            setIsDonating(true);
            setDonateError(null);
            setTxHash(null);
            const receipt = await donateToCampaign(signer, id, donateAmount);
            setTxHash(receipt.hash);
            setDonateAmount("");
            // Reload campaign to reflect updated raised amount
            await loadCampaign();
        } catch (err: any) {
            const msg = err?.reason || err?.message || "Transaction failed.";
            setDonateError(msg.length > 120 ? msg.slice(0, 120) + "…" : msg);
        } finally {
            setIsDonating(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <p style={{ textAlign: "center", opacity: 0.6, marginTop: "4rem" }}>
                    Loading campaign from blockchain...
                </p>
            </div>
        );
    }

    if (notFound || !campaign) {
        return (
            <div className="page-container">
                <div className="not-found">
                    <h2>Campaign Not Found</h2>
                    <p>This campaign doesn&apos;t exist or has been removed.</p>
                    <a href="/campaigns" className="btn-primary">Browse Campaigns</a>
                </div>
            </div>
        );
    }

    const daysLeft = Math.max(
        0,
        Math.ceil((campaign.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
    const isExpired = daysLeft === 0;

    return (
        <div className="page-container">
            <div className="campaign-detail">
                {/* ── Left Column ── */}
                <div className="detail-main">
                    <div className="detail-header">
                        <span className="detail-category">
                            {categoryIcons[campaign.category] || "✨"} {campaign.category}
                        </span>
                        <span className="detail-days">
                            {isExpired ? "Ended" : `${daysLeft} days left`}
                        </span>
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
                                <a
                                    className="t-value"
                                    href={`https://testnet.snowtrace.io/address/${CONTRACT_ADDRESS}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ textDecoration: "underline", cursor: "pointer" }}
                                >
                                    View on Snowtrace ↗
                                </a>
                            </div>
                            <div className="transparency-item">
                                <span className="t-label">Network</span>
                                <span className="t-value">Avalanche Fuji Testnet</span>
                            </div>
                            <div className="transparency-item">
                                <span className="t-label">Commission</span>
                                <span className="t-value highlight">0% — Direct P2P</span>
                            </div>
                            <div className="transparency-item">
                                <span className="t-label">Campaign ID</span>
                                <span className="t-value">#{id}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right Column ── */}
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
                                <span>{campaign.progress.toFixed(1)}% funded</span>
                            </div>
                        </div>

                        {txHash && (
                            <div style={{
                                padding: "0.75rem",
                                background: "rgba(34,197,94,0.1)",
                                border: "1px solid rgba(34,197,94,0.3)",
                                borderRadius: "8px",
                                marginBottom: "1rem",
                                fontSize: "0.85rem"
                            }}>
                                ✅ Donation confirmed!{" "}
                                <a
                                    href={`https://testnet.snowtrace.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ textDecoration: "underline" }}
                                >
                                    View tx ↗
                                </a>
                            </div>
                        )}

                        {donateError && (
                            <div style={{
                                padding: "0.75rem",
                                background: "rgba(239,68,68,0.1)",
                                border: "1px solid rgba(239,68,68,0.3)",
                                borderRadius: "8px",
                                marginBottom: "1rem",
                                fontSize: "0.85rem",
                                color: "#f87171"
                            }}>
                                ⚠️ {donateError}
                            </div>
                        )}

                        <div className="donate-form">
                            <label>Donation Amount (AVAX)</label>
                            <div className="donate-input-wrap">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={donateAmount}
                                    disabled={isExpired || isDonating}
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
                                        disabled={isExpired || isDonating}
                                    >
                                        {amt} AVAX
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleDonate}
                                className="btn-primary btn-full"
                                disabled={isDonating || isExpired}
                            >
                                {isExpired
                                    ? "Campaign Ended"
                                    : !isConnected
                                        ? "Connect Wallet to Donate"
                                        : isDonating
                                            ? "Confirming on-chain..."
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
