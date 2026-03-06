"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { JsonRpcProvider, formatEther } from "ethers";
import { useWallet } from "@/components/WalletProvider";
import {
    getCampaignById,
    donateToCampaign,
    claimCampaignFunds,
    CampaignDisplay,
    CONTRACT_ADDRESS,
    getContract,
} from "@/lib/contract";
import SectionLabel from "@/components/SectionLabel";

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

// CSS-only confetti (no external lib)
function ConfettiEffect() {
    const pieces = Array.from({ length: 24 }, (_, i) => i);
    return (
        <div className="confetti-container" aria-hidden="true">
            {pieces.map(i => (
                <div
                    key={i}
                    className="confetti-piece"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.8}s`,
                        animationDuration: `${1.2 + Math.random() * 1}s`,
                        background: i % 3 === 0 ? "#E84142" : i % 3 === 1 ? "#ffffff" : "#ff6b6b",
                    }}
                />
            ))}
        </div>
    );
}

const categoryIcons: Record<string, string> = {
    Tuition: "🎓",
    Books: "📚",
    Research: "🔬",
    Housing: "🏠",
    Technology: "💻",
    Equipment: "🔧",
    Scholarship: "🏆",
    Other: "✨",
};

const quickAmounts = ["0.1", "0.5", "1.0", "2.0"];

interface DonationEvent {
    donor: string;
    amount: string;
    txHash: string;
    blockNumber: number;
}

function Countdown({ deadline }: { deadline: Date }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        function update() {
            const diff = deadline.getTime() - Date.now();
            if (diff <= 0) { setTimeLeft("Ended"); return; }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            if (d > 0) setTimeLeft(`${d}d ${h}h left`);
            else if (h > 0) setTimeLeft(`${h}h ${m}m left`);
            else setTimeLeft(`${m}m left`);
        }
        update();
        const id = setInterval(update, 60000);
        return () => clearInterval(id);
    }, [deadline]);

    return <span>{timeLeft}</span>;
}

export default function CampaignDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const { signer, address, isConnected, connect } = useWallet();

    const [campaign, setCampaign] = useState<CampaignDisplay | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [donateAmount, setDonateAmount] = useState("");
    const [isDonating, setIsDonating] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [donateError, setDonateError] = useState<string | null>(null);

    const [isClaiming, setIsClaiming] = useState(false);
    const [claimTxHash, setClaimTxHash] = useState<string | null>(null);
    const [claimError, setClaimError] = useState<string | null>(null);

    const [donationTime, setDonationTime] = useState<number | null>(null);
    const [confetti, setConfetti] = useState(false);

    const [donors, setDonors] = useState<DonationEvent[]>([]);
    const [copied, setCopied] = useState(false);

    const loadCampaign = useCallback(async () => {
        try {
            setLoading(true);
            const provider = new JsonRpcProvider(FUJI_RPC);
            const data = await getCampaignById(provider, id);
            setCampaign(data);

            // Load recent donor events
            const contract = getContract(provider);
            const filter = contract.filters.DonationReceived(id);
            const events = await contract.queryFilter(filter);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parsed: DonationEvent[] = [...events].reverse().slice(0, 5).map((e: any) => ({
                donor: e.args[1] as string,
                amount: parseFloat(formatEther(e.args[2])).toFixed(4),
                txHash: e.transactionHash,
                blockNumber: e.blockNumber,
            }));
            setDonors(parsed);
        } catch {
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!isNaN(id)) loadCampaign();
        else setNotFound(true);
    }, [id, loadCampaign]);

    const handleDonate = async () => {
        if (!isConnected || !signer) { await connect(); return; }
        if (!donateAmount || parseFloat(donateAmount) <= 0) {
            setDonateError("Please enter a valid amount.");
            return;
        }
        try {
            setIsDonating(true);
            setDonateError(null);
            setTxHash(null);
            const t0 = Date.now();
            const receipt = await donateToCampaign(signer, id, donateAmount);
            const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
            setTxHash(receipt.hash);
            setDonationTime(parseFloat(elapsed));
            setConfetti(true);
            setTimeout(() => setConfetti(false), 3500);
            setDonateAmount("");
            await loadCampaign();
        } catch (err: unknown) {
            const e = err as { reason?: string; message?: string };
            const msg = e?.reason || e?.message || "Transaction failed.";
            setDonateError(msg.length > 120 ? msg.slice(0, 120) + "…" : msg);
        } finally {
            setIsDonating(false);
        }
    };

    const handleClaim = async () => {
        if (!isConnected || !signer) { await connect(); return; }
        try {
            setIsClaiming(true);
            setClaimError(null);
            const receipt = await claimCampaignFunds(signer, id);
            setClaimTxHash(receipt.hash);
            await loadCampaign();
        } catch (err: unknown) {
            const e = err as { reason?: string; message?: string };
            const msg = e?.reason || e?.message || "Claim failed.";
            setClaimError(msg.length > 120 ? msg.slice(0, 120) + "…" : msg);
        } finally {
            setIsClaiming(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const tweetText = campaign
        ? `I just supported "${campaign.title}" on @ShavaxreApp 🔴\nZero commission, direct to students on @avaborlabs Avalanche.\n\nFund education → ${window?.location?.href}`
        : "";

    const linkedInUrl = campaign
        ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`
        : "#";

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

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
                    <Link href="/campaigns" className="btn-primary">Browse Campaigns</Link>
                </div>
            </div>
        );
    }

    const isExpired = campaign.deadline.getTime() < Date.now();
    const isOwner = address && address.toLowerCase() === campaign.student.toLowerCase();
    const canClaim = isOwner && !campaign.claimed && (campaign.progress >= 100 || isExpired);
    const avgDonation = campaign.donorCount > 0
        ? (parseFloat(campaign.raisedAvax) / campaign.donorCount).toFixed(4)
        : "0.0000";

    return (
        <div className="page-container">
            {/* Back link */}
            <Link href="/campaigns" className="detail-back">← Back to Campaigns</Link>

            <div className="campaign-detail">
                {/* ── Left Column ── */}
                <div className="detail-main">
                    <div className="detail-header">
                        <span className="detail-category">
                            {categoryIcons[campaign.category] || "✨"} {campaign.category}
                        </span>
                        <span className={`detail-days ${isExpired ? "ended" : ""}`}>
                            {isExpired ? "Ended" : <><span className="detail-days-dot" /><Countdown deadline={campaign.deadline} /></>}
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

                    {/* About */}
                    <div className="detail-description">
                        <h3>About this Campaign</h3>
                        <p>{campaign.description}</p>
                    </div>

                    {/* Campaign Stats */}
                    <div className="detail-stats-panel">
                        <SectionLabel text="Campaign Stats" />
                        <div className="detail-stats-grid">
                            <div className="detail-stat-item">
                                <span className="ds-label">Donors</span>
                                <span className="ds-value">{campaign.donorCount}</span>
                            </div>
                            <div className="detail-stat-item">
                                <span className="ds-label">Avg Donation</span>
                                <span className="ds-value">{avgDonation} AVAX</span>
                            </div>
                            <div className="detail-stat-item">
                                <span className="ds-label">Deadline</span>
                                <span className="ds-value">{campaign.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                            <div className="detail-stat-item">
                                <span className="ds-label">Progress</span>
                                <span className="ds-value">{campaign.progress.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* On-Chain Transparency */}
                    <div className="detail-transparency">
                        <h3>🔗 On-Chain Transparency</h3>
                        <div className="transparency-grid">
                            <div className="transparency-item">
                                <span className="t-label">Contract</span>
                                <a className="t-value" href={`https://testnet.snowtrace.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
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

                    {/* Recent Donors */}
                    {donors.length > 0 && (
                        <div className="detail-donors">
                            <SectionLabel text="Recent Donations" />
                            <div className="donors-list">
                                {donors.map((d, i) => (
                                    <div key={i} className="donor-row">
                                        <span className="donor-address">
                                            {d.donor.slice(0, 6)}…{d.donor.slice(-4)}
                                        </span>
                                        <span className="donor-amount">{d.amount} AVAX</span>
                                        <a href={`https://testnet.snowtrace.io/tx/${d.txHash}`} target="_blank" rel="noreferrer" className="donor-tx">
                                            ↗
                                        </a>
                                    </div>
                                ))}
                            </div>
                            <a href={`https://testnet.snowtrace.io/address/${CONTRACT_ADDRESS}#events`} target="_blank" rel="noreferrer" className="donors-view-all">
                                View all on Snowtrace ↗
                            </a>
                        </div>
                    )}

                    {/* Share */}
                    <div className="detail-share">
                        <SectionLabel text="Share This Campaign" />
                        <div className="share-buttons">
                            <a href={twitterUrl} target="_blank" rel="noreferrer" className="share-btn share-twitter">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                                Twitter / X
                            </a>
                            <button onClick={handleCopyLink} className="share-btn share-copy">
                                {copied ? "✓ Copied!" : "Copy Link"}
                            </button>
                            <a href={linkedInUrl} target="_blank" rel="noreferrer" className="share-btn share-linkedin">
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Right Column / Sidebar ── */}
                <div className="detail-sidebar">
                    <div className="donate-card">
                        {/* Progress */}
                        <div className="donate-progress">
                            <div className="donate-amounts">
                                <span className="donate-raised">{campaign.raisedAvax} AVAX</span>
                                <span className="donate-goal">of {campaign.goalAvax} AVAX</span>
                            </div>
                            <div className="donate-bar">
                                <div className="donate-bar-fill" style={{ width: `${campaign.progress}%` }} />
                            </div>
                            <div className="donate-meta">
                                <span>👥 {campaign.donorCount} donors</span>
                                <span>{campaign.progress.toFixed(1)}% funded</span>
                            </div>
                        </div>

                        {/* Rich success state */}
                        {txHash && campaign && (
                            <div className="donation-success-card">
                                {confetti && <ConfettiEffect />}
                                <div className="success-tick">✓</div>
                                <h4>Thank you! 🎉</h4>
                                <p>Your donation is confirmed on Avalanche.</p>
                                {donationTime !== null && (
                                    <div className="success-finality">
                                        ⚡ Confirmed in {donationTime}s on Avalanche
                                    </div>
                                )}
                                <a
                                    href={`https://testnet.snowtrace.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="success-tx-link"
                                >
                                    View tx on Snowtrace ↗
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just donated to "${campaign.title}" on @ShavaxreApp 🔴\nZero commission, direct to students on Avalanche.\n\nFund education → shavaxre.vercel.app`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="success-tweet-btn"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                                    Share on Twitter / X
                                </a>
                            </div>
                        )}

                        {/* Error */}
                        {donateError && (
                            <div className="tx-error">⚠️ {donateError}</div>
                        )}

                        {/* Donate form */}
                        {!isExpired && (
                            <div className="donate-form">
                                <label>Donation Amount (AVAX)</label>
                                <div className="donate-input-wrap">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={donateAmount}
                                        disabled={isDonating}
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
                                            disabled={isDonating}
                                        >
                                            {amt}
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
                                            ? "Confirming on-chain..."
                                            : `Donate ${donateAmount || "0"} AVAX`}
                                </button>

                                <p className="donate-note">
                                    Funds go directly to the student&apos;s wallet. Zero fees. Fully transparent.
                                </p>
                            </div>
                        )}

                        {isExpired && !canClaim && (
                            <p className="donate-note" style={{ textAlign: "center", paddingTop: "0.5rem" }}>
                                This campaign has ended.
                            </p>
                        )}

                        {/* Claim funds — owner only */}
                        {canClaim && (
                            <div className="claim-section">
                                <div className="claim-label">
                                    <span>🎉</span> You can now claim your funds!
                                </div>
                                {claimTxHash && (
                                    <div className="tx-success" style={{ marginBottom: "0.75rem" }}>
                                        ✅ Claimed!{" "}
                                        <a href={`https://testnet.snowtrace.io/tx/${claimTxHash}`} target="_blank" rel="noreferrer">
                                            View tx ↗
                                        </a>
                                    </div>
                                )}
                                {claimError && <div className="tx-error" style={{ marginBottom: "0.75rem" }}>⚠️ {claimError}</div>}
                                <button
                                    onClick={handleClaim}
                                    className="btn-primary btn-full"
                                    disabled={isClaiming}
                                >
                                    {isClaiming ? "Processing…" : `Claim ${campaign.raisedAvax} AVAX`}
                                </button>
                            </div>
                        )}

                        {isOwner && campaign.claimed && (
                            <div className="tx-success">✅ Funds have been claimed.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
