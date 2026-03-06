"use client";

import { useEffect, useState, useMemo } from "react";
import { JsonRpcProvider } from "ethers";
import CampaignCard from "@/components/CampaignCard";
import Link from "next/link";
import SectionLabel from "@/components/SectionLabel";
import { getActiveCampaigns, CampaignDisplay } from "@/lib/contract";

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

const CATEGORIES = ["All", "Tuition", "Books", "Research", "Equipment", "Scholarship", "Other"];

type SortKey = "newest" | "most-funded" | "ending-soon";

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<CampaignDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState("All");
    const [sortBy, setSortBy] = useState<SortKey>("newest");

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const provider = new JsonRpcProvider(FUJI_RPC);
                const data = await getActiveCampaigns(provider);
                setCampaigns(data);
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
        let list = activeCategory === "All"
            ? [...campaigns]
            : campaigns.filter(c => c.category === activeCategory);

        if (sortBy === "newest") {
            list = list.reverse();
        } else if (sortBy === "most-funded") {
            list = list.sort((a, b) => parseFloat(b.raisedAvax) - parseFloat(a.raisedAvax));
        } else if (sortBy === "ending-soon") {
            list = list.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
        }
        return list;
    }, [campaigns, activeCategory, sortBy]);

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

            {/* ── Filter & Sort bar ── */}
            <div className="campaigns-controls">
                <div className="category-filters">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`cat-chip ${activeCategory === cat ? "active" : ""}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <select
                    className="sort-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortKey)}
                >
                    <option value="newest">Sort: Newest</option>
                    <option value="most-funded">Sort: Most Funded</option>
                    <option value="ending-soon">Sort: Ending Soon</option>
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
                    <p>No campaigns found{activeCategory !== "All" ? ` in "${activeCategory}"` : ""}.</p>
                    {activeCategory !== "All" ? (
                        <button onClick={() => setActiveCategory("All")} className="btn-secondary" style={{ marginTop: "1rem" }}>
                            Clear Filter
                        </button>
                    ) : (
                        <Link href="/create" className="btn-primary" style={{ marginTop: "1rem" }}>
                            Be the first!
                        </Link>
                    )}
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <>
                    <p className="campaigns-count">
                        {filtered.length} campaign{filtered.length !== 1 ? "s" : ""}
                        {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
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
