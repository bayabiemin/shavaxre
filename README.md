<p align="center">
  <h1 align="center">Sha(vax)re</h1>
  <p align="center">
    <strong>Decentralized Education Crowdfunding on Avalanche C-Chain</strong>
  </p>
  <p align="center">
    Fund Education, On-Chain. — Zero middlemen. Zero commission. 100% transparent.
  </p>
</p>

<p align="center">
  <a href="#-live-demo">Live Demo</a> •
  <a href="#-problem">Problem</a> •
  <a href="#-solution">Solution</a> •
  <a href="#%EF%B8%8F-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-smart-contract">Smart Contract</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 🏔️ Built for Avalanche Build Games 2026

**Sha(vax)re** is a decentralized crowdfunding platform that enables students to raise funds for their education goals with full on-chain transparency. Every donation goes directly from the donor's wallet to the student's wallet — **peer-to-peer, zero commission, fully verifiable on the blockchain.**

> _"We're looking for builders, not bounty hunters."_
> — Build Games 2026

---

## 🔴 Problem

Traditional education funding systems are:

- **Opaque** — Donors can't track where their money goes
- **Slow** — Bureaucratic processes delay fund transfers
- **Expensive** — Intermediaries take 5-15% in platform fees and processing costs
- **Exclusionary** — Students in developing regions lack access to established scholarship networks

## ✅ Solution

Sha(vax)re eliminates all intermediaries by putting the entire funding lifecycle on-chain:

| Feature                | Traditional               | Sha(vax)re                       |
| ---------------------- | ------------------------- | -------------------------------- |
| **Transparency**       | Trust the platform        | Verify on Snowtrace              |
| **Commission**         | 5-15%                     | **0%**                           |
| **Transfer Speed**     | Days to weeks             | **< 2 seconds**                  |
| **Fund Flow**          | Platform → Bank → Student | **Donor → Student (P2P)**        |
| **Corporate Matching** | Manual, opaque            | **Automated via smart contract** |

---

## ⚡ Key Features

- 🔗 **On-Chain Campaigns** — Every campaign is a struct stored on Avalanche C-Chain
- 💸 **Zero-Fee Donations** — 100% of AVAX goes directly to the student
- 🏢 **Corporate Matching** — Companies can fund matching pools that auto-match donations
- 👛 **Wallet Connect** — MetaMask & Core Wallet support with auto Avalanche network switching
- 📊 **Live Progress** — Real-time funding progress tracked on-chain
- 🎓 **Student Autonomy** — Students claim funds on their own terms

---

## 🛠️ Tech Stack

| Layer              | Technology                                 |
| ------------------ | ------------------------------------------ |
| **Blockchain**     | Avalanche C-Chain (Fuji Testnet / Mainnet) |
| **Smart Contract** | Solidity 0.8.19                            |
| **Framework**      | Hardhat                                    |
| **Frontend**       | Next.js 16 + TypeScript                    |
| **Web3 Library**   | ethers.js v6                               |
| **Styling**        | Custom CSS (dark premium theme)            |
| **Wallet**         | MetaMask / Core Wallet                     |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/) or [Core Wallet](https://core.app/)
- AVAX on Fuji Testnet ([Faucet](https://faucet.avax.network/))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/shavaxre.git
cd shavaxre

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Deploy Smart Contract

```bash
# Compile the contract
npx hardhat compile

# Deploy to Avalanche Fuji Testnet
PRIVATE_KEY=your_private_key npx hardhat run scripts/deploy.js --network fuji
```

---

## 📜 Smart Contract

**Contract:** `Shavaxre.sol`  
**Network:** Avalanche C-Chain  
**Language:** Solidity 0.8.19

### Core Functions

| Function             | Description                             | Access                |
| -------------------- | --------------------------------------- | --------------------- |
| `createCampaign()`   | Student opens a new funding campaign    | Anyone                |
| `donate()`           | Send AVAX to an active campaign         | Anyone                |
| `claimFunds()`       | Student withdraws collected funds       | Campaign creator only |
| `fundMatchingPool()` | Corporate sponsor funds a matching pool | Anyone                |
| `matchDonation()`    | Trigger auto-match for a donation       | Anyone                |

### Architecture

```
Donor ──── donate() ────→ Smart Contract ──── claimFunds() ────→ Student
                              ↑
Corporate ── fundMatchingPool() ── matchDonation() ──┘
```

**Zero commission.** No admin fees, no platform cut. The contract simply holds AVAX until the student claims it.

---

## 📁 Project Structure

```
shavaxre/
├── contracts/
│   └── Shavaxre.sol              # Core smart contract
├── scripts/
│   └── deploy.js                 # Hardhat deployment script
├── hardhat.config.js             # Avalanche network configuration
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page (hero, stats, campaigns)
│   │   ├── campaigns/page.tsx    # Browse active campaigns
│   │   ├── create/page.tsx       # Create new campaign (student)
│   │   ├── campaign/[id]/page.tsx# Campaign detail + donate
│   │   ├── layout.tsx            # Root layout + SEO
│   │   ├── client-layout.tsx     # Wallet provider wrapper
│   │   └── globals.css           # Design system
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation + wallet connect
│   │   ├── CampaignCard.tsx      # Campaign card component
│   │   ├── Footer.tsx            # Footer
│   │   └── WalletProvider.tsx    # Wallet context (MetaMask/Core)
│   └── lib/
│       ├── contract.ts           # Contract interaction helpers
│       └── abi.json              # Contract ABI
└── package.json
```

---

## 🗺️ Roadmap

- [x] **Week 1** — Idea pitch & project architecture
- [ ] **Week 2-3** — MVP: Smart contract deployment + frontend integration on Fuji Testnet
- [ ] **Week 4-5** — GTM strategy, university blockchain club partnerships
- [ ] **Week 6** — Final presentation & live demo

### Post-Competition Vision

- 🌐 Dedicated Avalanche Subnet for education institutions
- 🪪 On-chain student identity (Soulbound Tokens)
- 🏛️ DAO governance for platform decisions
- 🤝 Corporate CSR dashboard with automated tax reporting

---

## 🤝 Why Avalanche?

1. **Low Gas Fees** — Micro-donations (even $1) reach students without being eaten by fees
2. **Speed** — Sub-2-second finality means instant donation confirmation
3. **Subnet Vision** — Future institutional compliance via dedicated education subnet
4. **Ecosystem** — Grants, Codebase, and long-term ecosystem support

---

## 📄 License

MIT

---

<p align="center">
  <strong>Sha(vax)re</strong> — Fund Education, On-Chain. 🏔️
  <br/>
  <em>Built with ❤️ for Avalanche Build Games 2026</em>
</p>
