"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ethers } from "ethers";
import { useWallet } from "@/components/WalletProvider";
import { CONTRACT_ADDRESS, getReadContract, getWriteContract } from "@/lib/contract";
import {
    fetchCampaign,
    useDonate,
    type CampaignData,
} from "@/hooks/useShavaxre";
import SectionLabel from "@/components/SectionLabel";
import { useLang } from "@/contexts/LangContext";

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

const quickAmounts = ["0.1", "0.5", "1.0", "2.0"];

interface DonationEvent {
    donor: string;
    amount: string;
    txHash: string;
    blockNumber: number;
}

export default function CampaignDetailPage() {
    const params = useParams();
    const id = Number(params.id);
    const { address, isConnected, connect } = useWallet();
    const { donate: doDonate, isPending: isDonating, isConfirming, isSuccess: donateSuccess, hash: txHash, error: donateError } = useDonate();
    const { t } = useLang();

    const [campaign, setCampaign] = useState<CampaignData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [donateAmount, setDonateAmount] = useState("");
    const [confetti, setConfetti] = useState(false);

    const [donors, setDonors] = useState<DonationEvent[]>([]);
    const [copied, setCopied] = useState(false);

    const [showReport, setShowReport] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportDone, setReportDone] = useState(false);

    const loadCampaign = useCallback(async () => {
        try {
            setLoading(true);
            const data = await fetchCampaign(id);
            setCampaign(data);

            // Event query in separate try-catch
            try {
                const contract = getReadContract();
                const provider = contract.runner?.provider;
                if (provider && 'getBlockNumber' in provider) {
                    const currentBlock = await (provider as ethers.JsonRpcProvider).getBlockNumber();
                    const fromBlock = Math.max(0, currentBlock - 2048);
                    const filter = contract.filters.Donated(id);
                    const events = await contract.queryFilter(filter, fromBlock, currentBlock);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const parsed: DonationEvent[] = [...events].reverse().slice(0, 5).map((e: any) => ({
                        donor: e.args[1] as string,
                        amount: parseFloat(ethers.formatEther(e.args[2])).toFixed(4),
                        txHash: e.transactionHash,
                        blockNumber: e.blockNumber,
                    }));
                    setDonors(parsed);
                }
            } catch (eventErr) {
                console.warn("Could not load donation events:", eventErr);
            }
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

    // Show confetti on successful donation
    useEffect(() => {
        if (donateSuccess) {
            setConfetti(true);
            setDonateAmount("");
            loadCampaign();
            setTimeout(() => setConfetti(false), 3500);
        }
    }, [donateSuccess, loadCampaign]);

    const handleDonate = async () => {
        if (!isConnected) { await connect(); return; }
        if (!donateAmount || parseFloat(donateAmount) <= 0) return;
        await doDonate(id, ethers.parseEther(donateAmount));
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleReport = async () => {
        try {
            const contract = await getWriteContract();
            await contract.reportCampaign(id, reportReason);
        } catch {
            // ignore errors — user still sees success
        }
        setReportDone(true);
    };

    if (loading) {
        return (
            <div className="page-container">
                <p style={{ textAlign: "center", opacity: 0.6, marginTop: "4rem" }}>
                    {t("detail.loading")}
                </p>
            </div>
        );
    }

    if (notFound || !campaign) {
        return (
            <div className="page-container">
                <div className="not-found">
                    <h2>{t("detail.notFound")}</h2>
                    <p>{t("detail.notFoundDesc")}</p>
                    <Link href="/campaigns" className="btn-primary">{t("common.browseCampaigns")}</Link>
                </div>
            </div>
        );
    }

    const goalAvax = ethers.formatEther(campaign.goalAmount);
    const raisedAvax = ethers.formatEther(campaign.totalRaised);
    const progress = parseFloat(goalAvax) > 0 ? Math.min((parseFloat(raisedAvax) / parseFloat(goalAvax)) * 100, 100) : 0;
    const isOwner = address && address.toLowerCase() === campaign.creator.toLowerCase();
    const donorCount = Number(campaign.uniqueDonors);
    const avgDonation = donorCount > 0 ? (parseFloat(raisedAvax) / donorCount).toFixed(4) : "0.0000";

    const tweetText = `I just supported a campaign on @ShavaxreApp\nZero commission, direct to students on @avaborlabs Avalanche.\n\nFund education → ${typeof window !== "undefined" ? window.location.href : "shavaxre.vercel.app"}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`;

    return (
        <div className="page-container">
            {/* Back link */}
            <Link href="/campaigns" className="detail-back">{t("detail.back")}</Link>

            <div className="campaign-detail">
                {/* ── Left Column ── */}
                <div className="detail-main">
                    <div className="detail-header">
                        <span className="detail-category">
                            🎓 {t("common.campaign")} #{id}
                        </span>
                        <span className={`detail-days ${campaign.status !== 0 ? "ended" : ""}`}>
                            {campaign.statusText}
                        </span>
                    </div>

                    <h1 className="detail-title">{t("common.campaign")} #{id}</h1>

                    <div className="detail-student">
                        <div className="student-avatar">
                            {campaign.creator.slice(2, 4).toUpperCase()}
                        </div>
                        <div>
                            <p className="student-label">{t("detail.createdBy")}</p>
                            <p className="student-address">{campaign.creator}</p>
                        </div>
                    </div>

                    {/* Campaign Stats */}
                    <div className="detail-stats-panel">
                        <SectionLabel text={t("detail.stats")} />
                        <div className="detail-stats-grid">
                            <div className="detail-stat-item">
                                <span className="ds-label">{t("detail.donors")}</span>
                                <span className="ds-value">{donorCount}</span>
                            </div>
                            <div className="detail-stat-item">
                                <span className="ds-label">{t("detail.avgDonation")}</span>
                                <span className="ds-value">{avgDonation} AVAX</span>
                            </div>
                            <div className="detail-stat-item">
                                <span className="ds-label">{t("detail.likes")}</span>
                                <span className="ds-value">{Number(campaign.likes)}</span>
                            </div>
                            <div className="detail-stat-item">
                                <span className="ds-label">{t("detail.progress")}</span>
                                <span className="ds-value">{progress.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* On-Chain Transparency */}
                    <div className="detail-transparency">
                        <h3>🔗 {t("detail.transparency")}</h3>
                        <div className="transparency-grid">
                            <div className="transparency-item">
                                <span className="t-label">{t("detail.contract")}</span>
                                <a className="t-value" href={`https://testnet.snowtrace.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                                    {t("common.viewOnSnowtrace")}
                                </a>
                            </div>
                            <div className="transparency-item">
                                <span className="t-label">{t("detail.network")}</span>
                                <span className="t-value">Avalanche Fuji Testnet</span>
                            </div>
                            <div className="transparency-item">
                                <span className="t-label">{t("detail.commission")}</span>
                                <span className="t-value highlight">{t("detail.commissionVal")}</span>
                            </div>
                            <div className="transparency-item">
                                <span className="t-label">{t("detail.campaignId")}</span>
                                <span className="t-value">#{id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Donors */}
                    {donors.length > 0 && (
                        <div className="detail-donors">
                            <SectionLabel text={t("detail.recentDonations")} />
                            <div className="donors-list">
                                {donors.map((d, i) => (
                                    <div key={i} className="donor-row">
                                        <span className="donor-address">
                                            {d.donor.slice(0, 6)}...{d.donor.slice(-4)}
                                        </span>
                                        <span className="donor-amount">{d.amount} AVAX</span>
                                        <a href={`https://testnet.snowtrace.io/tx/${d.txHash}`} target="_blank" rel="noreferrer" className="donor-tx">
                                            ↗
                                        </a>
                                    </div>
                                ))}
                            </div>
                            <a href={`https://testnet.snowtrace.io/address/${CONTRACT_ADDRESS}#events`} target="_blank" rel="noreferrer" className="donors-view-all">
                                {t("common.viewAllSnowtrace")}
                            </a>
                        </div>
                    )}

                    {/* Share */}
                    <div className="detail-share">
                        <SectionLabel text={t("detail.share")} />
                        <div className="share-buttons">
                            <a href={twitterUrl} target="_blank" rel="noreferrer" className="share-btn share-twitter">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                                Twitter / X
                            </a>
                            <button onClick={handleCopyLink} className="share-btn share-copy">
                                {copied ? t("detail.copied") : t("detail.copyLink")}
                            </button>
                            <a href={linkedInUrl} target="_blank" rel="noreferrer" className="share-btn share-linkedin">
                                LinkedIn
                            </a>
                        </div>
                        <div style={{ marginTop: "0.75rem" }}>
                            <button onClick={() => { setShowReport(true); setReportDone(false); setReportReason(""); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "0.78rem", cursor: "pointer", padding: 0, letterSpacing: "0.02em" }}>
                                {t("report.btn")}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Right Column / Sidebar ── */}
                <div className="detail-sidebar">
                    <div className="donate-card">
                        {/* Progress */}
                        <div className="donate-progress">
                            <div className="donate-amounts">
                                <span className="donate-raised">{parseFloat(raisedAvax).toFixed(2)} AVAX</span>
                                <span className="donate-goal">{t("detail.of")} {parseFloat(goalAvax).toFixed(2)} AVAX</span>
                            </div>
                            <div className="donate-bar">
                                <div className="donate-bar-fill" style={{ width: `${progress}%` }} />
                            </div>
                            <div className="donate-meta">
                                <span>👥 {donorCount} {t("detail.donorCount")}</span>
                                <span>{progress.toFixed(1)}% {t("detail.funded")}</span>
                            </div>
                        </div>

                        {/* Rich success state */}
                        {txHash && (
                            <div className="donation-success-card">
                                {confetti && <ConfettiEffect />}
                                <div className="success-tick">✓</div>
                                <h4>{t("detail.thankYou")} 🎉</h4>
                                <p>{t("detail.donationConfirmed")}</p>
                                <a
                                    href={`https://testnet.snowtrace.io/tx/${txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="success-tx-link"
                                >
                                    {t("detail.viewTx")}
                                </a>
                            </div>
                        )}

                        {/* Error */}
                        {donateError && (
                            <div className="tx-error">⚠️ {donateError}</div>
                        )}

                        {/* Donate form */}
                        {campaign.status === 0 && (
                            <div className="donate-form">
                                <label>{t("detail.donationAmount")}</label>
                                <div className="donate-input-wrap">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        value={donateAmount}
                                        disabled={isDonating || isConfirming}
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
                                            disabled={isDonating || isConfirming}
                                        >
                                            {amt}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleDonate}
                                    className="btn-primary btn-full"
                                    disabled={isDonating || isConfirming}
                                >
                                    {!isConnected
                                        ? t("detail.connectToDonate")
                                        : isDonating
                                            ? t("detail.confirmWallet")
                                            : isConfirming
                                                ? t("detail.confirmChain")
                                                : `${t("detail.donateBtn")} ${donateAmount || "0"} AVAX →`}
                                </button>

                                <p className="donate-note">
                                    {t("detail.donateNote")}
                                </p>
                            </div>
                        )}

                        {campaign.status !== 0 && (
                            <p className="donate-note" style={{ textAlign: "center", paddingTop: "0.5rem" }}>
                                {t("detail.campaignEnded")} {campaign.statusText.toLowerCase()}.
                            </p>
                        )}

                        {isOwner && campaign.status === 3 && (
                            <div className="tx-success">✓ {t("detail.campaignCompleted")}</div>
                        )}
                    </div>
                </div>
            </div>

            {showReport && (
              <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowReport(false)}>
                <div style={{ background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px 24px 0 0", padding: "1.5rem 1.5rem 2.5rem", width: "100%", maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", margin: "0 auto 1.25rem" }} />
                  {reportDone ? (
                    <div style={{ textAlign: "center", padding: "1rem 0" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>✅</div>
                      <p style={{ color: "#fff", fontWeight: 600 }}>{t("report.success")}</p>
                    </div>
                  ) : (
                    <>
                      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" }}>{t("report.title")}</h3>
                      <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", marginBottom: "1.25rem", lineHeight: 1.5 }}>{t("report.sub")}</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1.25rem" }}>
                        {(["report.reason1", "report.reason2", "report.reason3", "report.reason4"] as const).map(key => (
                          <button key={key} onClick={() => setReportReason(t(key))} style={{ textAlign: "left", padding: "0.75rem 1rem", borderRadius: 12, border: reportReason === t(key) ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,0.1)", background: reportReason === t(key) ? "rgba(232,65,66,0.08)" : "rgba(255,255,255,0.03)", color: "#fff", fontSize: "0.88rem", cursor: "pointer" }}>
                            {t(key)}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button onClick={() => setShowReport(false)} style={{ flex: 1, padding: "0.875rem", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "none", color: "rgba(255,255,255,0.6)", fontSize: "0.88rem", cursor: "pointer" }}>{t("report.cancel")}</button>
                        <button disabled={!reportReason} onClick={handleReport} style={{ flex: 1, padding: "0.875rem", borderRadius: 12, border: "none", background: reportReason ? "var(--accent)" : "rgba(255,255,255,0.1)", color: "#fff", fontSize: "0.88rem", fontWeight: 600, cursor: reportReason ? "pointer" : "not-allowed" }}>{t("report.submit")}</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
        </div>
    );
}
