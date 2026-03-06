"use client";

import Link from "next/link";
import { useWallet } from "./WalletProvider";
import { useScrollY } from "@/hooks/useScrollProgress";

export default function Navbar() {
    const { address, isConnecting, isConnected, connect, disconnect } = useWallet();
    const scrollY = useScrollY();
    const scrolled = scrollY > 80;

    const short = address
        ? `${address.slice(0, 6)}…${address.slice(-4)}`
        : "";

    return (
        <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
            <div className="navbar-inner">
                <Link href="/" className="navbar-logo">
                    <span className="logo-sha">Sha</span>
                    <span className="logo-vax">(vax)</span>
                    <span className="logo-re">re</span>
                </Link>

                <div className="navbar-links">
                    <Link href="/campaigns" className="nav-link">Campaigns</Link>
                    <Link href="/create" className="nav-link">Create</Link>
                </div>

                <div className="navbar-wallet">
                    {isConnected ? (
                        <div className="wallet-connected">
                            <span className="wallet-dot" />
                            <span className="wallet-address">{short}</span>
                            <button onClick={disconnect} className="btn-disconnect" aria-label="Disconnect">✕</button>
                        </div>
                    ) : (
                        <button onClick={connect} disabled={isConnecting} className="btn-connect">
                            {isConnecting ? <span className="spinner" /> : "Connect Wallet"}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
