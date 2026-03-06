"use client";

import { WalletProvider } from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <WalletProvider>
            <div className="app-wrapper">
                <ScrollProgressBar />
                <Navbar />
                <main className="main-content">{children}</main>
                <Footer />
            </div>
        </WalletProvider>
    );
}
