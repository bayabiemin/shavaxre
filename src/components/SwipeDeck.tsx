"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwipeCard, { type SwipeableCampaign } from "./SwipeCard";
import { fetchTrendingCampaigns, checkHasLiked } from "../hooks/useShavaxre";
import { useLang } from "@/contexts/LangContext";

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
  const { t } = useLang();
  const [campaigns, setCampaigns] = useState<SwipeableCampaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  const loadCampaigns = useCallback(async () => {
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
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  // Check which campaigns the wallet already liked (on-chain)
  useEffect(() => {
    if (!walletAddress || campaigns.length === 0) return;
    const check = async () => {
      const liked = new Set<number>();
      await Promise.all(
        campaigns.map(async (c) => {
          try {
            const has = await checkHasLiked(c.id, walletAddress);
            if (has) liked.add(c.id);
          } catch { /* contract may not have hasLiked yet */ }
        })
      );
      setLikedIds(liked);
    };
    check();
  }, [walletAddress, campaigns]);

  const next = useCallback(() => setCurrentIndex((p) => p + 1), []);

  const handleLikeAndNext = useCallback((campaignId: number) => {
    setLikedIds((prev) => new Set(prev).add(campaignId));
    setCurrentIndex((p) => p + 1);
  }, []);

  /* ── Determine which view to show ── */
  const showLoading = loading;
  const showEmpty = !loading && campaigns.length === 0;
  const showDone = !loading && campaigns.length > 0 && currentIndex >= campaigns.length;
  const showCards = !loading && campaigns.length > 0 && currentIndex < campaigns.length;

  // Debug — kaldırılabilir
  useEffect(() => {
    console.log("[SwipeDeck]", { loading, total: campaigns.length, currentIndex, showDone, showCards });
  }, [loading, campaigns.length, currentIndex, showDone, showCards]);

  return (
    <div style={{ minHeight: 620, position: "relative" }}>
      {/* ── Loading state ── */}
      {showLoading && (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 620,
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <motion.div
              style={{
                width: 64, height: 64, borderRadius: "50%",
                border: "3px solid var(--border)",
                borderTopColor: "var(--accent)",
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
            <motion.p
              style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontFamily: "var(--font-mono)" }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {t("deck.loading")}
            </motion.p>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {showEmpty && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", textAlign: "center", padding: "0 1.5rem", height: 620,
        }}>
          <div style={{ fontSize: "4.5rem", marginBottom: "1.5rem", color: "var(--accent)" }}>✦</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            {t("deck.empty")}
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            {t("deck.emptyDesc")}
          </p>
          <a href="/create" className="btn-primary">{t("deck.createCta")}</a>
        </div>
      )}

      {/* ── All swiped — done state ── */}
      {showDone && (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", textAlign: "center", padding: "0 1.5rem", height: 620,
        }}>
          <div style={{ fontSize: "4.5rem", marginBottom: "1.5rem", color: "var(--accent)" }}>✓</div>
          <h2 style={{
            fontSize: "1.5rem", fontWeight: 700,
            color: "var(--text-primary)", marginBottom: "0.5rem",
            fontFamily: "var(--font-display)",
          }}>
            {t("deck.done")}
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
            {t("deck.doneDesc")}
          </p>
          <button
            onClick={() => { setCurrentIndex(0); loadCampaigns(); }}
            className="btn-primary"
          >
            {t("deck.restart")}
          </button>
        </div>
      )}

      {/* ── Active cards ── */}
      {showCards && (
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 680 }}>
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
            key={`swipe-${campaigns[currentIndex].id}`}
            campaign={campaigns[currentIndex]}
            walletConnected={walletConnected}
            alreadyLiked={likedIds.has(campaigns[currentIndex].id)}
            onSwipeRight={handleLikeAndNext}
            onSwipeLeft={next}
            onDonateSuccess={next}
          />
        </div>
      )}
    </div>
  );
}
