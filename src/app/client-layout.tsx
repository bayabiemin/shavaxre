"use client";

import { WalletProvider } from "@/components/WalletProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LangProvider } from "@/contexts/LangContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import DonationToast from "@/components/DonationToast";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <LangProvider>
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
            </LangProvider>
        </ThemeProvider>
    );
}
