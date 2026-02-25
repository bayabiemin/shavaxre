"use client";

import Link from "next/link";
import { useWallet } from "./WalletProvider";

export default function Navbar() {
    const { address, isConnecting, isConnected, connect, disconnect } = useWallet();

    const shortAddress = address
        ? `${address.slice(0, 6)}...${address.slice(-4)}`
        : "";

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link href="/" className="navbar-logo">
                    <span className="logo-sha">Sha</span>
                    <span className="logo-vax">(vax)</span>
                    <span className="logo-re">re</span>
                </Link>

                <div className="navbar-links">
                    <Link href="/campaigns" className="nav-link">
                        Campaigns
                    </Link>
                    <Link href="/create" className="nav-link">
                        Create
                    </Link>
                </div>

                <div className="navbar-wallet">
                    {isConnected ? (
                        <div className="wallet-connected">
                            <span className="wallet-dot" />
                            <span className="wallet-address">{shortAddress}</span>
                            <button onClick={disconnect} className="btn-disconnect">
                                ✕
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={connect}
                            disabled={isConnecting}
                            className="btn-connect"
                        >
                            {isConnecting ? (
                                <span className="spinner" />
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M13.5 3L8 1L2.5 3L8 5L13.5 3Z" fill="currentColor" opacity="0.6" />
                                        <path d="M2.5 3V11L8 13V5L2.5 3Z" fill="currentColor" opacity="0.8" />
                                        <path d="M8 5V13L13.5 11V3L8 5Z" fill="currentColor" />
                                    </svg>
                                    Connect Wallet
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
