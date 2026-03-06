# Sha(vax)re — Implementation Plan (Claude Code)

> Bu dokümanı Claude Code'a ver. Sırasıyla her task'ı uygulasın.
> Contract dosyalarına (src/lib/contract.ts, src/lib/abi.json) sadece yeni fonksiyon EKLE, mevcut kodu bozma.
> Her task bittiğinde "✅ Task X tamamlandı" de ve bir sonrakine geç.

---

## TASK 1: Dashboard Sayfası (`/dashboard`)

### Dosya: `src/app/dashboard/page.tsx`

**Açıklama**: Wallet bağlı kullanıcının bağış geçmişini ve desteklediği kampanyaları gösteren sayfa.

**Veri kaynağı**: Mevcut contract'tan `donations` mapping'i ve `campaigns` mapping'i okunacak. Ek olarak contract'a `getDonorCampaigns(address)` view fonksiyonu eklenebilir veya frontend'de campaignCount loop ile taranabilir.

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│ NAVBAR (mevcut)                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  • MY DASHBOARD                                      │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Total    │ │ Campaigns│ │ Impact   │ │ Avg      ││
│  │ Donated  │ │ Supported│ │ Score    │ │ Donation ││
│  │ 3.5 AVAX │ │ 4        │ │ 850      │ │ 0.87 AVAX││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
│                                                      │
│  ┌─ Supported Campaigns ─────────────────────────┐  │
│  │ Campaign Title          Status    My Donation  │  │
│  │ Web3 Bootcamp          Active     0.5 AVAX    │  │
│  │ CS Textbooks           Funded     1.0 AVAX    │  │
│  │ Research Grant          Active     2.0 AVAX    │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ Recent Transactions ──────────────────────────┐  │
│  │ 🔴 0.5 AVAX → Web3 Bootcamp    2 hours ago   │  │
│  │ 🔴 1.0 AVAX → CS Textbooks     3 days ago    │  │
│  │    View on Snowtrace ↗                         │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Tasarım kuralları**:
- Glass morphism kartlar (bg: rgba(255,255,255,0.03), border: rgba(255,255,255,0.06), backdrop-blur)
- İstatistik kartları: Sayı büyük (32px, Space Grotesk bold), label küçük (12px mono, uppercase, text-muted)
- Tablo satırları: hover'da bg değişimi, border-bottom: 1px solid var(--border)
- "Impact Score" hesaplama: (totalDonated * 100) + (campaignsSupported * 50)
- Snowtrace linkleri: `https://testnet.snowtrace.io/tx/{txHash}`
- Wallet bağlı değilse: "Connect your wallet to see your dashboard" mesajı + connect butonu

**Navbar'a ekle**: "Dashboard" linki (wallet bağlıysa görünsün)

---

## TASK 2: Kampanya Detay Sayfası İyileştirmesi

### Dosya: `src/app/campaign/[id]/page.tsx`

**Mevcut**: Basit bağış formu.
**Yeni**: Zengin detay sayfası.

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  ← Back to Campaigns                                │
│                                                      │
│  • TUITION                         Active · 18d left│
│                                                      │
│  Avalanche Web3 Bootcamp                             │
│  by 0x3f...a2b1                                      │
│                                                      │
│  ████████████░░░░░░░░░ 65%                           │
│  3.25 / 5.00 AVAX raised                             │
│                                                      │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │                 │  │ About This Campaign       │  │
│  │  DONATE         │  │                            │  │
│  │                 │  │ [Campaign description      │  │
│  │  Amount (AVAX)  │  │  full text here...]        │  │
│  │  [___0.1____]   │  │                            │  │
│  │                 │  │                            │  │
│  │  [Donate Now]   │  └──────────────────────────┘  │
│  │                 │                                 │
│  │  Quick amounts: │  ┌──────────────────────────┐  │
│  │  [0.1] [0.5]   │  │ • CAMPAIGN STATS          │  │
│  │  [1.0] [2.0]   │  │                            │  │
│  │                 │  │ 12 donors                  │  │
│  └─────────────────┘  │ 0.27 AVAX avg donation    │  │
│                        │ Created: Mar 1, 2026      │  │
│                        │ Deadline: Mar 20, 2026    │  │
│                        └──────────────────────────┘  │
│                                                      │
│  ┌─ Recent Donations ────────────────────────────┐  │
│  │ 0x7a...f3c2    0.5 AVAX    2 hours ago        │  │
│  │ 0xb1...e4d5    1.0 AVAX    1 day ago          │  │
│  │ 0x2c...a8f1    0.25 AVAX   3 days ago         │  │
│  │ View all on Snowtrace ↗                        │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌─ Share This Campaign ─────────────────────────┐  │
│  │ [Twitter/X] [Copy Link] [LinkedIn]            │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Yeni özellikler**:
- Quick amount butonları (0.1, 0.5, 1.0, 2.0 AVAX) — tıklayınca input'u doldursun
- Bağışçı listesi: Contract'tan `DonationReceived` event'lerini oku (ethers.js `queryFilter`)
- Share butonları: Twitter intent URL, clipboard copy, LinkedIn share
- Kampanya sahibi kendi sayfasını görüyorsa: "Claim Funds" butonu göster (eğer claimed değilse)
- Geri sayım: Deadline'a kaç gün/saat kaldı (countdown timer)
- "Avg donation" hesaplama: raisedAmount / donorCount

---

## TASK 3: Avalanche Showcase Section (Ana sayfa)

### Dosya: `src/app/page.tsx` — Yeni section ekle (Sahne 5 ile 6 arasına)

**Açıklama**: Avalanche'ın avantajlarını gösteren bölüm.

