"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { JsonRpcProvider, formatEther } from "ethers";
import { useWallet } from "@/components/WalletProvider";
import { getContract, getCampaignById, CampaignDisplay } from "@/lib/contract";
import SectionLabel from "@/components/SectionLabel";

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

interface DonorCampaign {
    campaign: CampaignDisplay;
    myDonation: string;
}

interface TxEvent {
    campaignId: number;
    campaignTitle: string;
    amount: string;
    txHash: string;
}

export default function DashboardPage() {
    const { address, isConnected, connect } = useWallet();

    const [donorCampaigns, setDonorCampaigns] = useState<DonorCampaign[]>([]);
    const [recentTxs, setRecentTxs] = useState<TxEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDonated: 0,
        campaignsSupported: 0,
        impactScore: 0,
        avgDonation: 0,
    });

    useEffect(() => {
        if (!isConnected || !address) {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                setLoading(true);
                const provider = new JsonRpcProvider(FUJI_RPC);
                const contract = getContract(provider);

                const count = await contract.campaignCount();
                const n = Number(count);

                const found: DonorCampaign[] = [];
                let totalDonatedWei = 0n;

                for (let i = 0; i < n; i++) {
                    const donation = await contract.getDonation(i, address);
                    if (donation > 0n) {
                        const campaign = await getCampaignById(provider, i);
                        found.push({
                            campaign,
                            myDonation: parseFloat(formatEther(donation)).toFixed(4),
                        });
                        totalDonatedWei += donation;
                    }
                }

                const totalDonated = parseFloat(formatEther(totalDonatedWei));
                const campaignsSupported = found.length;
                const impactScore = Math.floor(totalDonated * 100 + campaignsSupported * 50);
                const avgDonation = campaignsSupported > 0 ? totalDonated / campaignsSupported : 0;

                setDonorCampaigns(found);
                setStats({ totalDonated, campaignsSupported, impactScore, avgDonation });

                // Event query ayrı try-catch — başarısız olursa dashboard yine gösterilir
                try {
                    const currentBlock = await provider.getBlockNumber();
                    const fromBlock = Math.max(0, currentBlock - 5000);
                    const filter = contract.filters.DonationReceived(null, address);
                    const events = await contract.queryFilter(filter, fromBlock, currentBlock);

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const txs: TxEvent[] = await Promise.all(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        [...events].reverse().slice(0, 10).map(async (e: any) => {
                            const campaignId = Number(e.args[0]);
                            const amount = formatEther(e.args[2]);
                            let campaignTitle = `Campaign #${campaignId}`;
                            try {
                                const c = await getCampaignById(provider, campaignId);
                                campaignTitle = c.title;
                            } catch { /* ignore */ }
                            return {
                                campaignId,
                                campaignTitle,
                                amount: parseFloat(amount).toFixed(4),
                                txHash: e.transactionHash,
                            };
                        })
                    );
                    setRecentTxs(txs);
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
                    <h2>Connect Your Wallet</h2>
                    <p>Connect your wallet to view your donation history and impact score.</p>
                    <button onClick={connect} className="btn-primary">Connect Wallet</button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-container">
                <p style={{ textAlign: "center", opacity: 0.6, marginTop: "4rem" }}>
                    Loading your dashboard from blockchain...
                </p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="dashboard-header">
                <SectionLabel text="My Dashboard" />
                <h1 className="page-title" style={{ textAlign: "left", marginBottom: "0.25rem" }}>
                    Your Impact
                </h1>
                <p className="dashboard-wallet-label">{address}</p>
            </div>

            {/* ── Stats Grid ── */}
            <div className="dashboard-stats">
                <div className="dash-stat-card">
                    <span className="dash-stat-label">Total Donated</span>
                    <span className="dash-stat-value">{stats.totalDonated.toFixed(4)}</span>
                    <span className="dash-stat-unit">AVAX</span>
                </div>
                <div className="dash-stat-card">
                    <span className="dash-stat-label">Campaigns Supported</span>
                    <span className="dash-stat-value">{stats.campaignsSupported}</span>
                    <span className="dash-stat-unit">campaigns</span>
                </div>
                <div className="dash-stat-card accent">
                    <span className="dash-stat-label">Impact Score</span>
                    <span className="dash-stat-value">{stats.impactScore}</span>
                    <span className="dash-stat-unit">pts</span>
                </div>
                <div className="dash-stat-card">
                    <span className="dash-stat-label">Avg Donation</span>
                    <span className="dash-stat-value">{stats.avgDonation.toFixed(4)}</span>
                    <span className="dash-stat-unit">AVAX</span>
                </div>
            </div>

            {/* ── Supported Campaigns ── */}
            <div className="dashboard-section">
                <SectionLabel text="Supported Campaigns" />
                {donorCampaigns.length === 0 ? (
                    <div className="dashboard-empty">
                        <p>You haven&apos;t donated to any campaigns yet.</p>
                        <Link href="/campaigns" className="btn-primary" style={{ marginTop: "1rem" }}>
                            Browse Campaigns
                        </Link>
                    </div>
                ) : (
                    <div className="dash-table">
                        <div className="dash-table-header">
                            <span>Campaign</span>
                            <span>Status</span>
                            <span>My Donation</span>
                            <span></span>
                        </div>
                        {donorCampaigns.map(({ campaign, myDonation }) => (
                            <div key={campaign.id} className="dash-table-row">
                                <span className="dash-row-title">{campaign.title}</span>
                                <span className={`dash-row-status ${campaign.active ? "status-active" : campaign.claimed ? "status-claimed" : "status-ended"}`}>
                                    {campaign.active ? "Active" : campaign.claimed ? "Claimed" : "Ended"}
                                </span>
                                <span className="dash-row-amount">{myDonation} AVAX</span>
                                <Link href={`/campaign/${campaign.id}`} className="dash-row-link">
                                    View →
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Recent Transactions ── */}
            {recentTxs.length > 0 && (
                <div className="dashboard-section">
                    <SectionLabel text="Recent Transactions" />
                    <div className="dash-txs">
                        {recentTxs.map((tx, i) => (
                            <div key={i} className="dash-tx-row">
                                <span className="dash-tx-dot" />
                                <div className="dash-tx-info">
                                    <span className="dash-tx-amount">{tx.amount} AVAX</span>
                                    <span className="dash-tx-arrow">→</span>
                                    <span className="dash-tx-title">{tx.campaignTitle}</span>
                                </div>
                                <a
                                    href={`https://testnet.snowtrace.io/tx/${tx.txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="dash-tx-link"
                                >
                                    View on Snowtrace ↗
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
