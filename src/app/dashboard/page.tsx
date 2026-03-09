"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { useWallet } from "@/components/WalletProvider";
import { getReadContract } from "@/lib/contract";
import { fetchCampaign, type CampaignData } from "@/hooks/useShavaxre";
import SectionLabel from "@/components/SectionLabel";
import { useLang } from "@/contexts/LangContext";

interface DonorCampaign {
    campaign: CampaignData;
    myDonation: string;
}

interface TxEvent {
    campaignId: number;
    amount: string;
    txHash: string;
}

/* ─── Tier helpers ─── */
const TIERS = [
    { min: 0,   max: 100,  key: "tier.seed"   as const, emoji: "🌱", color: "#22c55e" },
    { min: 101, max: 300,  key: "tier.sprout" as const, emoji: "🌿", color: "#10b981" },
    { min: 301, max: 700,  key: "tier.tree"   as const, emoji: "🌳", color: "#3b82f6" },
    { min: 701, max: Infinity, key: "tier.forest" as const, emoji: "🏔️", color: "#E84142" },
];
function getTier(score: number) {
    return TIERS.find(t => score >= t.min && score <= t.max) ?? TIERS[0];
}
function getNextThreshold(score: number) {
    const idx = TIERS.findIndex(t => score >= t.min && score <= t.max);
    return idx < TIERS.length - 1 ? TIERS[idx + 1].min : null;
}

