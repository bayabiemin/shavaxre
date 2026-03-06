# Sha(vax)re — Project Context for AI Assistants

## Proje Nedir?
Sha(vax)re, Avalanche C-Chain üzerinde çalışan merkeziyetsiz bir eğitim crowdfunding platformudur.
Öğrenciler kampanya açar, bağışçılar doğrudan AVAX gönderir — sıfır komisyon, sıfır aracı.
**Avalanche Build Games 2026** hackathon'u için geliştirilmektedir.

## Tech Stack
| Katman | Teknoloji |
|--------|-----------|
| Blockchain | Avalanche C-Chain (Fuji Testnet / Mainnet) |
| Smart Contract | Solidity 0.8.19, Hardhat |
| Frontend | Next.js 16, TypeScript, React 19 |
| Web3 | ethers.js v6 |
| Styling | Custom CSS (dark theme, Avalanche red #E84142) |
| 3D | Three.js (Globe3D component) |
| Wallet | MetaMask / Core Wallet |

## Deployed Contract
- **Address:** `0xfaDa353b9300Fc82B72a25B7E59867f4D0376cbd`
- **Network:** Avalanche Fuji Testnet (Chain ID: 43113)
- **Explorer:** https://testnet.snowtrace.io/address/0xfaDa353b9300Fc82B72a25B7E59867f4D0376cbd

## Proje Yapısı ve Rol Yönlendirmesi

### `/contracts/` — Smart Contract Layer
- `Shavaxre.sol` → Ana akıllı sözleşme
- **Rol:** Solidity güvenlik denetçisi gibi davran. Reentrancy, CEI pattern, access control konularına dikkat et.
- **Kurallar:** OpenZeppelin import'ları tercih et. Gas optimizasyonu önemli. Tüm external call'lar CEI pattern izlemeli.

### `/src/app/` — Frontend Pages (Next.js App Router)
- `page.tsx` → Landing page (hero + stats + campaigns)
- `campaigns/page.tsx` → Kampanya listesi
- `create/page.tsx` → Yeni kampanya oluşturma formu
- `campaign/[id]/page.tsx` → Kampanya detay + bağış
- `globals.css` → Tüm stiller (design system, scroll animasyonları)
- **Rol:** UI/UX odaklı çalış. Mevcut dark theme ve Avalanche kırmızı renk paletini koru.

### `/src/components/` — Reusable Components
- `WalletProvider.tsx` → MetaMask/Core Wallet bağlantı context'i
- `Navbar.tsx` → Navigation + wallet connect
- `CampaignCard.tsx` → Kampanya kart component'i
- `Globe3D.tsx` → Three.js 3D dünya arka plan animasyonu
- `ScrollReveal.tsx` → Intersection Observer scroll animasyonları
- `Footer.tsx` → Footer

### `/src/lib/` — Contract Utilities
- `contract.ts` → Wallet bağlantı, contract interaction helper'ları
- `abi.json` → Contract ABI

### `/scripts/` — Deployment
- `deploy.js` → Hardhat deploy script (Fuji/Mainnet)

## Geliştirme Komutları
```bash
npm run dev          # Next.js dev server (localhost:3000)
npm run build        # Production build
npx hardhat compile  # Contract compile
npx hardhat run scripts/deploy.js --network fuji  # Deploy to Fuji
npx hardhat verify --network fuji <ADDRESS>        # Verify on Snowtrace
```

## Güvenlik Kuralları
1. `.env` dosyası ASLA commit edilmez — PRIVATE_KEY içerir
2. Contract'ta tüm fund transfer'ları CEI pattern izlemeli
3. External call'lardan önce state mutasyonları tamamlanmalı
4. `msg.value` check'leri her payable function'da zorunlu
5. Frontend'de user input'ları her zaman sanitize et

## Hackathon Takvimi
- Week 1: Fikir ve mimari ✅
- Week 2-3: MVP — Contract deploy + frontend ← ŞU AN BURADAYIZ
- Week 4-5: GTM stratejisi, üniversite blockchain kulüp ortaklıkları
- Week 6: Final sunum ve canlı demo

## Katkıda Bulunanlar
- **bayabiemin** (Emin) — Proje sahibi, repo: github.com/bayabiemin/shavaxre
- **Bekirerdem** (Bekir) — Full-Stack + Web3 developer, collaborator
