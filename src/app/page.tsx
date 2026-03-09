"use client";

import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import SwipeDeck from "../components/SwipeDeck";
import { ensureFujiNetwork } from "../lib/contract";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>();

  useEffect(() => {
    checkWallet();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", checkWallet);
    }
  }, []);

  async function checkWallet() {
    if (!window.ethereum) return;
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setWalletConnected(true);
        setWalletAddress(accounts[0].address);
        await ensureFujiNetwork();
      }
    } catch {}
  }

  return (
    <main className="min-h-screen bg-[#050507]">
      <SwipeDeck walletConnected={walletConnected} walletAddress={walletAddress} />
    </main>
  );
}