export default function DashboardPage() {
    const { address, isConnected, connect } = useWallet();
    const { t } = useLang();

    const [donorCampaigns, setDonorCampaigns] = useState<DonorCampaign[]>([]);
    const [recentTxs, setRecentTxs] = useState<TxEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDonated: 0,
        campaignsSupported: 0,
        impactScore: 0,
        avgDonation: 0,
        createdCampaigns: 0,
        hasWhale: false,
    });

    useEffect(() => {
        if (!isConnected || !address) {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                setLoading(true);
                const contract = getReadContract();
                const count = await contract.campaignCount();
                const n = Number(count);

                const found: DonorCampaign[] = [];
                let totalDonatedWei = 0n;
                let createdCampaigns = 0;

                for (let i = 0; i < n; i++) {
                    const campaign = await fetchCampaign(i);
                    if (campaign.creator?.toLowerCase() === address?.toLowerCase()) {
                        createdCampaigns++;
                    }
                    const donation = await contract.getDonation(i, address);
                    if (donation > 0n) {
                        found.push({
                            campaign,
                            myDonation: parseFloat(ethers.formatEther(donation)).toFixed(4),
                        });
                        totalDonatedWei += donation;
                    }
                }

                const totalDonated = parseFloat(ethers.formatEther(totalDonatedWei));
                const campaignsSupported = found.length;
                const impactScore = Math.floor(totalDonated * 100 + campaignsSupported * 50);
                const avgDonation = campaignsSupported > 0 ? totalDonated / campaignsSupported : 0;

                setDonorCampaigns(found);
                setStats({ totalDonated, campaignsSupported, impactScore, avgDonation, createdCampaigns, hasWhale: false });

                // Event query
                try {
                    const provider = contract.runner?.provider;
                    if (provider && 'getBlockNumber' in provider) {
                        const rpcProvider = provider as ethers.JsonRpcProvider;
                        const currentBlock = await rpcProvider.getBlockNumber();
                        const fromBlock = Math.max(0, currentBlock - 2048);
                        const filter = contract.filters.Donated(null, address);
                        const events = await contract.queryFilter(filter, fromBlock, currentBlock);

                        let hasWhale = false;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const txs: TxEvent[] = [...events].reverse().slice(0, 10).map((e: any) => {
                            const amountEth = parseFloat(ethers.formatEther(e.args[2]));
                            if (amountEth >= 1) hasWhale = true;
                            return {
                                campaignId: Number(e.args[0]),
                                amount: amountEth.toFixed(4),
                                txHash: e.transactionHash,
                            };
                        });
                        setRecentTxs(txs);
                        setStats(prev => ({ ...prev, hasWhale }));
                    }
                } catch (eventErr) {
                    console.warn("Could not load donation events:", eventErr);
                }
            } catch (e) {
                console.error("Dashboard load error:", e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [isConnected, address]);

    if (!isConnected) {
        return (
            <div className="page-container">
                <div className="dashboard-connect">
                    <div className="dashboard-connect-icon">👛</div>
                    <h2>{t("dash.connectTitle")}</h2>
                    <p>{t("dash.connectDesc")}</p>
                    <button onClick={connect} className="btn-primary">{t("common.connectWallet")}</button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-container">
                <p style={{ textAlign: "center", opacity: 0.6, marginTop: "4rem" }}>
                    {t("dash.loading")}
                </p>
            </div>
        );
    }

    const { impactScore, campaignsSupported, totalDonated, avgDonation, createdCampaigns, hasWhale } = stats;
    const tier = getTier(impactScore);
    const nextThreshold = getNextThreshold(impactScore);
    const tierProgress = nextThreshold
        ? Math.min(100, Math.round(((impactScore - tier.min) / (nextThreshold - tier.min)) * 100))
        : 100;

    /* ─── Achievements ─── */
    const achievements = [
        {
            id: "first-drop",
            emoji: "💧",
            nameKey: "achieve.firstDrop.name" as const,
            descKey: "achieve.firstDrop.desc" as const,
            unlocked: totalDonated > 0,
        },
        {
            id: "diversifier",
            emoji: "🎯",
            nameKey: "achieve.diversifier.name" as const,
            descKey: "achieve.diversifier.desc" as const,
            unlocked: campaignsSupported >= 3,
        },
        {
            id: "whale",
            emoji: "🐋",
            nameKey: "achieve.whale.name" as const,
            descKey: "achieve.whale.desc" as const,
            unlocked: hasWhale,
        },
        {
            id: "builder",
            emoji: "🏗️",
            nameKey: "achieve.builder.name" as const,
            descKey: "achieve.builder.desc" as const,
            unlocked: createdCampaigns >= 1,
        },
        {
            id: "centurion",
            emoji: "⚔️",
            nameKey: "achieve.centurion.name" as const,
            descKey: "achieve.centurion.desc" as const,
            unlocked: impactScore >= 100,
        },
    ];
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="page-container">
            <div className="dashboard-header">
                <SectionLabel text={t("dash.title")} />
                <h1 className="page-title" style={{ textAlign: "left", marginBottom: "0.25rem" }}>
                    {t("dash.impact")}
                </h1>
                <p className="dashboard-wallet-label">{address}</p>
            </div>

            {/* ── Tier Badge ── */}
            <div className="tier-badge-section">
                <div className="tier-badge-label">
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", opacity: 0.7 }}>
                        // {t("tier.label")}
                    </span>
                </div>
                <div className="tier-badge-inner" style={{ borderColor: tier.color + "40" }}>
                    <div className="tier-badge-emoji">{tier.emoji}</div>
                    <div className="tier-badge-info">
                        <div className="tier-badge-name" style={{ color: tier.color }}>{t(tier.key)}</div>
                        <div className="tier-badge-progress-wrap">
                            <div className="tier-badge-bar-bg">
                                <div
                                    className="tier-badge-bar-fill"
                                    style={{ width: `${tierProgress}%`, background: tier.color }}
                                />
                            </div>
                            {nextThreshold ? (
                                <span className="tier-badge-progress-label">
                                    {impactScore} / {nextThreshold} pts · {t("tier.progressTo")}
                                </span>
                            ) : (
                                <span className="tier-badge-progress-label" style={{ color: tier.color }}>
                                    {t("tier.maxLevel")}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="tier-badge-score" style={{ color: tier.color }}>
                        {impactScore}
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 400 }}> pts</span>
                    </div>
                </div>
            </div>

            {/* ── Stats Grid ── */}
            <div className="dashboard-stats">
                <div className="dash-stat-card">
                    <span className="dash-stat-label">{t("dash.totalDonated")}</span>
                    <span className="dash-stat-value">{totalDonated.toFixed(4)}</span>
                    <span className="dash-stat-unit">AVAX</span>
                </div>
                <div className="dash-stat-card">
                    <span className="dash-stat-label">{t("dash.campaignsSupported")}</span>
                    <span className="dash-stat-value">{campaignsSupported}</span>
                    <span className="dash-stat-unit">{t("dash.campaignsUnit")}</span>
                </div>
                <div className="dash-stat-card accent">
                    <span className="dash-stat-label">{t("dash.impactScore")}</span>
                    <span className="dash-stat-value">{impactScore}</span>
                    <span className="dash-stat-unit">{t("dash.pts")}</span>
                </div>
                <div className="dash-stat-card">
                    <span className="dash-stat-label">{t("dash.avgDonation")}</span>
                    <span className="dash-stat-value">{avgDonation.toFixed(4)}</span>
                    <span className="dash-stat-unit">AVAX</span>
                </div>
            </div>

            {/* ── Achievements ── */}
            <div className="dashboard-section">
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.25rem", gap: "1rem", flexWrap: "wrap" }}>
                    <SectionLabel text={t("achieve.title")} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                        {unlockedCount}/{achievements.length}
                    </span>
                </div>
                <div className="achievements-grid">
                    {achievements.map((a) => (
                        <div
                            key={a.id}
                            className={`achievement-card ${a.unlocked ? "achievement-unlocked" : "achievement-locked"}`}
                        >
                            <div className="achievement-emoji">
                                {a.unlocked ? a.emoji : "🔒"}
                            </div>
                            <div className="achievement-info">
                                <div className="achievement-name">{t(a.nameKey)}</div>
                                <div className="achievement-desc">{t(a.descKey)}</div>
                            </div>
                            {a.unlocked && <div className="achievement-check">✓</div>}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Supported Campaigns ── */}
            <div className="dashboard-section">
                <SectionLabel text={t("dash.supported")} />
                {donorCampaigns.length === 0 ? (
                    <div className="dashboard-empty">
                        <p>{t("dash.noDonations")}</p>
                        <Link href="/campaigns" className="btn-primary" style={{ marginTop: "1rem" }}>
                            {t("common.browseCampaigns")}
                        </Link>
                    </div>
                ) : (
                    <div className="dash-table">
                        <div className="dash-table-header">
                            <span>{t("dash.colCampaign")}</span>
                            <span>{t("dash.colStatus")}</span>
                            <span>{t("dash.colDonation")}</span>
                            <span></span>
                        </div>
                        {donorCampaigns.map(({ campaign, myDonation }) => (
                            <div key={campaign.id} className="dash-table-row">
                                <span className="dash-row-title">{t("common.campaign")} #{campaign.id}</span>
                                <span className={`dash-row-status ${campaign.status === 0 ? "status-active" : campaign.status === 3 ? "status-claimed" : "status-ended"}`}>
                                    {campaign.statusText}
                                </span>
                                <span className="dash-row-amount">{myDonation} AVAX</span>
                                <Link href={`/campaign/${campaign.id}`} className="dash-row-link">
                                    {t("common.view")}
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Recent Transactions ── */}
            {recentTxs.length > 0 && (
                <div className="dashboard-section">
                    <SectionLabel text={t("dash.recentTx")} />
                    <div className="dash-txs">
                        {recentTxs.map((tx, i) => (
                            <div key={i} className="dash-tx-row">
                                <span className="dash-tx-dot" />
                                <div className="dash-tx-info">
                                    <span className="dash-tx-amount">{tx.amount} AVAX</span>
                                    <span className="dash-tx-arrow">&rarr;</span>
                                    <span className="dash-tx-title">{t("common.campaign")} #{tx.campaignId}</span>
                                </div>
                                <a
                                    href={`https://testnet.snowtrace.io/tx/${tx.txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="dash-tx-link"
                                >
                                    {t("common.viewOnSnowtrace")}
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