**Layout**:
```
┌─────────────────────────────────────────────────────┐
│  • WHY AVALANCHE                                     │
│                                                      │
│  Built for speed. Designed for impact.               │
│                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│  │   < 1s       │ │   $0.02      │ │   100%       │ │
│  │   Finality   │ │   Avg Gas    │ │   On-Chain   │ │
│  │              │ │              │ │              │ │
│  │  Donations   │ │  vs $3.50    │ │  Every tx    │ │
│  │  confirm in  │ │  on Ethereum │ │  verifiable  │ │
│  │  under 1     │ │              │ │  on          │ │
│  │  second      │ │              │ │  Snowtrace   │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ │
│                                                      │
│       Powered by Avalanche C-Chain                   │
│       [View Contract on Snowtrace ↗]                 │
└─────────────────────────────────────────────────────┘
```

**Tasarım**:
- 3 kart: Glass morphism, her birinin üstünde büyük sayı (48px, accent renk)
- "vs $3.50 on Ethereum" kısmı: text-muted, küçük karşılaştırma
- Snowtrace linki: `https://testnet.snowtrace.io/address/0xfaDa353b9300Fc82B72a25B7E59867f4D0376cbd`
- Animasyon: Kartlar stagger fade-up

---

## TASK 4: Kampanya Filtreleme & Kategoriler

### Dosya: `src/app/campaigns/page.tsx` — Güncelle

**Eklenecekler**:
- Kategori filtreleme bar'ı: [All] [Tuition] [Books] [Research] [Equipment] [Scholarship]
  - Butonlar: pill/chip tarzı, aktif olan accent renk bg
  - Filtreleme client-side (campaigns array'ini filtrele)
- Sıralama dropdown: "Sort by: Newest / Most Funded / Ending Soon"
- Grid layout: 3 sütun desktop, 2 tablet, 1 mobile
- Boş state: Filtreye uygun kampanya yoksa "No campaigns found in this category" mesajı

---

## TASK 5: Canlı Bağış Toast Bildirimi

### Yeni dosya: `src/components/DonationToast.tsx`

**Açıklama**: Herhangi bir kampanyaya bağış yapıldığında ekranın sağ alt köşesinde toast notification göster.

**Implementasyon**:
```tsx
// Contract'tan DonationReceived event'ini dinle
// ethers.js contract.on("DonationReceived", callback) kullan
// Toast: slide-in from right, 5s sonra auto-dismiss
// İçerik: "🔴 0x3f...a2b1 donated 0.5 AVAX to 'Web3 Bootcamp'"
// Toast stack: birden fazla toast üst üste (gap: 8px)
```

**Tasarım**:
- Position: fixed, bottom-right, z-index: 1000
- bg: var(--bg-elevated), border: var(--border), border-left: 3px solid var(--accent)
- Animasyon: slideInRight → 5s bekle → slideOutRight
- Max 3 toast aynı anda

---

## TASK 6: Open Graph & SEO Meta Tags

### Dosya: `src/app/layout.tsx` — Metadata güncelle

```tsx
export const metadata = {
  title: "Sha(vax)re — Decentralized Education Crowdfunding",
  description: "Fund education directly on Avalanche. Zero commission, zero middlemen. Every AVAX creates a future.",
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
```

**Not**: OG image'ı Gemini ile oluşturulacak (`public/og-image.png`, 1200x630px)

---

## TASK 7: Responsive Fine-Tuning

### Dosya: `src/app/globals.css`

Tüm sayfaları şu breakpoint'lerde test et ve düzelt:
- **Mobile**: 375px (iPhone SE)
- **Tablet**: 768px (iPad)
- **Desktop**: 1440px

**Kontrol listesi**:
- [ ] Hero text mobile'da overflow etmiyor
- [ ] Kampanya kartları mobile'da tek sütun
- [ ] Dashboard istatistikleri mobile'da 2x2 grid
- [ ] Navbar mobile'da hamburger menü
- [ ] Footer mobile'da tek sütun
- [ ] Touch target'lar min 44px
- [ ] Mega footer tipografi mobile'da küçülüyor

---

## TASK 8: "Bağış Sonrası" UX Akışı

### Dosya: `src/app/campaign/[id]/page.tsx` — Bağış sonrası modal/state

Bağış transaction'ı onaylandıktan sonra:

1. **Success state**: Yeşil tik animasyonu + "Thank you! Your donation is confirmed."
2. **Transaction detayları**: TX hash + Snowtrace linki
3. **Finality göstergesi**: "Confirmed in 0.X seconds on Avalanche" (block.timestamp farkı)
4. **Paylaşım CTA**: "Share your donation on Twitter" → pre-filled tweet:
   ```
   I just donated to "{campaignTitle}" on @Sha_vax_re 🔴
   Zero commission, direct to students on @avaborlabs Avalanche.

   Fund education → shavaxre.vercel.app
   ```
5. **Confetti animasyonu** (CSS-only, lightweight)

---

## GENEL KURALLAR

1. **Mevcut design system'i koru**: CSS variables, Space Grotesk / Inter / JetBrains Mono
2. **Glass morphism kartlar**: Tüm yeni kartlarda aynı pattern
3. **Section etiketleri**: Her yeni section'da `• UPPERCASE MONO` etiket
4. **Animasyonlar**: Intersection Observer + CSS transition (external kütüphane EKLEME)
5. **Contract dosyalarına DOKUNMA**: `src/lib/contract.ts` ve `src/lib/abi.json` mevcut hali ile çalış
6. **Responsive**: Her yeni component mobile-first yazılmalı
7. **Error handling**: Wallet bağlı değilse, network yanlışsa, transaction fail olursa → kullanıcı dostu mesajlar
