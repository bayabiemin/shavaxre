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

## 🔴 Live Demo

| Resource | Link |
|----------|------|
| **Live App** | [shavaxre.vercel.app](https://shavaxre.vercel.app) |
| **Smart Contract** | [`0xc305D0d42...`](https://testnet.snowtrace.io/address/0xc305D0d42A11FF99E297575ba48985041513139c) |
| **Network** | Avalanche Fuji Testnet (Chain ID: 43113) |
| **Get Test AVAX** | [faucet.avax.network](https://faucet.avax.network/) |

> To interact with the dApp, connect MetaMask or Core Wallet to **Avalanche Fuji Testnet** and get test AVAX from the faucet.

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

| Feature                | Traditional               | Sha(vax)re                          |
| ---------------------- | ------------------------- | ----------------------------------- |
| **Transparency**       | Trust the platform        | Verify on Snowtrace                 |
| **Commission**         | 5-15%                     | **0%**                              |
| **Transfer Speed**     | Days to weeks             | **< 2 seconds**                     |
| **Fund Flow**          | Platform → Bank → Student | **Donor → Student (P2P)**           |
| **Accountability**     | Self-reported             | **On-chain proof + donor voting**   |
| **Fraud Protection**   | Manual review             | **Stake/slash + community flagging**|

---

## ⚡ Key Features

- 🔗 **On-Chain Campaigns** — Every campaign is a struct stored on Avalanche C-Chain
- 💸 **Zero-Fee Donations** — 100% of AVAX goes directly to the student
- 🛡️ **Two-Phase Release** — 65% auto-released at goal, 35% requires donor voting after proof submission
- 🗳️ **Donor Governance** — Donors vote on proof-of-use to unlock remaining funds (48h window, 30% quorum)
- 🔒 **Stake & Slash** — Creators stake 0.1 AVAX per campaign; slashed if flagged as fraudulent
- 👛 **Multi-Wallet Connect** — MetaMask & Core Wallet with EIP-5749 multi-provider support; remembers your wallet across sessions
- 📊 **Live Progress** — Real-time funding progress tracked on-chain
- 🚫 **Anti-Spam** — Max 3 active campaigns per creator, blacklist system, on-chain reporting
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

**Contract:** [`Shavaxre.sol`](contracts/Shavaxre.sol)
**Network:** Avalanche Fuji Testnet (Chain ID: 43113)
**Language:** Solidity 0.8.19
**Deployed:** [`0xc305D0d42A11FF99E297575ba48985041513139c`](https://testnet.snowtrace.io/address/0xc305D0d42A11FF99E297575ba48985041513139c)
**Live Demo:** [shavaxre.vercel.app](https://shavaxre.vercel.app)

### Core Functions

| Function             | Description                                              | Access          |
| -------------------- | -------------------------------------------------------- | --------------- |
| `createCampaign()`   | Student opens a campaign (requires 0.1 AVAX stake)       | Anyone          |
| `donate()`           | Send AVAX directly to an active campaign                 | Anyone          |
| `likeCampaign()`     | Like/endorse a campaign on-chain (1 per wallet)          | Anyone          |
| `reportCampaign()`   | Report a suspicious campaign with a reason               | Anyone          |
| `submitProof()`      | Student submits proof-of-use after Phase 1 release       | Creator only    |
| `vote()`             | Donors vote to approve/reject proof for Phase 2 release  | Donors only     |
| `finalizeVoting()`   | Finalize voting and release Phase 2 or slash funds       | Anyone          |
| `claimRefund()`      | Donors reclaim funds from flagged campaigns              | Donors only     |
| `flagCampaign()`     | Admin flags fraudulent campaign, slashes stake            | Owner only      |
| `blacklistAddress()` | Ban an address from creating campaigns                   | Owner only      |

### Two-Phase Release Mechanism

Sha(vax)re uses a **trust-but-verify** model to protect donors:

1. **Phase 1 (65%)** — Auto-released when funding goal is reached
2. **Proof Submission** — Student uploads proof of how funds were used
3. **Donor Voting** — Donors vote on whether proof is legitimate (48h window, 30% quorum)
4. **Phase 2 (35%)** — Released only if donors approve. Otherwise, remaining funds + stake go to treasury

### Security

- **CEI Pattern** — All state mutations happen before external calls
- **Reentrancy Protection** — Custom `nonReentrant` modifier on all fund-transfer functions
- **Access Control** — `onlyOwner` for admin, `onlyCreator` for campaign management
- **Stake Requirement** — 0.1 AVAX stake per campaign, slashed if flagged
- **Anti-Spam** — Max 3 active campaigns per creator, blacklist system
- **Duplicate Prevention** — One like per wallet per campaign via `hasLiked` mapping
- **Input Validation** — `msg.value` and `goalAmount` checks on every payable function

### Architecture

```
                    ┌─── Phase 1 (65%) ──→ Student
Donor → donate() → Contract
                    └─── Phase 2 (35%) ──→ submitProof() → vote() → finalizeVoting()
                                                                        ├─ Approved → Student + stake refund
                                                                        └─ Rejected → Treasury (funds + stake)
```

**Zero commission.** No admin fees, no platform cut. Funds flow directly peer-to-peer.

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
  - [x] Two-phase release smart contract with stake/slash
  - [x] Donor voting governance (proof submission, 48h window)
  - [x] Swipe-to-fund discovery deck with localStorage persistence
  - [x] Custom donation amounts with high-value confirmation
  - [x] Multi-wallet support (MetaMask + Core, EIP-5749)
  - [x] Dark/light theme + TR/EN bilingual
  - [x] Mobile-first responsive layout with wallet deep links
  - [x] Anti-spam: blacklist, max campaigns per creator, on-chain reporting
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
