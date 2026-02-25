"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { connectWallet, switchToAvalanche } from "@/lib/contract";

interface WalletState {
    address: string | null;
    signer: any | null;
    provider: any | null;
    isConnecting: boolean;
    isConnected: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
}

const WalletContext = createContext<WalletState>({
    address: null,
    signer: null,
    provider: null,
    isConnecting: false,
    isConnected: false,
    connect: async () => { },
    disconnect: () => { },
});

export function useWallet() {
    return useContext(WalletContext);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [signer, setSigner] = useState<any>(null);
    const [provider, setProvider] = useState<any>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const connect = useCallback(async () => {
        try {
            setIsConnecting(true);
            await switchToAvalanche(true);
            const wallet = await connectWallet();
            setAddress(wallet.address);
            setSigner(wallet.signer);
            setProvider(wallet.provider);
        } catch (err) {
            console.error("Wallet connection failed:", err);
            alert(err instanceof Error ? err.message : "Connection failed");
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        setAddress(null);
        setSigner(null);
        setProvider(null);
    }, []);

    // Listen for account changes
    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).ethereum) {
            const eth = (window as any).ethereum;
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnect();
                } else {
                    setAddress(accounts[0]);
                }
            };
            eth.on("accountsChanged", handleAccountsChanged);
            return () => eth.removeListener("accountsChanged", handleAccountsChanged);
        }
    }, [disconnect]);

    return (
        <WalletContext.Provider
            value={{
                address,
                signer,
                provider,
                isConnecting,
                isConnected: !!address,
                connect,
                disconnect,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}
