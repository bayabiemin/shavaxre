import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: "Sha(vax)re — Decentralized Education Funding on Avalanche",
  description:
    "Fund education dreams with full on-chain transparency. No middlemen, no commission — 100% of donations go directly to students via Avalanche C-Chain.",
  keywords: ["Avalanche", "Education", "Crowdfunding", "Web3", "AVAX", "Blockchain"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
