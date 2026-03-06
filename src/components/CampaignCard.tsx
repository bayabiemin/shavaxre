import Link from "next/link";

interface CampaignCardProps {
    id: number;
    title: string;
    description: string;
    category: string;
    goalAvax: string;
    raisedAvax: string;
    donorCount: number;
    progress: number;
    deadline: Date;
    student: string;
}

export default function CampaignCard({
    id,
    title,
    description,
    category,
    goalAvax,
    raisedAvax,
    donorCount,
    progress,
    deadline,
    student,
}: CampaignCardProps) {
    const daysLeft = Math.max(
        0,
        Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );

    const categoryIcons: Record<string, string> = {
        Tuition: "🎓",
        Books: "📚",
        Research: "🔬",
        Housing: "🏠",
        Technology: "💻",
        Other: "✨",
    };

    const clampedProgress = Math.min(progress, 100);

    return (
        <Link href={`/campaign/${id}`} className="campaign-card">
            {/* Progress bar — top of card, full width */}
            <div className="card-progress-bar-top">
                <div
                    className="card-progress-fill-top"
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>

            <div className="card-body">
                {/* Category + days */}
                <div className="card-meta-row">
                    <span className="card-category">
                        {categoryIcons[category] || "✨"} {category}
                    </span>
                    <span className="card-days">
                        {daysLeft > 0 ? `${daysLeft}d left` : "Ended"}
                    </span>
                </div>

                {/* Title */}
                <h3 className="card-title">{title}</h3>

                {/* Student address */}
                <p className="card-student-mono">
                    by {student.slice(0, 6)}…{student.slice(-4)}
                </p>

                {/* Description */}
                <p className="card-description">
                    {description.length > 90 ? description.slice(0, 90) + "…" : description}
                </p>

                {/* Amount + progress */}
                <div className="card-amount-row">
                    <span className="card-raised-big">{raisedAvax}</span>
                    <span className="card-goal-small">/ {goalAvax} AVAX</span>
                    <span className="card-pct">{clampedProgress.toFixed(0)}%</span>
                </div>

                <div className="card-progress-bar">
                    <div
                        className="card-progress-fill"
                        style={{ width: `${clampedProgress}%` }}
                    />
                </div>

                {/* Footer */}
                <div className="card-footer">
                    <span className="card-donors">👥 {donorCount} {donorCount === 1 ? "donor" : "donors"}</span>
                    <span className="card-donate-link">Donate Now →</span>
                </div>
            </div>
        </Link>
    );
}
