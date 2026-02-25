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

    const icon = categoryIcons[category] || "✨";

    return (
        <Link href={`/campaign/${id}`} className="campaign-card">
            <div className="card-header">
                <span className="card-category">
                    {icon} {category}
                </span>
                <span className="card-days">
                    {daysLeft > 0 ? `${daysLeft}d left` : "Ended"}
                </span>
            </div>

            <h3 className="card-title">{title}</h3>
            <p className="card-description">
                {description.length > 100 ? description.slice(0, 100) + "..." : description}
            </p>

            <div className="card-progress-container">
                <div className="card-progress-bar">
                    <div
                        className="card-progress-fill"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                <div className="card-progress-info">
                    <span className="card-raised">{raisedAvax} AVAX</span>
                    <span className="card-goal">of {goalAvax} AVAX</span>
                </div>
            </div>

            <div className="card-footer">
                <span className="card-donors">
                    👥 {donorCount} {donorCount === 1 ? "donor" : "donors"}
                </span>
                <span className="card-student" title={student}>
                    {student.slice(0, 6)}...{student.slice(-4)}
                </span>
            </div>
        </Link>
    );
}
