"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SwipeCard, { type SwipeableCampaign } from "./SwipeCard";
import { fetchTrendingCampaigns } from "../hooks/useShavaxre";

interface SwipeDeckProps {
  walletConnected: boolean;
  walletAddress?: string;
}

async function resolveMetadata(uri: string) {
  const defaults = { title: "Kampanya", description: "", imageUrl: "", socialLinks: {} };
  if (!uri) return defaults;
  try {
    const url = uri.startsWith("ipfs://") ? uri.replace("ipfs://", "https://ipfs.io/ipfs/") : uri;
    const res = await fetch(url);
    const data = await res.json();

    // Gorsel URL coz: IPFS, local (test), veya normal URL
    let imageUrl = data.image || data.imageUrl || "";
    if (imageUrl.startsWith("local://")) {
      // Test modu: localStorage'dan cek
      const key = imageUrl.replace("local://", "");
      try { imageUrl = localStorage.getItem(key) || ""; } catch { imageUrl = ""; }
    } else if (imageUrl.startsWith("ipfs://")) {
      imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    return {
      title: data.title || data.name || "Kampanya",
      description: data.description || "",
      imageUrl,
      socialLinks: data.socialLinks || {},
    };
  } catch { return defaults; }
}

export default function SwipeDeck({ walletConnected, walletAddress }: SwipeDeckProps) {
  const [campaigns, setCampaigns] = useState<SwipeableCampaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCampaigns(); }, []);

  async function loadCampaigns() {
    setLoading(true);
    try {
      const raw = await fetchTrendingCampaigns();
      const enriched = await Promise.all(
        raw.map(async (c) => {
          const meta = await resolveMetadata(c.metadataURI);
          return { ...c, ...meta } as SwipeableCampaign;
        })
      );
      setCampaigns(enriched);
    } catch (e) { console.error("Load error:", e); }
    finally { setLoading(false); }
  }

  const next = () => setCurrentIndex((p) => p + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <motion.div animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
        <div className="text-7xl mb-6">*</div>
        <h2 className="text-2xl font-bold text-white mb-2">Henuz kampanya yok</h2>
        <p className="text-zinc-400 mb-6">Ilk atesi sen yak!</p>
        <a href="/create" className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl text-white font-bold hover:scale-105 transition-all">
          Kampanya Olustur
        </a>
      </div>
    );
  }

  if (currentIndex >= campaigns.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
        <div className="text-7xl mb-6">*</div>
        <h2 className="text-2xl font-bold text-white mb-2">Hepsini gordun!</h2>
        <p className="text-zinc-400 mb-6">Yeni kampanyalar geldiginde tekrar bak</p>
        <button onClick={() => { setCurrentIndex(0); loadCampaigns(); }}
          className="px-6 py-3 bg-orange-500 rounded-2xl text-white font-bold hover:bg-orange-600 active:scale-95 transition-all">
          Bastan Basla
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center h-[80vh]">
      {campaigns.slice(currentIndex + 1, currentIndex + 3).map((c, i) => (
        <div key={`bg-${c.id}`}
          className="absolute rounded-3xl bg-[#0a0a0f] border border-white/5"
          style={{ width: 360, height: 560, transform: `scale(${1 - (i + 1) * 0.05}) translateY(${(i + 1) * 14}px)`, zIndex: -(i + 1) }} />
      ))}
      <SwipeCard campaign={campaigns[currentIndex]} walletConnected={walletConnected}
        onSwipeRight={next} onSwipeLeft={next} onDonateSuccess={next} />
    </div>
  );
}
