"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import {
  getReadContract,
  getWriteContract,
  ensureFujiNetwork,
  STAKE_AMOUNT,
  STATUS_MAP,
} from "../lib/contract";

export interface CampaignData {
  id: number;
  creator: string;
  metadataURI: string;
  goalAmount: bigint;
  totalRaised: bigint;
  stakeDeposit: bigint;
  likes: bigint;
  status: number;
  statusText: string;
  votingDeadline: bigint;
  proofURI: string;
  yesVotes: bigint;
  noVotes: bigint;
  uniqueDonors: bigint;
  createdAt: bigint;
}

interface TxState {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: string | null;
  hash: string | null;
}

const initialTx: TxState = {
  isPending: false, isConfirming: false, isSuccess: false, error: null, hash: null,
};

export function useCampaignCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    try {
      const contract = getReadContract();
      const c = await contract.campaignCount();
      setCount(Number(c));
    } catch (e) {
      console.error("campaignCount error:", e);
    } finally {
      setLoading(false);
    }
  }, []);
  return { count, loading, refetch: fetch };
}

export async function fetchCampaign(id: number): Promise<CampaignData> {
  const contract = getReadContract();
  const c = await contract.getCampaign(id);
  return {
    id, creator: c.creator, metadataURI: c.metadataURI,
    goalAmount: c.goalAmount, totalRaised: c.totalRaised,
    stakeDeposit: c.stakeDeposit, likes: c.likes,
    status: Number(c.status), statusText: STATUS_MAP[Number(c.status)] || "Unknown",
    votingDeadline: c.votingDeadline, proofURI: c.proofURI,
    yesVotes: c.yesVotes, noVotes: c.noVotes,
    uniqueDonors: c.uniqueDonors, createdAt: c.createdAt,
  };
}

export async function fetchAllCampaigns(): Promise<CampaignData[]> {
  const contract = getReadContract();
  const count = Number(await contract.campaignCount());
  return Promise.all(Array.from({ length: count }, (_, i) => fetchCampaign(i)));
}

export async function fetchTrendingCampaigns(): Promise<CampaignData[]> {
  const all = await fetchAllCampaigns();
  const contract = getReadContract();
  const scored = await Promise.all(
    all.filter((c) => c.status === 0).map(async (c) => {
      const score = Number(await contract.getTrendingScore(c.id));
      return { ...c, trendingScore: score };
    })
  );
  return scored.sort((a: any, b: any) => b.trendingScore - a.trendingScore);
}

export async function fetchVotingStatus(id: number) {
  const contract = getReadContract();
  const [yes, no, deadline, totalDonors, isOpen] = await contract.getVotingStatus(id);
  return { yes: Number(yes), no: Number(no), deadline: Number(deadline), totalDonors: Number(totalDonors), isOpen };
}

export async function fetchMyDonation(campaignId: number, address: string): Promise<bigint> {
  const contract = getReadContract();
  return contract.getDonation(campaignId, address);
}

async function executeTx(
  txFn: () => Promise<ethers.TransactionResponse>,
  setState: (s: TxState) => void
): Promise<string | null> {
  setState({ ...initialTx, isPending: true });
  try {
    await ensureFujiNetwork();
    const tx = await txFn();
    setState({ ...initialTx, isPending: false, isConfirming: true, hash: tx.hash });
    await tx.wait();
    setState({ ...initialTx, isSuccess: true, hash: tx.hash });
    return tx.hash;
  } catch (e: any) {
    setState({ ...initialTx, error: e?.reason || e?.message || "TX failed" });
    return null;
  }
}

export function useCreateCampaign() {
  const [state, setState] = useState<TxState>(initialTx);
  const create = useCallback(async (metadataURI: string, goalAmountEther: string) => {
    return executeTx(async () => {
      const contract = await getWriteContract();
      return contract.createCampaign(metadataURI, ethers.parseEther(goalAmountEther), { value: STAKE_AMOUNT });
    }, setState);
  }, []);
  return { create, ...state };
}

export function useDonate() {
  const [state, setState] = useState<TxState>(initialTx);
  const donate = useCallback(async (campaignId: number, amount: bigint) => {
    return executeTx(async () => {
      const contract = await getWriteContract();
      return contract.donate(campaignId, { value: amount });
    }, setState);
  }, []);
  return { donate, ...state };
}

export function useLikeCampaign() {
  const [state, setState] = useState<TxState>(initialTx);
  const like = useCallback(async (campaignId: number) => {
    return executeTx(async () => {
      const contract = await getWriteContract();
      return contract.likeCampaign(campaignId);
    }, setState);
  }, []);
  return { like, ...state };
}

export function useSubmitProof() {
  const [state, setState] = useState<TxState>(initialTx);
  const submitProof = useCallback(async (campaignId: number, proofURI: string) => {
    return executeTx(async () => {
      const contract = await getWriteContract();
      return contract.submitProof(campaignId, proofURI);
    }, setState);
  }, []);
  return { submitProof, ...state };
}

export function useVote() {
  const [state, setState] = useState<TxState>(initialTx);
  const vote = useCallback(async (campaignId: number, approve: boolean) => {
    return executeTx(async () => {
      const contract = await getWriteContract();
      return contract.vote(campaignId, approve);
    }, setState);
  }, []);
  return { vote, ...state };
}

export function useFinalizeVoting() {
  const [state, setState] = useState<TxState>(initialTx);
  const finalize = useCallback(async (campaignId: number) => {
    return executeTx(async () => {
      const contract = await getWriteContract();
      return contract.finalizeVoting(campaignId);
    }, setState);
  }, []);
  return { finalize, ...state };
}

export function useClaimRefund() {
  const [state, setState] = useState<TxState>(initialTx);
  const claimRefund = useCallback(async (campaignId: number) => {
    return executeTx(async () => {
      const contract = await getWriteContract();
      return contract.claimRefund(campaignId);
    }, setState);
  }, []);
  return { claimRefund, ...state };
}
