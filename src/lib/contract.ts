import { BrowserProvider, Contract, formatEther, parseEther } from "ethers";
import ABI from "./abi.json";

// ═══════════════════════════════════════════════════════════════
//                     CONFIGURATION
// ═══════════════════════════════════════════════════════════════

// Replace with deployed contract address
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// Avalanche C-Chain networks
export const AVALANCHE_MAINNET = {
    chainId: "0xa86a",
    chainName: "Avalanche C-Chain",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://snowtrace.io/"],
};

export const AVALANCHE_FUJI = {
    chainId: "0xa869",
    chainName: "Avalanche Fuji Testnet",
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    blockExplorerUrls: ["https://testnet.snowtrace.io/"],
};

// ═══════════════════════════════════════════════════════════════
//                     WALLET HELPERS
// ═══════════════════════════════════════════════════════════════

export async function connectWallet(): Promise<{
    provider: BrowserProvider;
    signer: any;
    address: string;
}> {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error("Please install MetaMask or Core Wallet");
    }

    const provider = new BrowserProvider((window as any).ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    return { provider, signer, address };
}

export async function switchToAvalanche(testnet = true): Promise<void> {
    const network = testnet ? AVALANCHE_FUJI : AVALANCHE_MAINNET;
    try {
        await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: network.chainId }],
        });
    } catch (switchError: any) {
        if (switchError.code === 4902) {
            await (window as any).ethereum.request({
                method: "wallet_addEthereumChain",
                params: [network],
            });
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//                     CONTRACT HELPERS
// ═══════════════════════════════════════════════════════════════

export function getContract(signerOrProvider: any): Contract {
    return new Contract(CONTRACT_ADDRESS, ABI, signerOrProvider);
}

export interface Campaign {
    student: string;
    title: string;
    description: string;
    category: string;
    goalAmount: bigint;
    raisedAmount: bigint;
    deadline: bigint;
    active: boolean;
    claimed: boolean;
    donorCount: bigint;
}

export interface CampaignDisplay {
    id: number;
    student: string;
    title: string;
    description: string;
    category: string;
    goalAvax: string;
    raisedAvax: string;
    deadline: Date;
    active: boolean;
    claimed: boolean;
    donorCount: number;
    progress: number;
}

export function formatCampaign(raw: Campaign, id: number): CampaignDisplay {
    const goal = parseFloat(formatEther(raw.goalAmount));
    const raised = parseFloat(formatEther(raw.raisedAmount));
    return {
        id,
        student: raw.student,
        title: raw.title,
        description: raw.description,
        category: raw.category,
        goalAvax: goal.toFixed(2),
        raisedAvax: raised.toFixed(2),
        deadline: new Date(Number(raw.deadline) * 1000),
        active: raw.active,
        claimed: raw.claimed,
        donorCount: Number(raw.donorCount),
        progress: goal > 0 ? Math.min((raised / goal) * 100, 100) : 0,
    };
}

// ═══════════════════════════════════════════════════════════════
//                     CONTRACT ACTIONS
// ═══════════════════════════════════════════════════════════════

export async function createCampaign(
    signer: any,
    title: string,
    description: string,
    category: string,
    goalAvax: string,
    durationDays: number
): Promise<any> {
    const contract = getContract(signer);
    const goalWei = parseEther(goalAvax);
    const tx = await contract.createCampaign(title, description, category, goalWei, durationDays);
    return tx.wait();
}

export async function donateToCampaign(
    signer: any,
    campaignId: number,
    amountAvax: string
): Promise<any> {
    const contract = getContract(signer);
    const tx = await contract.donate(campaignId, { value: parseEther(amountAvax) });
    return tx.wait();
}

export async function claimCampaignFunds(signer: any, campaignId: number): Promise<any> {
    const contract = getContract(signer);
    const tx = await contract.claimFunds(campaignId);
    return tx.wait();
}

export async function getActiveCampaigns(provider: any): Promise<CampaignDisplay[]> {
    const contract = getContract(provider);
    const [campaigns, ids] = await contract.getActiveCampaigns();
    return campaigns.map((c: Campaign, i: number) => formatCampaign(c, Number(ids[i])));
}

export async function getCampaignById(provider: any, id: number): Promise<CampaignDisplay> {
    const contract = getContract(provider);
    const campaign = await contract.getCampaign(id);
    return formatCampaign(campaign, id);
}

export { formatEther, parseEther };
