"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { BrowserProvider } from "ethers";
import { ensureFujiNetwork } from "@/lib/contract";

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

function isMobileDevice() {
    if (typeof navigator === "undefined") return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function MobileWalletModal({ onClose }: { onClose: () => void }) {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const host = typeof window !== "undefined" ? window.location.host + window.location.pathname : "";

    const mmLink = `https://metamask.app.link/dapp/${host}`;
    const coreLink = `https://core.app/browser?dappUrl=${encodeURIComponent(currentUrl)}`;

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
        }} onClick={onClose}>
            <div
                style={{
                    background: "#0D0D0D", borderTop: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "24px 24px 0 0", padding: "1.5rem 1.5rem 2.5rem",
                    width: "100%", maxWidth: 480,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", margin: "0 auto 1.25rem" }} />
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, color: "#fff", marginBottom: "0.4rem" }}>
                    Cüzdan Bağla
                </h3>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                    Mobil tarayıcıda doğrudan bağlanamıyorsun. Cüzdan uygulamasının tarayıcısından aç:
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <a
                        href={mmLink}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.875rem",
                            padding: "1rem 1.1rem", background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14,
                            textDecoration: "none", color: "#fff",
                        }}
                    >
                        <span style={{ fontSize: "1.4rem" }}>🦊</span>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>MetaMask'ta Aç</div>
                            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>metamask.app.link</div>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: "1rem", opacity: 0.4 }}>→</span>
                    </a>

                    <a
                        href={coreLink}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.875rem",
                            padding: "1rem 1.1rem", background: "rgba(232,65,66,0.06)",
                            border: "1px solid rgba(232,65,66,0.25)", borderRadius: 14,
                            textDecoration: "none", color: "#fff",
                        }}
                    >
                        <span style={{ fontSize: "1.4rem" }}>⚡</span>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Core Wallet'ta Aç</div>
                            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>core.app</div>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: "1rem", opacity: 0.4 }}>→</span>
                    </a>
                </div>

                <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: "1.25rem", textAlign: "center", lineHeight: 1.5 }}>
                    Cüzdan uygulamasını aç → uygulamanın içindeki tarayıcıya geç → bu siteyi tekrar ziyaret et
                </p>
            </div>
        </div>
    );
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [signer, setSigner] = useState<any>(null);
    const [provider, setProvider] = useState<any>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showMobileModal, setShowMobileModal] = useState(false);

    const connect = useCallback(async () => {
        try {
            setIsConnecting(true);
            if (!window.ethereum) {
                if (isMobileDevice()) {
                    setShowMobileModal(true);
                    return;
                }
                throw new Error("Please install MetaMask or Core Wallet");
            }
            await ensureFujiNetwork();
            const bp = new BrowserProvider(window.ethereum);
            await bp.send("eth_requestAccounts", []);
            const s = await bp.getSigner();
            setAddress(await s.getAddress());
            setSigner(s);
            setProvider(bp);
        } catch (err) {
            console.error("Wallet connection failed:", err);
            if (err instanceof Error && !err.message.includes("user rejected")) {
                alert(err instanceof Error ? err.message : "Connection failed");
            }
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnect = useCallback(() => {
        setAddress(null);
        setSigner(null);
        setProvider(null);
    }, []);

    // Auto-reconnect on page load
    useEffect(() => {
        if (typeof window === "undefined" || !(window as any).ethereum) return;

        const reconnect = async () => {
            try {
                const accounts: string[] = await (window as any).ethereum.request({
                    method: "eth_accounts",
                });
                if (accounts.length > 0) {
                    const bp = new BrowserProvider((window as any).ethereum);
                    const s = await bp.getSigner();
                    setAddress(accounts[0]);
                    setSigner(s);
                    setProvider(bp);
                }
            } catch (err) {
                console.warn("Auto-reconnect failed:", err);
            }
        };

        reconnect();
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
            {showMobileModal && <MobileWalletModal onClose={() => setShowMobileModal(false)} />}
        </WalletContext.Provider>
    );
}
