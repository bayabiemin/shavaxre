"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwipeCard, { type SwipeableCampaign } from "./SwipeCard";
import { fetchTrendingCampaigns, checkHasLiked } from "../hooks/useShavaxre";
import { useLang } from "@/contexts/LangContext";

export const CARD_H = 560; // shared card height constant
const DECK_H = CARD_H + 28;

interface SwipeDeckProps {
  walletConnected: boolean;
  walletAddress?: string;
}

/* ── localStorage helpers for persisting swiped campaign IDs ── */
const SWIPED_KEY = "shavaxre_swiped";

function getSwipedIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SWIPED_KEY);
    return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
  } catch { return new Set(); }
}

function markSwiped(id: number) {
  if (typeof window === "undefined") return;
  try {
    const ids = getSwipedIds();
    ids.add(id);
    localStorage.setItem(SWIPED_KEY, JSON.stringify([...ids]));
  } catch {}
}

function clearSwiped() {
  if (typeof window === "undefined") return;
  try { localStorage.removeItem(SWIPED_KEY); } catch {}
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
      // Filter out already-swiped campaigns so they don't come back
      const unseen = enriched.filter(c => !getSwipedIds().has(c.id));
      setCampaigns(unseen);
    } catch (e) { console.error("Load error:", e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  useEffect(() => {
    if (!walletAddress || campaigns.length === 0) return;
    const check = async () => {
      const liked = new Set<number>();
      await Promise.all(
        campaigns.map(async (c) => {
          try {
            const has = await checkHasLiked(c.id, walletAddress);
            if (has) liked.add(c.id);
          } catch {}
        })
      );
      setLikedIds(liked);
    };
    check();
  }, [walletAddress, campaigns]);

  // Mark swiped in localStorage so it won't appear again after page refresh
  const next = useCallback((campaignId: number) => {
    markSwiped(campaignId);
    setCurrentIndex(p => p + 1);
  }, []);

  const handleLikeAndNext = useCallback((campaignId: number) => {
    markSwiped(campaignId);
    setLikedIds(prev => new Set(prev).add(campaignId));
    setCurrentIndex(p => p + 1);
  }, []);

  const showLoading = loading;
  const showEmpty   = !loading && campaigns.length === 0;
  const showDone    = !loading && campaigns.length > 0 && currentIndex >= campaigns.length;
  const showCards   = !loading && campaigns.length > 0 && currentIndex < campaigns.length;

  const stateStyle: React.CSSProperties = {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    textAlign: "center", padding: "0 1.5rem",
    height: DECK_H,
  };

  return (
    <div>
      {/* Loading */}
      {showLoading && (
        <div style={stateStyle}>
          <motion.div
            style={{ width: 52, height: 52, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", marginBottom: "1rem" }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <motion.p
            style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {t("deck.loading")}
          </motion.p>
        </div>
      )}

      {/* Empty */}
      {showEmpty && (
        <div style={stateStyle}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem", color: "var(--accent)" }}>✦</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
            {t("deck.empty")}
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            {t("deck.emptyDesc")}
          </p>
          <a href="/create" className="btn-primary">{t("deck.createCta")}</a>
        </div>
      )}

      {/* Done — all swiped */}
      {showDone && (
        <div style={stateStyle}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: "1.25rem" }}
          >
            ✓
          </motion.div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem", fontFamily: "var(--font-display)" }}>
            {t("deck.done")}
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6, fontSize: "0.9rem", maxWidth: 260 }}>
            {t("deck.doneDesc")}
          </p>
          <button
            onClick={() => { clearSwiped(); setCurrentIndex(0); loadCampaigns(); }}
            className="btn-primary"
          >
            {t("deck.restart")}
          </button>
        </div>
      )}

      {/* Active swipe deck */}
      {showCards && (
        <div style={{
          position: "relative",
          width: "min(380px, 92vw)",
          height: DECK_H,
          margin: "0 auto",
          overflow: "visible",
        }}>
          {/* Stacked background cards */}
          <AnimatePresence>
            {campaigns.slice(currentIndex + 1, currentIndex + 3).map((c, i) => (
              <motion.div
                key={`bg-${c.id}`}
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  zIndex: -(i + 1),
                  borderRadius: 24,
                  background: "#111118",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                initial={{ scale: 1 - (i + 1) * 0.05, y: (i + 1) * 14, opacity: 0 }}
                animate={{ scale: 1 - (i + 1) * 0.05, y: (i + 1) * 14, opacity: 0.5 - i * 0.2 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
