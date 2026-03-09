"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

    let imageUrl = data.image || data.imageUrl || "";
    if (imageUrl.startsWith("local://")) {
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
      <div className="flex items-center justify-center" style={{ height: 620 }}>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className="w-16 h-16 rounded-full border-[3px] border-white/10"
            style={{ borderTopColor: "var(--accent)" }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <motion.p
            className="text-zinc-500 text-sm font-mono"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading campaigns...
          </motion.p>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6" style={{ height: 620 }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-7xl mb-6"
        >
          ✦
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Henuz kampanya yok
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-zinc-400 mb-6"
        >
          Ilk atesi sen yak!
        </motion.p>
        <motion.a
          href="/create"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Kampanya Olustur →
        </motion.a>
      </div>
    );
  }

  if (currentIndex >= campaigns.length) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6" style={{ height: 620 }}>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-7xl mb-6"
        >
          ✓
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2"
        >
          Hepsini gordun!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-zinc-400 mb-6"
        >
          Yeni kampanyalar geldiginde tekrar bak
        </motion.p>
        <motion.button
          onClick={() => { setCurrentIndex(0); loadCampaigns(); }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Bastan Basla
        </motion.button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center" style={{ height: 680 }}>
      {/* Background stacked cards */}
      <AnimatePresence>
        {campaigns.slice(currentIndex + 1, currentIndex + 3).map((c, i) => (
          <motion.div
            key={`bg-${c.id}`}
            className="absolute rounded-3xl bg-[#0a0a0f] border border-white/5"
            initial={{ scale: 1 - (i + 1) * 0.05, y: (i + 1) * 14, opacity: 0 }}
            animate={{
              scale: 1 - (i + 1) * 0.05,
              y: (i + 1) * 14,
              opacity: 0.6 - i * 0.2,
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: 360, height: 560, zIndex: -(i + 1) }}
          />
        ))}
      </AnimatePresence>

      <SwipeCard
        campaign={campaigns[currentIndex]}
        walletConnected={walletConnected}
        onSwipeRight={next}
        onSwipeLeft={next}
        onDonateSuccess={next}
      />
    </div>
  );
}
