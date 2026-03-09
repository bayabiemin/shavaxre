"use client";

import { useEffect, useState, useMemo } from "react";
import { ethers } from "ethers";
import CampaignCard from "@/components/CampaignCard";
import Link from "next/link";
import SectionLabel from "@/components/SectionLabel";
import { fetchAllCampaigns, type CampaignData } from "@/hooks/useShavaxre";

type SortKey = "newest" | "most-funded" | "most-donors";

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortKey>("newest");

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const all = await fetchAllCampaigns();
                const active = all.filter(c => c.status === 0);
                setCampaigns(active);
            } catch (err) {
                console.error("Failed to load campaigns:", err);
                setError("Could not load campaigns from blockchain.");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = useMemo(() => {
        const list = [...campaigns];
        if (sortBy === "newest") {
            list.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
        } else if (sortBy === "most-funded") {
            list.sort((a, b) => Number(b.totalRaised - a.totalRaised));
        } else if (sortBy === "most-donors") {
            list.sort((a, b) => Number(b.uniqueDonors - a.uniqueDonors));
        }
        return list;
    }, [campaigns, sortBy]);

    return (
        <div className="page-container">
            <div className="page-header">
                <SectionLabel text="Browse Campaigns" />
                <h1 className="page-title">Active Campaigns</h1>
                <p className="page-subtitle">
                    Browse verified student campaigns and donate AVAX directly — zero middlemen.
                </p>
                <Link href="/create" className="btn-primary" style={{ marginTop: "1rem" }}>
                    + Create Campaign
                </Link>
            </div>

            {/* ── Sort bar ── */}
            <div className="campaigns-controls">
                <select
                    className="sort-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortKey)}
                >
                    <option value="newest">Sort: Newest</option>
                    <option value="most-funded">Sort: Most Funded</option>
                    <option value="most-donors">Sort: Most Donors</option>
                </select>
            </div>

            {loading && (
                <p style={{ textAlign: "center", opacity: 0.6, marginTop: "2rem" }}>
                    Loading campaigns from blockchain...
                </p>
            )}

            {error && (
                <p style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>{error}</p>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="campaigns-empty">
                    <p>No campaigns found.</p>
                    <Link href="/create" className="btn-primary" style={{ marginTop: "1rem" }}>
                        Be the first!
                    </Link>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <>
                    <p className="campaigns-count">
                        {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
                    </p>
                    <div className="campaigns-grid">
                        {filtered.map(campaign => (
                            <CampaignCard key={campaign.id} {...campaign} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
