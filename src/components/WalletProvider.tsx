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

// localStorage keys
const CONNECTED_KEY = "shavaxre_wallet_connected"; // stored address (lowercase)
const PROVIDER_KEY  = "shavaxre_wallet_provider";  // "metamask" | "core" | "generic"

/**
 * When MetaMask + Core are both installed, Core often hijacks window.ethereum.
 * EIP-5749 / Core's multi-wallet support exposes window.ethereum.providers[]
 * which contains each wallet as a separate object.
 * We use this to find the correct provider by address on reconnect.
 */
function getAllProviders(): any[] {
    if (typeof window === "undefined") return [];
    const eth = (window as any).ethereum;
    if (!eth) return [];
    if (eth.providers && Array.isArray(eth.providers)) return [...eth.providers];
    return [eth];
}

function getProviderType(p: any): string {
    if (!p) return "generic";
    // Core sets isAvalanche / isCoreWallet; MetaMask-only sets only isMetaMask
    if (p.isAvalanche || p.isCoreWallet || p.isCore) return "core";
    if (p.isMetaMask) return "metamask";
    return "generic";
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
            const addr = await s.getAddress();
            setAddress(addr);
            setSigner(s);
            setProvider(bp);
            // Save address + which wallet type was active at connection time
            localStorage.setItem(CONNECTED_KEY, addr.toLowerCase());
            localStorage.setItem(PROVIDER_KEY, getProviderType(window.ethereum));
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
        localStorage.removeItem(CONNECTED_KEY);
        localStorage.removeItem(PROVIDER_KEY);
        setAddress(null);
        setSigner(null);
        setProvider(null);
    }, []);

    // Auto-reconnect on page load
    useEffect(() => {
        if (typeof window === "undefined" || !(window as any).ethereum) return;

        const savedAddr = localStorage.getItem(CONNECTED_KEY);
        const savedType = localStorage.getItem(PROVIDER_KEY) ?? "generic";
        if (!savedAddr) return; // User explicitly disconnected — respect that

        const reconnect = async () => {
            try {
                const allProviders = getAllProviders();

                // Try the saved wallet type first, then others as fallback
                const ordered = [
                    ...allProviders.filter(p => getProviderType(p) === savedType),
                    ...allProviders.filter(p => getProviderType(p) !== savedType),
                ];

                for (const p of ordered) {
                    try {
                        const accounts: string[] = await p.request({ method: "eth_accounts" });
                        if (
                            accounts.length > 0 &&
                            accounts[0].toLowerCase() === savedAddr
                        ) {
                            // Found the correct provider — reconnect with it
                            const bp = new BrowserProvider(p);
                            const s = await bp.getSigner();
                            setAddress(accounts[0]);
                            setSigner(s);
                            setProvider(bp);
                            return;
                        }
                    } catch { /* provider errored, try next */ }
                }

                // No provider has the saved address (wallet locked / removed)
                // Don't auto-connect with a wrong wallet — stay disconnected
            } catch (err) {
                console.warn("Auto-reconnect failed:", err);
            }
        };

        reconnect();
    }, []);

    // Listen for account changes from the wallet extension
    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).ethereum) {
            const eth = (window as any).ethereum;
            const handleAccountsChanged = async (accounts: string[]) => {
                if (accounts.length === 0) {
                    disconnect();
                } else {
                    try {
                        const bp = new BrowserProvider(eth);
                        const s = await bp.getSigner();
                        const addr = await s.getAddress();
                        setAddress(addr);
                        setSigner(s);
                        setProvider(bp);
                        localStorage.setItem(CONNECTED_KEY, addr.toLowerCase());
                        localStorage.setItem(PROVIDER_KEY, getProviderType(eth));
                    } catch {
                        setAddress(accounts[0]);
                    }
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
