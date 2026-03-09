"use client";

import { useEffect, useState, useMemo } from "react";
import { ethers } from "ethers";
import CampaignCard from "@/components/CampaignCard";
import Link from "next/link";
import SectionLabel from "@/components/SectionLabel";
import { fetchAllCampaigns, type CampaignData } from "@/hooks/useShavaxre";
import { useLang } from "@/contexts/LangContext";

type SortKey = "newest" | "most-funded" | "most-donors";

export default function CampaignsPage() {
    const { t } = useLang();
    const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortKey>("newest");

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const all = await fetchAllCampaigns();
                console.log("[Campaigns] all:", all.length, "active:", all.filter(c => c.status === 0).length);
                const active = all.filter(c => c.status === 0);

                // Metadata resolve
                const enriched = await Promise.all(
                    active.map(async (c) => {
                        try {
                            if (!c.metadataURI) return c;
                            const url = c.metadataURI.startsWith("ipfs://")
                                ? c.metadataURI.replace("ipfs://", "https://ipfs.io/ipfs/")
                                : c.metadataURI;
                            const res = await fetch(url);
                            const meta = await res.json();
                            return { ...c, title: meta.title || meta.name, description: meta.description, category: meta.category };
                        } catch { return c; }
                    })
                );

                setCampaigns(enriched);
            } catch (err) {
                console.error("Failed to load campaigns:", err);
                setError(t("campaigns.error"));
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
                <SectionLabel text={t("campaigns.label")} />
                <h1 className="page-title">{t("campaigns.title")}</h1>
                <p className="page-subtitle">
                    {t("campaigns.subtitle")}
                </p>
                <Link href="/create" className="btn-primary" style={{ marginTop: "1rem" }}>
                    {t("campaigns.create")}
                </Link>
            </div>

            {/* ── Sort bar ── */}
            <div className="campaigns-controls">
                <select
                    className="sort-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortKey)}
                >
                    <option value="newest">{t("campaigns.sortNewest")}</option>
                    <option value="most-funded">{t("campaigns.sortFunded")}</option>
                    <option value="most-donors">{t("campaigns.sortDonors")}</option>
                </select>
            </div>

            {loading && (
                <p style={{ textAlign: "center", opacity: 0.6, marginTop: "2rem" }}>
                    {t("campaigns.loading")}
                </p>
            )}

            {error && (
                <p style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>{error}</p>
            )}

            {!loading && !error && filtered.length === 0 && (
                <div className="campaigns-empty">
                    <p>{t("campaigns.empty")}</p>
                    <Link href="/create" className="btn-primary" style={{ marginTop: "1rem" }}>
                        {t("campaigns.beFirst")}
                    </Link>
                </div>
            )}

            {!loading && filtered.length > 0 && (
                <>
                    <p className="campaigns-count">
                        {filtered.length} {filtered.length !== 1 ? t("campaigns.countPlural") : t("campaigns.count")}
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
