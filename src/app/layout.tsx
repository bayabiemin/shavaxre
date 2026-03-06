import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  metadataBase: new URL("https://shavaxre.vercel.app"),
  title: "Sha(vax)re — Decentralized Education Crowdfunding",
  description: "Fund education directly on Avalanche. Zero commission, zero middlemen. Every AVAX creates a future.",
  keywords: ["Avalanche", "Education", "Crowdfunding", "Web3", "AVAX", "Blockchain", "DeFi"],
  openGraph: {
    title: "Sha(vax)re — Fund Education on Avalanche",
    description: "Decentralized education crowdfunding. Zero commission, direct P2P donations.",
    url: "https://shavaxre.vercel.app",
    siteName: "Sha(vax)re",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sha(vax)re — Fund Education on Avalanche",
    description: "Zero commission education crowdfunding on Avalanche C-Chain.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
