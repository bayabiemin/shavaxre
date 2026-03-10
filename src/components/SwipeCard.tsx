"use client";

import { useState, useCallback, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
  type PanInfo,
} from "framer-motion";
import { ethers } from "ethers";
import { useDonate, useLikeCampaign, type CampaignData } from "../hooks/useShavaxre";
import { DONATE_PRESETS } from "../lib/contract";
import Confetti from "./Confetti";
import { useLang } from "@/contexts/LangContext";

export interface SwipeableCampaign extends CampaignData {
  title: string;
  description: string;
  imageUrl: string;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    liveStream?: string;
  };
}

interface SwipeCardProps {
  campaign: SwipeableCampaign;
  onSwipeRight: (id: number) => void;
  onSwipeLeft: (id: number) => void;
  onDonateSuccess: (id: number) => void;
  walletConnected: boolean;
  alreadyLiked?: boolean;
}

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 400;

const springConfig = { stiffness: 300, damping: 30, mass: 0.8 };
const exitSpring = { type: "spring" as const, stiffness: 200, damping: 30 };

export default function SwipeCard({
  campaign, onSwipeRight, onSwipeLeft, onDonateSuccess, walletConnected, alreadyLiked = false,
}: SwipeCardProps) {
  const { donate, isPending: isDonating, isConfirming } = useDonate();
  const { like } = useLikeCampaign();
  const { t } = useLang();

  const [showDonatePanel, setShowDonatePanel] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);
  const exitDirection = useRef<"left" | "right" | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showBigConfirm, setShowBigConfirm] = useState(false);
  const pendingBigAmount = useRef<bigint | null>(null);

  // Motion values with spring for buttery-smooth feel
  const x = useMotionValue(0);
  const springX = useSpring(x, springConfig);

  // 3D tilt based on drag position
  const rotateZ = useTransform(x, [-300, 0, 300], [-12, 0, 12]);
  const rotateY = useTransform(x, [-300, 0, 300], [8, 0, -8]);

  // Overlay opacities
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  // Background glow based on swipe direction
  const bgGlow = useTransform(
    x,
    [-200, -50, 0, 50, 200],
    [
      "0 0 80px rgba(239,68,68,0.5), 0 20px 60px rgba(0,0,0,0.8)",
      "0 0 20px rgba(239,68,68,0.15), 0 20px 60px rgba(0,0,0,0.7)",
      "0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
      "0 0 20px rgba(16,185,129,0.15), 0 20px 60px rgba(0,0,0,0.7)",
      "0 0 80px rgba(16,185,129,0.5), 0 20px 60px rgba(0,0,0,0.8)",
    ]
  );

  // Scale subtly on drag
  const dragScale = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);

  // Stamp scales — MUST be top-level (not inside conditional JSX)
  const likeStampScale = useTransform(likeOpacity, [0, 1], [0.5, 1]);
  const nopeStampScale = useTransform(nopeOpacity, [0, 1], [0.5, 1]);

  const progress = campaign.goalAmount > 0n
    ? Number((campaign.totalRaised * 100n) / campaign.goalAmount) : 0;

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const { x: ox } = info.offset;
    const { x: vx } = info.velocity;
    if (ox > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) {
      exitDirection.current = "right";
      setExiting("right");
      if (walletConnected && !alreadyLiked) like(campaign.id);
      setTimeout(() => onSwipeRight(campaign.id), 400);
    } else if (ox < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) {
      exitDirection.current = "left";
      setExiting("left");
      setTimeout(() => onSwipeLeft(campaign.id), 400);
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
    if (val > 5) {
      pendingBigAmount.current = amount;
      setShowBigConfirm(true);
    } else {
      handleDonate(amount);
    }
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <motion.div
        key={`card-${campaign.id}`}
        initial={{ scale: 0.9, opacity: 0, y: 30, rotateX: 10 }}
        animate={exiting ? {
          x: exiting === "right" ? 600 : -600,
          rotateZ: exiting === "right" ? 20 : -20,
          opacity: 0,
          scale: 0.8,
        } : {
          scale: 1, opacity: 1, y: 0, rotateX: 0,
        }}
        transition={exiting ? exitSpring : { duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 flex items-center justify-center z-10"
        style={{ perspective: 1000, pointerEvents: exiting ? "none" : "auto" }}
      >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              style={{
                x,
                rotateZ,
                rotateY,
                scale: dragScale,
                boxShadow: bgGlow,
                width: 380,
                height: 620,
                maxWidth: "92vw",
              }}
              whileTap={{ cursor: "grabbing" }}
              className="relative rounded-3xl overflow-hidden bg-[#111118] border border-white/20 cursor-grab active:cursor-grabbing select-none"
            >
              {/* Image section */}
              <div className="relative overflow-hidden" style={{ height: "54%" }}>
                {campaign.imageUrl ? (
                  <motion.img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                    draggable={false}
                    layoutId={`campaign-img-${campaign.id}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
                    <span style={{ fontSize: "4rem", opacity: 0.6 }}>🎓</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-transparent to-transparent" />

                {/* LIKE stamp */}
                <motion.div
                  style={{ opacity: likeOpacity }}
                  className="absolute top-6 left-6 px-5 py-2 rounded-xl border-[3px] border-emerald-400 text-emerald-400 text-2xl font-black -rotate-[12deg]"
                >
                  <motion.span
                    style={{ scale: likeStampScale }}
                  >
                    {t("card.like")}
                  </motion.span>
                </motion.div>

                {/* NOPE stamp */}
                <motion.div
                  style={{ opacity: nopeOpacity }}
                  className="absolute top-6 right-6 px-5 py-2 rounded-xl border-[3px] border-red-400 text-red-400 text-2xl font-black rotate-[12deg]"
                >
                  <motion.span
                    style={{ scale: nopeStampScale }}
                  >
                    {t("card.nope")}
                  </motion.span>
                </motion.div>

                {/* Trending badge */}
                {Number(campaign.likes) > 5 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500/90 rounded-full text-xs font-bold text-white backdrop-blur-sm"
                  >
                    {t("card.trending")}
                  </motion.div>
                )}
              </div>

              {/* Content section — inside the card */}
              <div className="p-4 flex flex-col" style={{ height: "46%" }}>
                <h3 className="text-lg font-bold text-white leading-tight mb-1 line-clamp-1">{campaign.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{campaign.description}</p>

                {/* Progress bar */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{ethers.formatEther(campaign.totalRaised)} AVAX</span>
                    <span>{Math.min(progress, 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, #E84142, #ff6b6b)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-3 text-xs text-zinc-500 mb-1">
                  <span>{campaign.likes.toString()} {t("card.likes")}</span>
                  <span>{campaign.uniqueDonors.toString()} {t("card.donors")}</span>
                  {campaign.socialLinks.liveStream && (
                    <motion.span
                      className="text-red-400 font-semibold"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >● LIVE</motion.span>
                  )}
                </div>

                {/* Action buttons — INSIDE the card */}
                <div className="flex items-center justify-center gap-4 mt-auto pt-2">
                  <motion.button
                    onClick={() => { exitDirection.current = "left"; setExiting("left"); setTimeout(() => onSwipeLeft(campaign.id), 400); }}
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-xl hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.85 }}
                  >
                    ✕
                  </motion.button>

                  <motion.button
                    onClick={() => setShowDonatePanel(true)}
                    disabled={!walletConnected}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ boxShadow: "0 0 28px rgba(232,65,66,0.45)" }}
                    whileHover={{ scale: 1.12, boxShadow: "0 0 50px rgba(232,65,66,0.65)" } as never}
                    whileTap={{ scale: 0.9 }}
                    title={walletConnected ? "AVAX" : t("card.walletFirst")}
                  >
                    AVAX
                  </motion.button>

                  <motion.button
                    onClick={() => {
                      exitDirection.current = "right";
                      setExiting("right");
                      if (walletConnected && !alreadyLiked) like(campaign.id);
                      setTimeout(() => onSwipeRight(campaign.id), 400);
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                      alreadyLiked
                        ? "bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400"
                        : "bg-white/5 border border-white/15 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.85 }}
                    title={alreadyLiked ? t("card.alreadyLiked") : t("card.like")}
                  >
                    {alreadyLiked ? "✓" : "♥"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

      {/* Donate Panel */}
      <AnimatePresence>
        {showDonatePanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDonatePanel(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 space-y-4 overflow-hidden"
            >
              {/* Big donation confirm overlay */}
              <AnimatePresence>
                {showBigConfirm && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a0a0f]/95 backdrop-blur-sm rounded-t-3xl p-6"
                  >
                    <div className="text-center space-y-4 max-w-xs">
                      <div className="text-4xl">⚠️</div>
                      <div>
                        <p className="text-white font-bold text-xl">{customAmount} AVAX</p>
                        <p className="text-zinc-400 text-sm mt-1">{t("card.confirmBig")}</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setShowBigConfirm(false); pendingBigAmount.current = null; }}
                          className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium"
                        >
                          {t("card.confirmCancel")}
                        </button>
                        <button
                          onClick={() => {
                            if (pendingBigAmount.current) handleDonate(pendingBigAmount.current);
                            setShowBigConfirm(false);
                            pendingBigAmount.current = null;
                          }}
                          className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold"
                        >
                          {t("card.confirmSend")}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-2" />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{t("card.donate")}</h3>
                <button onClick={() => setShowDonatePanel(false)} className="text-zinc-500 hover:text-white text-xl transition">✕</button>
              </div>
              <p className="text-sm text-zinc-400">{campaign.title}</p>
              <div className="grid grid-cols-2 gap-3">
                {DONATE_PRESETS.map((p, i) => (
                  <motion.button
                    key={p.label}
                    onClick={() => handleDonate(p.value)}
                    disabled={isDonating || isConfirming}
                    className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-500/40 transition-all disabled:opacity-40 disabled:cursor-wait"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {p.label}
                  </motion.button>
                ))}
              </div>

              {/* Manual amount input */}
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder={t("card.customPlaceholder")}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  disabled={isDonating || isConfirming}
                  className="flex-1 py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-white/30 disabled:opacity-40 min-w-0"
                />
                <motion.button
                  onClick={handleCustomSend}
                  disabled={!customAmount || parseFloat(customAmount) <= 0 || isDonating || isConfirming}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  whileTap={{ scale: 0.97 }}
                >
                  {t("card.customSend")}
                </motion.button>
              </div>

              {isDonating && (
                <motion.p
                  className="text-center text-orange-400 text-sm"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {t("card.confirming")}
                </motion.p>
              )}
              {isConfirming && (
                <motion.p
                  className="text-center text-emerald-400 text-sm"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {t("card.onChain")}
                </motion.p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
