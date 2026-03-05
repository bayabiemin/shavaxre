"use client";

import { useEffect, useState } from "react";
import { JsonRpcProvider } from "ethers";
import CampaignCard from "@/components/CampaignCard";
import Link from "next/link";
import { getActiveCampaigns, CampaignDisplay } from "@/lib/contract";

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<CampaignDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Active Campaigns</h1>
                <p className="page-subtitle">
                    Browse verified student campaigns and donate AVAX directly — zero middlemen.
                </p>
                <Link href="/create" className="btn-primary" style={{ marginTop: "1rem" }}>
                    + Create Campaign
                </Link>
            </div>

            {loading && (
                <p style={{ textAlign: "center", opacity: 0.6, marginTop: "2rem" }}>
                    Loading campaigns from blockchain...
                </p>
            )}

            {error && (
                <p style={{ textAlign: "center", color: "red", marginTop: "2rem" }}>{error}</p>
            )}

            {!loading && !error && campaigns.length === 0 && (
                <p style={{ textAlign: "center", opacity: 0.6, marginTop: "2rem" }}>
                    No active campaigns yet.{" "}
                    <Link href="/create" style={{ textDecoration: "underline" }}>
                        Be the first!
                    </Link>
                </p>
            )}

            {!loading && campaigns.length > 0 && (
                <div className="campaigns-grid">
                    {campaigns.map((campaign) => (
                        <CampaignCard key={campaign.id} {...campaign} />
                    ))}
                </div>
            )}
        </div>
    );
}
