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
- 👛 **Multi-Wallet Connect** — MetaMask & Core Wallet with EIP-5749 multi-provider support; remembers your wallet across sessions without mixing providers
- 📊 **Live Progress** — Real-time funding progress tracked on-chain
- 🎓 **Student Autonomy** — Students claim funds on their own terms
- 🃏 **Tinder-Style Swipe Deck** — Discover and fund campaigns by swiping; previously swiped cards never re-appear (localStorage persistence)
- 🌗 **Dark / Light Theme** — Full design system with Avalanche red accent palette
- 🌐 **TR / EN Language** — Full bilingual support (Turkish & English)
- 📱 **Mobile-First** — Swipe deck is full-viewport on mobile; wallet deep-links to MetaMask/Core apps

---

## 🛠️ Tech Stack

| Layer              | Technology                                 |
| ------------------ | ------------------------------------------ |
| **Blockchain**     | Avalanche C-Chain (Fuji Testnet / Mainnet) |
| **Smart Contract** | Solidity 0.8.19                            |
| **Framework**      | Hardhat                                    |
| **Frontend**       | Next.js 16 + TypeScript + React 19         |
| **Web3 Library**   | ethers.js v6                               |
| **Animations**     | Framer Motion                              |
| **Styling**        | Custom CSS design system (dark premium)    |
| **Wallet**         | MetaMask / Core Wallet (EIP-5749)          |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/) or [Core Wallet](https://core.app/)
- AVAX on Fuji Testnet ([Faucet](https://faucet.avax.network/))

### Installation

```bash
# Clone the repository
git clone https://github.com/bayabiemin/shavaxre.git
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

# Verify on Snowtrace
npx hardhat verify --network fuji <DEPLOYED_ADDRESS>
```

---

## 📜 Smart Contract

**Contract:** `Shavaxre.sol`
**Network:** Avalanche Fuji Testnet (Chain ID: 43113)
**Language:** Solidity 0.8.19
**Deployed:** `0x6E1EB557c63F46880Fc3e7A4C073b9eb4360e2A0`

### Core Functions

| Function             | Description                             | Access                |
| -------------------- | --------------------------------------- | --------------------- |
| `createCampaign()`   | Student opens a new funding campaign    | Anyone                |
| `donate()`           | Send AVAX to an active campaign         | Anyone                |
| `likeCampaign()`     | Like/endorse a campaign (on-chain)      | Anyone                |
| `claimFunds()`       | Student withdraws collected funds       | Campaign creator only |
| `fundMatchingPool()` | Corporate sponsor funds a matching pool | Anyone                |
| `matchDonation()`    | Trigger auto-match for a donation       | Anyone                |

### Security

- **CEI Pattern** — All state mutations happen before external calls
- **Reentrancy Protection** — `nonReentrant` modifier on all fund-transfer functions
- **Access Control** — `onlyCreator` guard on `claimFunds` and campaign management
- **Input Validation** — `msg.value` checks on every payable function

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
│   │   ├── page.tsx              # Landing page (hero, stats, swipe deck)
│   │   ├── campaigns/page.tsx    # Browse active campaigns
│   │   ├── create/page.tsx       # Create new campaign (student)
│   │   ├── campaign/[id]/page.tsx# Campaign detail + donate
│   │   ├── dashboard/page.tsx    # Donor dashboard
│   │   ├── layout.tsx            # Root layout + SEO
│   │   └── globals.css           # Full design system (tokens, components, mobile)
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation + wallet connect + theme/lang toggles
│   │   ├── SwipeDeck.tsx         # Tinder-style swipe deck (localStorage persistence)
│   │   ├── SwipeCard.tsx         # Individual swipeable card (donate inline)
│   │   ├── CampaignCard.tsx      # Grid campaign card
│   │   ├── WalletProvider.tsx    # Multi-wallet context (EIP-5749, auto-reconnect)
│   │   └── Footer.tsx            # Footer
│   ├── contexts/
│   │   ├── ThemeContext.tsx       # Dark/light theme
│   │   └── LangContext.tsx        # TR/EN language
│   └── lib/
│       ├── contract.ts           # Contract interaction helpers
│       └── abi.json              # Contract ABI
└── package.json
```

---

## 🗺️ Roadmap

- [x] **Week 1** — Idea pitch & project architecture
- [x] **Week 2-3** — MVP: Smart contract + full frontend on Fuji Testnet
  - [x] Swipe-to-fund discovery deck
  - [x] Inline donation panel with error handling
  - [x] Multi-wallet support (MetaMask + Core, EIP-5749)
  - [x] Dark/light theme + TR/EN bilingual
  - [x] Mobile-first responsive layout
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

## 👥 Contributors

- **bayabiemin** (Emin) — Project owner
- **Bekirerdem** (Bekir) — Full-Stack + Web3 developer

---

## 📄 License

MIT

---

<p align="center">
  <strong>Sha(vax)re</strong> — Fund Education, On-Chain. 🏔️
  <br/>
  <em>Built with ❤️ for Avalanche Build Games 2026</em>
</p>
