"use client";

import CampaignCard from "@/components/CampaignCard";
import Link from "next/link";

const demoCampaigns = [
    {
        id: 0,
        title: "Computer Science Degree — Final Year Tuition",
        description:
            "I'm a senior CS student and need help covering my last semester tuition. Every AVAX gets me closer to graduation and launching my Web3 career.",
        category: "Tuition",
        goalAvax: "50.00",
        raisedAvax: "32.50",
        donorCount: 14,
        progress: 65,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        student: "0x1a2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B",
    },
    {
        id: 1,
        title: "Medical Research Books & Lab Equipment",
        description:
            "Pursuing a master's in biomedical engineering. Need funds for specialized textbooks and lab materials not covered by my scholarship.",
        category: "Research",
        goalAvax: "25.00",
        raisedAvax: "18.75",
        donorCount: 9,
        progress: 75,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        student: "0x2B3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1C",
    },
    {
        id: 2,
        title: "Blockchain Development Bootcamp Scholarship",
        description:
            "Self-taught developer seeking funding for a professional blockchain bootcamp to transition into Web3 full-time. Will build on Avalanche.",
        category: "Technology",
        goalAvax: "15.00",
        raisedAvax: "3.20",
        donorCount: 4,
        progress: 21,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        student: "0x3c4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1C2D",
    },
    {
        id: 3,
        title: "Nursing Program — Clinical Rotation Equipment",
        description:
            "Final-year nursing student needing funds for clinical rotation equipment, scrubs, and certification exam fees.",
        category: "Tuition",
        goalAvax: "20.00",
        raisedAvax: "20.00",
        donorCount: 22,
        progress: 100,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        student: "0x4D5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1C2D3E",
    },
    {
        id: 4,
        title: "Architecture Student — Design Software Licenses",
        description:
            "I need licenses for AutoCAD, Revit, and 3D rendering software for my final thesis project in sustainable architecture.",
        category: "Technology",
        goalAvax: "10.00",
        raisedAvax: "6.80",
        donorCount: 7,
        progress: 68,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        student: "0x5e6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1C2D3E4F",
    },
    {
        id: 5,
        title: "Study Abroad — Environmental Science in Costa Rica",
        description:
            "Accepted into a tropical ecology research program in Costa Rica. Looking for help with travel and housing costs.",
        category: "Research",
        goalAvax: "35.00",
        raisedAvax: "12.00",
        donorCount: 6,
        progress: 34,
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        student: "0x6F7a8B9c0D1e2F3a4B5c6D7e8F9a0B1C2D3E4F5A",
    },
];

export default function CampaignsPage() {
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

            <div className="campaigns-grid">
                {demoCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} {...campaign} />
                ))}
            </div>
        </div>
    );
}
