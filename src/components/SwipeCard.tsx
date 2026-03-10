"use client";

import { useState, useCallback, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import { ethers } from "ethers";
import { useDonate, useLikeCampaign, type CampaignData } from "../hooks/useShavaxre";
import { DONATE_PRESETS } from "../lib/contract";
import Confetti from "./Confetti";
import { useLang } from "@/contexts/LangContext";
import { CARD_H } from "./SwipeDeck";

export interface SwipeableCampaign extends CampaignData {
  title: string;
  description: string;
  imageUrl: string;
  socialLinks: { twitter?: string; instagram?: string; liveStream?: string };
}

interface SwipeCardProps {
  campaign: SwipeableCampaign;
  onSwipeRight: (id: number) => void;
  onSwipeLeft:  (id: number) => void;
  onDonateSuccess: (id: number) => void;
  walletConnected: boolean;
  alreadyLiked?: boolean;
}

const SWIPE_THRESHOLD    = 90;
const VELOCITY_THRESHOLD = 400;
const exitSpring = { type: "spring" as const, stiffness: 220, damping: 28 };

export default function SwipeCard({
  campaign, onSwipeRight, onSwipeLeft, onDonateSuccess, walletConnected, alreadyLiked = false,
}: SwipeCardProps) {
  const { donate, isPending: isDonating, isConfirming, error: donateError } = useDonate();
  const { like } = useLikeCampaign();
  const { t } = useLang();

  const [showDonatePanel, setShowDonatePanel] = useState(false);
  const [showConfetti, setShowConfetti]       = useState(false);
  const [exiting, setExiting]                 = useState<"left" | "right" | null>(null);
  const [customAmount, setCustomAmount]       = useState("");
  const [showBigConfirm, setShowBigConfirm]   = useState(false);
  const pendingBigAmount = useRef<bigint | null>(null);

  const x = useMotionValue(0);

  const rotateZ      = useTransform(x, [-300, 0, 300], [-14, 0, 14]);
  const rotateY      = useTransform(x, [-300, 0, 300], [6, 0, -6]);
  const likeOpacity  = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity  = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
  const likeScale    = useTransform(likeOpacity, [0, 1], [0.6, 1]);
  const nopeScale    = useTransform(nopeOpacity, [0, 1], [0.6, 1]);
  const dragScale    = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);
  const bgGlow       = useTransform(
    x,
    [-200, -40, 0, 40, 200],
    [
      "0 0 70px rgba(239,68,68,0.5), 0 16px 48px rgba(0,0,0,0.8)",
      "0 0 20px rgba(239,68,68,0.15), 0 16px 40px rgba(0,0,0,0.7)",
      "0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)",
      "0 0 20px rgba(16,185,129,0.15), 0 16px 40px rgba(0,0,0,0.7)",
      "0 0 70px rgba(16,185,129,0.5), 0 16px 48px rgba(0,0,0,0.8)",
    ]
  );

  const progress = campaign.goalAmount > 0n
    ? Number((campaign.totalRaised * 100n) / campaign.goalAmount) : 0;

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const { x: ox } = info.offset;
    const { x: vx } = info.velocity;
    if (ox > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) {
      setExiting("right");
      if (walletConnected && !alreadyLiked) like(campaign.id);
      setTimeout(() => onSwipeRight(campaign.id), 380);
    } else if (ox < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) {
      setExiting("left");
      setTimeout(() => onSwipeLeft(campaign.id), 380);
    }
  }, [campaign.id, walletConnected, alreadyLiked, like, onSwipeRight, onSwipeLeft]);

  const handleDonate = async (amount: bigint) => {
    const hash = await donate(campaign.id, amount);
    if (hash) {
      setShowConfetti(true);
      setCustomAmount("");
      setTimeout(() => {
        setShowConfetti(false);
        setShowDonatePanel(false);
        onDonateSuccess(campaign.id);
      }, 2200);
    }
  };

  const handleCustomSend = () => {
    const val = parseFloat(customAmount);
    if (!val || val <= 0) return;
    const amount = ethers.parseEther(customAmount);
    if (val > 5) { pendingBigAmount.current = amount; setShowBigConfirm(true); }
    else handleDonate(amount);
  };

  return (
    <>
      {showConfetti && <Confetti />}

      {/* Entry / exit animation wrapper — fills the SwipeDeck container */}
      <motion.div
        key={`outer-${campaign.id}`}
        initial={{ scale: 0.93, opacity: 0, y: 30 }}
        animate={exiting ? {
          x: exiting === "right" ? 860 : -860,
          rotateZ: exiting === "right" ? 22 : -22,
          opacity: 0, scale: 0.88,
        } : { scale: 1, opacity: 1, y: 0 }}
        transition={exiting ? exitSpring : { duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: CARD_H, zIndex: 10, perspective: 1000,
          pointerEvents: exiting ? "none" : "auto",
        }}
      >
        {/* Draggable card */}
        <motion.div
          drag={exiting ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.65}
          onDragEnd={handleDragEnd}
          style={{
            x, rotateZ, rotateY, scale: dragScale, boxShadow: bgGlow,
            width: "100%", height: "100%",
            touchAction: "pan-y",
            borderRadius: 22,
            overflow: "hidden",
            background: "#0d0d14",
            border: "1px solid rgba(255,255,255,0.08)",
            cursor: "grab",
            userSelect: "none",
            display: "flex",
            flexDirection: "column",
          }}
          whileTap={{ cursor: "grabbing" } as never}
        >
          {/* ── IMAGE SECTION — 72% of card ── */}
          <div style={{ position: "relative", height: "72%", flexShrink: 0, overflow: "hidden" }}>
            {campaign.imageUrl ? (
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div style={{
                width: "100%", height: "100%",
                background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 45%, #0f3460 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: "4rem", opacity: 0.35 }}>🎓</span>
              </div>
            )}

            {/* Gradient: top tint + heavy bottom fade into card bg */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 28%, transparent 40%, rgba(13,13,20,0.75) 70%, rgba(13,13,20,1) 100%)",
              pointerEvents: "none",
            }} />

            {/* LIKE stamp */}
            <motion.div
              style={{
                opacity: likeOpacity, scale: likeScale,
                position: "absolute", top: 18, left: 16,
                padding: "5px 14px",
                borderRadius: 8, border: "2.5px solid #34d399",
                color: "#34d399", fontSize: "1rem", fontWeight: 900,
                letterSpacing: "0.06em", rotate: "-12deg",
              }}
            >
              {t("card.like")}
            </motion.div>

            {/* NOPE stamp */}
            <motion.div
              style={{
                opacity: nopeOpacity, scale: nopeScale,
                position: "absolute", top: 18, right: 16,
                padding: "5px 14px",
                borderRadius: 8, border: "2.5px solid #f87171",
                color: "#f87171", fontSize: "1rem", fontWeight: 900,
                letterSpacing: "0.06em", rotate: "12deg",
              }}
            >
              {t("card.nope")}
            </motion.div>

            {/* Trending badge */}
            {Number(campaign.likes) > 5 && (
              <div style={{
                position: "absolute", top: 16, left: "50%",
                transform: "translateX(-50%)",
                padding: "4px 11px",
                background: "rgba(249,115,22,0.92)",
                borderRadius: 999, fontSize: "10px",
                fontWeight: 700, color: "#fff", letterSpacing: "0.04em",
                backdropFilter: "blur(4px)",
              }}>
                {t("card.trending")}
              </div>
            )}

            {/* Text overlay — title, description, progress bar */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 14px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
                <h3 style={{
                  color: "#fff", fontWeight: 700, fontSize: "1.05rem",
                  lineHeight: 1.25, margin: 0, flex: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  paddingRight: 8, textShadow: "0 1px 8px rgba(0,0,0,0.9)",
                }}>
                  {campaign.title}
                </h3>
                <span style={{
                  color: "rgba(255,255,255,0.75)", fontSize: "0.72rem",
                  fontWeight: 600, flexShrink: 0,
                  textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                }}>
                  {Math.min(progress, 100)}%
                </span>
              </div>

              {campaign.description && (
                <p style={{
                  color: "rgba(255,255,255,0.5)", fontSize: "0.72rem",
                  margin: "0 0 7px", overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap",
                  textShadow: "0 1px 4px rgba(0,0,0,0.6)",
                }}>
                  {campaign.description}
                </p>
              )}

              {/* Progress bar */}
              <div style={{ height: 3, background: "rgba(255,255,255,0.14)", borderRadius: 2, overflow: "hidden" }}>
                <motion.div
                  style={{ height: "100%", background: "linear-gradient(90deg, #E84142, #ff6b6b)", borderRadius: 2 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>

          {/* ── STATS + ACTIONS — 28% of card ── */}
          <div style={{
            flex: 1,
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
            padding: "10px 16px 14px",
          }}>
            {/* Stats row */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "nowrap", overflow: "hidden" }}>
              <span style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.7rem" }}>
                ♥ {campaign.likes.toString()}
              </span>
              <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.55rem" }}>·</span>
              <span style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.7rem" }}>
                {campaign.uniqueDonors.toString()} {t("card.donors")}
              </span>
              <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.55rem" }}>·</span>
              <span style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.7rem" }}>
                {ethers.formatEther(campaign.totalRaised)} AVAX
              </span>
              {campaign.socialLinks.liveStream && (
                <>
                  <span style={{ color: "rgba(255,255,255,0.15)", fontSize: "0.55rem" }}>·</span>
                  <motion.span
                    style={{ color: "#ef4444", fontSize: "0.7rem", fontWeight: 700 }}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ● LIVE
                  </motion.span>
                </>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
              {/* Skip */}
              <motion.button
                onClick={() => { setExiting("left"); setTimeout(() => onSwipeLeft(campaign.id), 380); }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.84 }}
                style={{
                  width: 46, height: 46, borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.11)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1rem", color: "rgba(255,255,255,0.55)",
                  cursor: "pointer",
                }}
              >
                ✕
              </motion.button>

              {/* AVAX / Donate */}
              <motion.button
                onClick={() => setShowDonatePanel(true)}
                disabled={!walletConnected}
                whileHover={{ scale: 1.1, boxShadow: "0 0 48px rgba(232,65,66,0.6)" } as never}
                whileTap={{ scale: 0.88 }}
                title={walletConnected ? "Donate AVAX" : t("card.walletFirst")}
                style={{
                  width: 60, height: 60, borderRadius: "50%",
                  background: "linear-gradient(135deg, #f97316 0%, #E84142 100%)",
                  boxShadow: "0 0 28px rgba(232,65,66,0.42)",
                  border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 800, color: "#fff",
                  letterSpacing: "0.04em",
                  cursor: walletConnected ? "pointer" : "not-allowed",
                  opacity: walletConnected ? 1 : 0.3,
                }}
              >
                AVAX
              </motion.button>

              {/* Like */}
              <motion.button
                onClick={() => {
                  setExiting("right");
                  if (walletConnected && !alreadyLiked) like(campaign.id);
                  setTimeout(() => onSwipeRight(campaign.id), 380);
                }}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.84 }}
                title={alreadyLiked ? t("card.alreadyLiked") : t("card.like")}
                style={{
                  width: 46, height: 46, borderRadius: "50%",
                  background: alreadyLiked ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)",
                  border: alreadyLiked ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.11)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.1rem",
                  color: alreadyLiked ? "#10b981" : "rgba(255,255,255,0.55)",
                  cursor: "pointer",
                }}
              >
                {alreadyLiked ? "✓" : "♥"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── DONATE PANEL ── */}
      <AnimatePresence>
        {showDonatePanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isDonating && !isConfirming && setShowDonatePanel(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 40,
                background: "rgba(0,0,0,0.72)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 380 }}
              style={{
                position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
                background: "#111118",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "22px 22px 0 0",
                padding: "0 1.25rem 2rem",
                maxHeight: "85vh", overflowY: "auto",
              }}
            >
              {/* Big amount confirm */}
              <AnimatePresence>
                {showBigConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{
                      position: "absolute", inset: 0, zIndex: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(17,17,24,0.97)",
                      backdropFilter: "blur(8px)", borderRadius: "22px 22px 0 0",
                      padding: "1.5rem",
                    }}
                  >
                    <div style={{ textAlign: "center", maxWidth: 280 }}>
                      <div style={{ fontSize: "2.25rem", marginBottom: "0.875rem" }}>⚠️</div>
                      <p style={{ color: "#fff", fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.35rem" }}>
                        {customAmount} AVAX
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                        {t("card.confirmBig")}
                      </p>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          onClick={() => { setShowBigConfirm(false); pendingBigAmount.current = null; }}
                          style={{ flex: 1, padding: "0.7rem", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", fontWeight: 500, cursor: "pointer" }}
                        >
                          {t("card.confirmCancel")}
                        </button>
                        <button
                          onClick={() => {
                            if (pendingBigAmount.current) handleDonate(pendingBigAmount.current);
                            setShowBigConfirm(false); pendingBigAmount.current = null;
                          }}
                          style={{ flex: 1, padding: "0.7rem", borderRadius: 12, background: "linear-gradient(135deg, #f97316, #E84142)", border: "none", color: "#fff", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          {t("card.confirmSend")}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Drag handle */}
              <div style={{ display: "flex", justifyContent: "center", padding: "0.75rem 0 0.5rem" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.14)" }} />
              </div>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <div>
                  <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1.05rem", margin: 0 }}>
                    {t("card.donate")}
                  </h3>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", margin: "0.15rem 0 0", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {campaign.title}
                  </p>
                </div>
                <button
                  onClick={() => setShowDonatePanel(false)}
                  disabled={isDonating || isConfirming}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0.625rem 0 0.875rem" }} />

              {/* Preset buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem", marginBottom: "0.8rem" }}>
                {DONATE_PRESETS.map((p, i) => (
                  <motion.button
                    key={p.label}
                    onClick={() => handleDonate(p.value)}
                    disabled={isDonating || isConfirming}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.96 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(232,65,66,0.12)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,65,66,0.35)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                    style={{
                      padding: "0.875rem 0.5rem",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      cursor: isDonating || isConfirming ? "not-allowed" : "pointer",
                      opacity: isDonating || isConfirming ? 0.4 : 1,
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "1rem" }}>{p.label}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.6rem", letterSpacing: "0.06em" }}>AVAX</span>
                  </motion.button>
                ))}
              </div>

              {/* Custom amount */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <input
                  type="number" step="0.01" min="0.01"
                  placeholder={t("card.customPlaceholder")}
                  value={customAmount}
                  onChange={e => setCustomAmount(e.target.value)}
                  disabled={isDonating || isConfirming}
                  onFocus={e => { e.target.style.borderColor = "rgba(232,65,66,0.45)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
                  style={{
                    flex: 1, padding: "0.7rem 0.875rem", borderRadius: 11,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff", fontSize: "0.875rem", outline: "none",
                    minWidth: 0, opacity: isDonating || isConfirming ? 0.4 : 1,
                    transition: "border-color 0.15s",
                  }}
                />
                <motion.button
                  onClick={handleCustomSend}
                  disabled={!customAmount || parseFloat(customAmount) <= 0 || isDonating || isConfirming}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: "0.7rem 1rem", borderRadius: 11,
                    background: "linear-gradient(135deg, #f97316, #E84142)",
                    border: "none", color: "#fff", fontWeight: 700, fontSize: "0.85rem",
                    cursor: !customAmount || parseFloat(customAmount) <= 0 || isDonating || isConfirming ? "not-allowed" : "pointer",
                    opacity: !customAmount || parseFloat(customAmount) <= 0 || isDonating || isConfirming ? 0.38 : 1,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t("card.customSend")}
                </motion.button>
              </div>

              {/* Status */}
              {isDonating && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 0.875rem", borderRadius: 10, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}
                >
                  <motion.div
                    style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(249,115,22,0.25)", borderTopColor: "#f97316", flexShrink: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                  />
                  <span style={{ color: "#f97316", fontSize: "0.82rem", fontWeight: 500 }}>{t("card.confirming")}</span>
                </motion.div>
              )}
              {isConfirming && (
                <motion.div
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.65rem 0.875rem", borderRadius: 10, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
                >
                  <span style={{ fontSize: "0.9rem" }}>⛓</span>
                  <span style={{ color: "#10b981", fontSize: "0.82rem", fontWeight: 500 }}>{t("card.onChain")}</span>
                </motion.div>
              )}
              {donateError && !isDonating && !isConfirming && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ padding: "0.65rem 0.875rem", borderRadius: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)" }}
                >
                  <p style={{ color: "#f87171", fontSize: "0.78rem", margin: 0, lineHeight: 1.5 }}>
                    {donateError.includes("insufficient funds")
                      ? "Yetersiz AVAX bakiyesi. Fuji faucet'ten test AVAX alabilirsiniz."
                      : donateError.includes("user rejected") || donateError.includes("denied")
                      ? "İşlem iptal edildi."
                      : `Hata: ${donateError.slice(0, 80)}${donateError.length > 80 ? "…" : ""}`}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
