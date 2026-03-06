"use client";

import { useEffect, useState } from "react";
import { JsonRpcProvider, formatEther } from "ethers";
import { getContract } from "@/lib/contract";

const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";
const MAX_TOASTS = 3;

interface Toast {
    id: number;
    donor: string;
    amount: string;
    campaignId: number;
    removing: boolean;
}

export default function DonationToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        const provider = new JsonRpcProvider(FUJI_RPC);
        const contract = getContract(provider);
        let counter = 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handler = (id: any, donor: any, amount: any) => {
            const newToast: Toast = {
                id: counter++,
                donor: donor as string,
                amount: parseFloat(formatEther(amount)).toFixed(4),
                campaignId: Number(id),
                removing: false,
            };

            setToasts(prev => {
                const updated = [...prev, newToast];
                return updated.slice(-MAX_TOASTS);
            });

            // Auto-dismiss after 5s
            setTimeout(() => {
                setToasts(prev =>
                    prev.map(t => t.id === newToast.id ? { ...t, removing: true } : t)
                );
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== newToast.id));
                }, 350);
            }, 5000);
        };

        contract.on("DonationReceived", handler);
        return () => { contract.off("DonationReceived", handler); };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="toast-stack" aria-live="polite">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`donation-toast ${toast.removing ? "toast-removing" : ""}`}
                >
                    <span className="toast-dot" />
                    <div className="toast-content">
                        <span className="toast-address">
                            {toast.donor.slice(0, 6)}…{toast.donor.slice(-4)}
                        </span>
                        <span className="toast-text">
                            donated <strong>{toast.amount} AVAX</strong> to campaign #{toast.campaignId}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
