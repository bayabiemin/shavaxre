"use client";

import { useState } from "react";
import { useWallet } from "@/components/WalletProvider";
import { createCampaign } from "@/lib/contract";

export default function CreatePage() {
    const { signer, isConnected, connect } = useWallet();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Tuition",
        goalAvax: "",
        durationDays: "30",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const categories = ["Tuition", "Books", "Research", "Housing", "Technology", "Other"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected || !signer) {
            await connect();
            return;
        }

        try {
            setIsSubmitting(true);
            await createCampaign(
                signer,
                formData.title,
                formData.description,
                formData.category,
                formData.goalAvax,
                parseInt(formData.durationDays)
            );
            setSuccess(true);
        } catch (err) {
            console.error("Campaign creation failed:", err);
            alert("Transaction failed. Make sure you have enough AVAX for gas.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="page-container">
                <div className="success-card">
                    <div className="success-icon">🎉</div>
                    <h2>Campaign Created!</h2>
                    <p>Your education funding campaign is now live on the Avalanche blockchain.</p>
                    <a href="/campaigns" className="btn-primary">
                        View All Campaigns
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Create a Campaign</h1>
                <p className="page-subtitle">
                    Tell donors about your education goals. Your campaign will be recorded on-chain for full
                    transparency.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="create-form">
                <div className="form-group">
                    <label htmlFor="title">Campaign Title</label>
                    <input
                        id="title"
                        type="text"
                        placeholder="e.g. Final Year Computer Science Tuition"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        rows={5}
                        placeholder="Describe your education goals and how the funds will be used..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="goalAvax">Goal Amount (AVAX)</label>
                        <input
                            id="goalAvax"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="50.00"
                            value={formData.goalAvax}
                            onChange={(e) => setFormData({ ...formData, goalAvax: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="durationDays">Duration (Days)</label>
                        <input
                            id="durationDays"
                            type="number"
                            min="1"
                            max="365"
                            placeholder="30"
                            value={formData.durationDays}
                            onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="form-info">
                    <div className="info-item">
                        <span>💰</span>
                        <p>
                            <strong>Zero Commission</strong> — 100% of donations go directly to your wallet
                        </p>
                    </div>
                    <div className="info-item">
                        <span>🔗</span>
                        <p>
                            <strong>On-Chain</strong> — Your campaign will be permanently recorded on Avalanche
                        </p>
                    </div>
                    <div className="info-item">
                        <span>⚡</span>
                        <p>
                            <strong>Fast</strong> — Claim funds instantly when you&apos;re ready
                        </p>
                    </div>
                </div>

                <button type="submit" className="btn-primary btn-full" disabled={isSubmitting}>
                    {!isConnected
                        ? "Connect Wallet to Create"
                        : isSubmitting
                            ? "Creating on Blockchain..."
                            : "Create Campaign"}
                </button>
            </form>
        </div>
    );
}
