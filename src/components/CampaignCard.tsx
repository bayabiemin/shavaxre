"use client";

import Link from "next/link";
import { ethers } from "ethers";
import { useLang } from "@/contexts/LangContext";

interface CampaignCardProps {
    id: number;
    creator: string;
    metadataURI: string;
    goalAmount: bigint;
    totalRaised: bigint;
    uniqueDonors: bigint;
    likes: bigint;
    status: number;
    statusText: string;
    createdAt: bigint;
    // Optional resolved metadata
    title?: string;
    description?: string;
    category?: string;
}

export default function CampaignCard({
    id,
    creator,
    goalAmount,
    totalRaised,
    uniqueDonors,
    likes,
    statusText,
    title,
    description,
    category,
}: CampaignCardProps) {
    const { t } = useLang();
    const goalAvax = ethers.formatEther(goalAmount);
    const raisedAvax = ethers.formatEther(totalRaised);
    const goal = parseFloat(goalAvax);
    const raised = parseFloat(raisedAvax);
    const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
    const donors = Number(uniqueDonors);

    const categoryIcons: Record<string, string> = {
        Tuition: "🎓",
        Books: "📚",
        Research: "🔬",
        Housing: "🏠",
        Technology: "💻",
        Other: "✨",
    };

    return (
        <Link href={`/campaign/${id}`} className="campaign-card">
            {/* Progress bar — top of card, full width */}
            <div className="card-progress-bar-top">
                <div
                    className="card-progress-fill-top"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="card-body">
                {/* Category + status */}
                <div className="card-meta-row">
                    <span className="card-category">
                        {categoryIcons[category || "Other"] || "✨"} {category || t("common.campaign")}
                    </span>
                    <span className="card-days">
                        {statusText}
                    </span>
                </div>

                {/* Title */}
                <h3 className="card-title">{title || `${t("common.campaign")} #${id}`}</h3>

                {/* Creator address */}
                <p className="card-student-mono">
                    {t("campaignCard.by")} {creator.slice(0, 6)}...{creator.slice(-4)}
                </p>

                {/* Description */}
                {description && (
                    <p className="card-description">
                        {description.length > 90 ? description.slice(0, 90) + "..." : description}
                    </p>
                )}

                {/* Amount + progress */}
                <div className="card-amount-row">
                    <span className="card-raised-big">{parseFloat(raisedAvax).toFixed(2)}</span>
                    <span className="card-goal-small">/ {parseFloat(goalAvax).toFixed(2)} AVAX</span>
                    <span className="card-pct">{progress.toFixed(0)}%</span>
                </div>

                <div className="card-progress-bar">
                    <div
                        className="card-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Footer */}
                <div className="card-footer">
                    <span className="card-donors">👥 {donors} {donors === 1 ? t("campaignCard.donor") : t("campaignCard.donors")}</span>
                    <span className="card-donors">❤️ {Number(likes)}</span>
                    <span className="card-donate-link">{t("campaignCard.donateNow")}</span>
                </div>
            </div>
        </Link>
    );
}
