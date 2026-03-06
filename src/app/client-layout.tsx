"use client";

import { WalletProvider } from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import DonationToast from "@/components/DonationToast";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <WalletProvider>
            <SmoothScroll>
                <div className="app-wrapper">
                    <ScrollProgress />
                    <Navbar />
                    <main className="main-content">{children}</main>
                    <Footer />
                    <DonationToast />
                </div>
            </SmoothScroll>
        </WalletProvider>
    );
}
