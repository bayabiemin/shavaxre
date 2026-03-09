"use client";

import { useState, useCallback } from "react";
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
}

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 400;

const springConfig = { stiffness: 300, damping: 30, mass: 0.8 };
const exitSpring = { type: "spring" as const, stiffness: 200, damping: 30 };

export default function SwipeCard({
  campaign, onSwipeRight, onSwipeLeft, onDonateSuccess, walletConnected,
}: SwipeCardProps) {
  const { donate, isPending: isDonating, isConfirming } = useDonate();
  const { like } = useLikeCampaign();
  const { t } = useLang();

  const [showDonatePanel, setShowDonatePanel] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);

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
      "0 0 80px rgba(239,68,68,0.3)",
      "0 0 0px rgba(0,0,0,0)",
      "0 4px 30px rgba(0,0,0,0.5)",
      "0 0 0px rgba(0,0,0,0)",
      "0 0 80px rgba(16,185,129,0.3)",
    ]
  );

  // Scale subtly on drag
  const dragScale = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);

  const progress = campaign.goalAmount > 0n
    ? Number((campaign.totalRaised * 100n) / campaign.goalAmount) : 0;

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const { x: ox } = info.offset;
    const { x: vx } = info.velocity;
    if (ox > SWIPE_THRESHOLD || vx > VELOCITY_THRESHOLD) {
      setExiting("right");
      if (walletConnected) like(campaign.id);
      setTimeout(() => onSwipeRight(campaign.id), 350);
    } else if (ox < -SWIPE_THRESHOLD || vx < -VELOCITY_THRESHOLD) {
      setExiting("left");
      setTimeout(() => onSwipeLeft(campaign.id), 350);
    }
  }, [campaign.id, walletConnected, like, onSwipeRight, onSwipeLeft]);

  const handleDonate = async (amount: bigint) => {
    const hash = await donate(campaign.id, amount);
    if (hash) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setShowDonatePanel(false);
        onDonateSuccess(campaign.id);
      }, 2200);
    }
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <AnimatePresence mode="wait">
        {!exiting && (
          <motion.div
            key={`card-${campaign.id}`}
            initial={{ scale: 0.9, opacity: 0, y: 30, rotateX: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{
              x: exiting === "right" ? 600 : -600,
              rotateZ: exiting === "right" ? 20 : -20,
              opacity: 0,
              scale: 0.8,
              transition: exitSpring,
            }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center z-10"
            style={{ perspective: 1000 }}
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
                height: 580,
                maxWidth: "90vw",
              }}
              whileTap={{ cursor: "grabbing" }}
              className="relative rounded-3xl overflow-hidden bg-[#0a0a0f] border border-white/10 cursor-grab active:cursor-grabbing select-none"
            >
              {/* Image section */}
              <div className="relative overflow-hidden" style={{ height: "60%" }}>
                <motion.img
                  src={campaign.imageUrl || "/placeholder.jpg"}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                  layoutId={`campaign-img-${campaign.id}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />

                {/* LIKE stamp */}
                <motion.div
                  style={{ opacity: likeOpacity }}
                  className="absolute top-6 left-6 px-5 py-2 rounded-xl border-[3px] border-emerald-400 text-emerald-400 text-2xl font-black -rotate-[12deg]"
                >
                  <motion.span
                    style={{ scale: useTransform(likeOpacity, [0, 1], [0.5, 1]) }}
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
                    style={{ scale: useTransform(nopeOpacity, [0, 1], [0.5, 1]) }}
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

              {/* Content section */}
              <div className="p-5 space-y-3">
                <h3 className="text-xl font-bold text-white leading-tight">{campaign.title}</h3>
                <p className="text-sm text-zinc-400 line-clamp-2">{campaign.description}</p>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{ethers.formatEther(campaign.totalRaised)} AVAX</span>
                    <span>{Math.min(progress, 100)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: "linear-gradient(90deg, #E84142, #ff6b6b, #E84142)",
                        backgroundSize: "200% 100%",
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundPosition: ["0% 0%", "100% 0%"],
                      }}
                      transition={{
                        width: { duration: 1, ease: [0.16, 1, 0.3, 1] },
                        backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
                      }}
                    />
                  </div>
                </div>

                {/* Social links */}
                <div className="flex gap-2">
                  {campaign.socialLinks.twitter && (
                    <a href={campaign.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                       onClick={(e) => e.stopPropagation()}
                       className="px-3 py-1 bg-white/5 rounded-lg text-xs text-zinc-300 hover:bg-white/10 transition">
                      Twitter
                    </a>
                  )}
                  {campaign.socialLinks.instagram && (
                    <a href={campaign.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                       onClick={(e) => e.stopPropagation()}
                       className="px-3 py-1 bg-white/5 rounded-lg text-xs text-zinc-300 hover:bg-white/10 transition">
                      Insta
                    </a>
                  )}
                  {campaign.socialLinks.liveStream && (
                    <motion.a
                      href={campaign.socialLinks.liveStream} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1 bg-red-900/40 rounded-lg text-xs text-red-300 hover:bg-red-900/60 transition"
                      animate={{ opacity: [1, 0.6, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      LIVE
                    </motion.a>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-xs text-zinc-500">
                  <span>{campaign.likes.toString()} {t("card.likes")}</span>
                  <span>{campaign.uniqueDonors.toString()} {t("card.donors")}</span>
                </div>
              </div>
            </motion.div>

            {/* Action buttons */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-5 z-20">
              <motion.button
                onClick={() => { setExiting("left"); setTimeout(() => onSwipeLeft(campaign.id), 300); }}
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
              >
                ✕
              </motion.button>

              <motion.button
                onClick={() => setShowDonatePanel(true)}
                disabled={!walletConnected}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-bold text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{
                  scale: 1.15,
                  boxShadow: "0 0 60px rgba(239,68,68,0.6)",
                }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(239,68,68,0.3)",
                    "0 0 50px rgba(239,68,68,0.5)",
                    "0 0 30px rgba(239,68,68,0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                title={walletConnected ? "AVAX" : t("card.walletFirst")}
              >
                AVAX
              </motion.button>

              <motion.button
                onClick={() => { setExiting("right"); if (walletConnected) like(campaign.id); setTimeout(() => onSwipeRight(campaign.id), 300); }}
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.85 }}
              >
                ♥
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="fixed inset-x-0 bottom-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10 rounded-t-3xl p-6 space-y-4"
            >
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
