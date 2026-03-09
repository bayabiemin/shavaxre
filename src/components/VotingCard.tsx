"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { ethers } from "ethers";
import { useVote, fetchVotingStatus } from "../hooks/useShavaxre";

interface VotingCardProps {
  campaignId: number;
  title: string;
  proofURI: string;
  totalRaised: bigint;
  onVoteComplete: () => void;
}

export default function VotingCard({
  campaignId, title, proofURI, totalRaised, onVoteComplete,
}: VotingCardProps) {
  const { vote, isPending } = useVote();
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [votingData, setVotingData] = useState({ yes: 0, no: 0, deadline: 0, totalDonors: 0, isOpen: false });

  useEffect(() => {
    fetchVotingStatus(campaignId).then(setVotingData).catch(console.error);
  }, [campaignId]);

  const { yes, no, deadline, totalDonors, isOpen } = votingData;
  const totalVotes = yes + no;
  const timeLeft = Math.max(0, deadline - Math.floor(Date.now() / 1000));
  const hoursLeft = Math.floor(timeLeft / 3600);
  const minsLeft = Math.floor((timeLeft % 3600) / 60);

  const handleVote = async (approve: boolean) => {
    setExitDir(approve ? "right" : "left");
    await vote(campaignId, approve);
    setTimeout(onVoteComplete, 800);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) handleVote(true);
    else if (info.offset.x < -100) handleVote(false);
  };

  return (
    <AnimatePresence>
      {!exitDir && (
        <motion.div key={`vote-${campaignId}`}
          drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.8}
          onDragEnd={handleDragEnd}
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ x: exitDir === "right" ? 400 : -400, opacity: 0 }}
          className="w-[380px] rounded-3xl overflow-hidden bg-[#0a0a0f] border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.12)] cursor-grab active:cursor-grabbing"
        >
          <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
            <span className="text-amber-400 text-sm font-bold">ONAY KARTI - Faz 2</span>
            <span className="text-zinc-400 text-xs">{hoursLeft}s {minsLeft}dk</span>
          </div>
          <div className="relative h-[280px]">
            {proofURI.match(/\.(mp4|webm|mov)/i) ? (
              <video src={proofURI} controls className="w-full h-full object-cover" />
            ) : (
              <img src={proofURI} alt="Kanit" className="w-full h-full object-cover" draggable={false} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent" />
          </div>
          <div className="p-5 space-y-4">
            <div>
              <h3 className="text-white font-bold text-lg">{title}</h3>
              <p className="text-zinc-400 text-sm mt-1">
                Toplanan: {ethers.formatEther(totalRaised)} AVAX - Kalan %35 serbest birak?
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>Evet {yes}</span><span>Hayir {no}</span><span>{totalVotes}/{totalDonors}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                {totalVotes > 0 && (
                  <>
                    <div className="h-full bg-emerald-500" style={{ width: `${(yes / totalVotes) * 100}%` }} />
                    <div className="h-full bg-red-500" style={{ width: `${(no / totalVotes) * 100}%` }} />
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleVote(false)} disabled={isPending || !isOpen}
                className="flex-1 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold hover:bg-red-500/20 active:scale-95 transition-all disabled:opacity-30">
                Reddet
              </button>
              <button onClick={() => handleVote(true)} disabled={isPending || !isOpen}
                className="flex-1 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/20 active:scale-95 transition-all disabled:opacity-30">
                Onayla
              </button>
            </div>
            {isPending && <p className="text-center text-amber-400 text-xs animate-pulse">Oy zincire yaziliyor...</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
