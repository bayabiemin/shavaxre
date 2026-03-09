"use client";

import { useState, useCallback } from "react";
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

const SWIPE_THRESHOLD = 120;

export default function SwipeCard({
  campaign, onSwipeRight, onSwipeLeft, onDonateSuccess, walletConnected,
}: SwipeCardProps) {
  const { donate, isPending: isDonating, isConfirming } = useDonate();
  const { like } = useLikeCampaign();

  const [showDonatePanel, setShowDonatePanel] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const progress = campaign.goalAmount > 0n
    ? Number((campaign.totalRaised * 100n) / campaign.goalAmount) : 0;

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const { x: ox } = info.offset;
    const { x: vx } = info.velocity;
    if (ox > SWIPE_THRESHOLD || vx > 500) {
      setExiting("right");
      if (walletConnected) like(campaign.id);
      setTimeout(() => onSwipeRight(campaign.id), 300);
    } else if (ox < -SWIPE_THRESHOLD || vx < -500) {
      setExiting("left");
      setTimeout(() => onSwipeLeft(campaign.id), 300);
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
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{
              x: exiting === "right" ? 500 : -500,
              rotate: exiting === "right" ? 25 : -25,
              opacity: 0, transition: { duration: 0.35 },
            }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.9}
              onDragEnd={handleDragEnd}
              style={{ x, rotate, width: 380, height: 580, maxWidth: 380, maxHeight: 580 }}
              className="relative rounded-3xl overflow-hidden bg-[#0a0a0f] border border-white/10 shadow-2xl cursor-grab active:cursor-grabbing select-none"
            >
              <div className="relative h-[62%] overflow-hidden">
                <img src={campaign.imageUrl || "/placeholder.jpg"} alt={campaign.title}
                     className="w-full h-full object-cover" draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
                <motion.div style={{ opacity: likeOpacity }}
                  className="absolute top-6 left-6 px-4 py-2 rounded-xl border-4 border-emerald-400 text-emerald-400 text-2xl font-black -rotate-[15deg]">
                  LIKE
                </motion.div>
                <motion.div style={{ opacity: nopeOpacity }}
                  className="absolute top-6 right-6 px-4 py-2 rounded-xl border-4 border-red-400 text-red-400 text-2xl font-black rotate-[15deg]">
                  NOPE
                </motion.div>
                {Number(campaign.likes) > 5 && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-orange-500/90 rounded-full text-xs font-bold text-white backdrop-blur-sm">
                    TRENDING
                  </div>
                )}
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-xl font-bold text-white leading-tight">{campaign.title}</h3>
                <p className="text-sm text-zinc-400 line-clamp-2">{campaign.description}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>{ethers.formatEther(campaign.totalRaised)} AVAX</span>
                    <span>{Math.min(progress, 100)}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.8 }} />
                  </div>
                </div>
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
                    <a href={campaign.socialLinks.liveStream} target="_blank" rel="noopener noreferrer"
                       onClick={(e) => e.stopPropagation()}
                       className="px-3 py-1 bg-red-900/40 rounded-lg text-xs text-red-300 hover:bg-red-900/60 transition animate-pulse">
                      LIVE
                    </a>
                  )}
                </div>
                <div className="flex gap-4 text-xs text-zinc-500">
                  <span>{campaign.likes.toString()} likes</span>
                  <span>{campaign.uniqueDonors.toString()} donors</span>
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-5 z-20">
              <button onClick={() => { setExiting("left"); setTimeout(() => onSwipeLeft(campaign.id), 300); }}
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-red-500/20 hover:border-red-500/50 transition-all active:scale-90">
                X
              </button>
              <button onClick={() => setShowDonatePanel(true)} disabled={!walletConnected}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] hover:scale-110 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                title={walletConnected ? "Atesle!" : "Once cuzdan bagla"}>
                AVAX
              </button>
              <button onClick={() => { setExiting("right"); if (walletConnected) like(campaign.id); setTimeout(() => onSwipeRight(campaign.id), 300); }}
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all active:scale-90">
                +
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDonatePanel && (
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-[#0a0a0f] border-t border-white/10 rounded-t-3xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Atesle - Hizli Bagis</h3>
              <button onClick={() => setShowDonatePanel(false)} className="text-zinc-500 hover:text-white text-xl">X</button>
            </div>
            <p className="text-sm text-zinc-400">{campaign.title}</p>
            <div className="grid grid-cols-2 gap-3">
              {DONATE_PRESETS.map((p) => (
                <button key={p.label} onClick={() => handleDonate(p.value)}
                  disabled={isDonating || isConfirming}
                  className="py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-gradient-to-r hover:from-orange-500/20 hover:to-red-500/20 hover:border-orange-500/40 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-wait">
                  {p.label}
                </button>
              ))}
            </div>
            {isDonating && <p className="text-center text-orange-400 text-sm animate-pulse">Cuzdanda onayla...</p>}
            {isConfirming && <p className="text-center text-emerald-400 text-sm animate-pulse">Zincirde onaylaniyor...</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
