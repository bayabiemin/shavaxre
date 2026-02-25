"use client";

import { WalletProvider } from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <WalletProvider>
            <div className="app-wrapper">
                <Navbar />
                <main className="main-content">{children}</main>
                <Footer />
            </div>
        </WalletProvider>
    );
}
