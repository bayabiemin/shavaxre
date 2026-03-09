import { ethers, BrowserProvider, Contract, Eip1193Provider } from "ethers";

interface EthereumProvider extends Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
}

declare global { interface Window { ethereum?: EthereumProvider } }
import AbiJson from "./abi.json";
const ABI = AbiJson.abi;

export const CONTRACT_ADDRESS = "0x6E1EB557c63F46880Fc3e7A4C073b9eb4360e2A0";

export const FUJI_CHAIN_ID = 43113;
export const FUJI_RPC = "https://api.avax-test.network/ext/bc/C/rpc";

export const DONATE_PRESETS = [
  { label: "0.05 AVAX", value: ethers.parseEther("0.05") },
  { label: "0.1 AVAX",  value: ethers.parseEther("0.1") },
  { label: "0.5 AVAX",  value: ethers.parseEther("0.5") },
  { label: "1 AVAX",    value: ethers.parseEther("1") },
];

export const STAKE_AMOUNT = ethers.parseEther("0.1");

export const STATUS_MAP: Record<number, string> = {
  0: "Active", 1: "Phase1Released", 2: "VotingOpen",
  3: "Completed", 4: "Failed", 5: "Flagged",
};

export function getReadProvider() {
  return new ethers.JsonRpcProvider(FUJI_RPC);
}

export function getReadContract() {
  return new Contract(CONTRACT_ADDRESS, ABI, getReadProvider());
}

export async function getWriteContract() {
  if (!window.ethereum) throw new Error("Cuzdan bulunamadi");
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(CONTRACT_ADDRESS, ABI, signer);
}

export async function ensureFujiNetwork() {
  if (!window.ethereum) return;
  const chainId = await window.ethereum.request({ method: "eth_chainId" }) as string;
  if (parseInt(chainId, 16) !== FUJI_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xA869" }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code?: number };
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0xA869",
            chainName: "Avalanche Fuji Testnet",
            nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
            rpcUrls: [FUJI_RPC],
            blockExplorerUrls: ["https://testnet.snowtrace.io"],
          }],
        });
      }
    }
  }
}
