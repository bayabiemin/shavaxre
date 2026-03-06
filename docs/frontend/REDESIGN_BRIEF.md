# Sha(vax)re — Frontend Redesign Brief

> Bu dokümanı Claude Code'a ver. Tüm frontend'i sıfırdan yeniden tasarlasın.
> Referanslar: inversa.com (Exo Ape), avax.network, build.avax.network, estrela.studio

---

## Proje Bağlamı

Sha(vax)re, Avalanche C-Chain üzerinde çalışan merkeziyetsiz eğitim crowdfunding platformudur.
**Tech Stack**: Next.js 16, TypeScript, React 19, ethers.js v6, Three.js
**Mevcut dosyalar**: `src/app/page.tsx`, `src/app/globals.css`, `src/components/`
**Contract**: Zaten deploy edildi (`0xfaDa...6cbd` Fuji Testnet), `src/lib/contract.ts` ve `src/lib/abi.json` DOKUNMA.

---

## Tasarım Felsefesi

**Cinematic Storytelling**: Sayfa bir hikaye anlatıyor. Her section bir sinema sahnesi.
**Avalanche DNA**: Siyah zemin, Avalanche kırmızısı (#E84142) tek accent renk — az ama etkili.
**Premium Minimalizm**: inversa.com'daki gibi çok az element, güçlü kontrastlar, devasa tipografi.
**Scroll = Deneyim**: Kullanıcı scroll ettikçe sahne sahne hikaye açılıyor.

---

## Design System

### Renk Paleti
```css
:root {
  /* Backgrounds */
  --bg-primary: #000000;
  --bg-secondary: #0A0A0F;
  --bg-elevated: #111118;
  --bg-card: rgba(255, 255, 255, 0.03);
  --bg-card-hover: rgba(255, 255, 255, 0.06);

  /* Avalanche Accent — TEK ACCENT RENK, inversa'daki lime sarı gibi kullan */
  --accent: #E84142;
  --accent-hover: #FF394A;
  --accent-glow: rgba(232, 65, 66, 0.25);
  --accent-bg: rgba(232, 65, 66, 0.08);

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
  --text-muted: #71717A;

  /* Borders */
  --border: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(255, 255, 255, 0.12);
  --border-accent: rgba(232, 65, 66, 0.3);

  /* Effects */
  --gradient-hero: radial-gradient(ellipse at 30% 50%, rgba(232,65,66,0.15) 0%, transparent 60%);
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.06);
  --glass-blur: blur(20px);
}
```

### Tipografi
```css
/* Google Fonts: Space Grotesk (display) + Inter (body) + JetBrains Mono (code) */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

--font-display: 'Space Grotesk', sans-serif;  /* Başlıklar */
--font-body: 'Inter', sans-serif;              /* Body text */
--font-mono: 'JetBrains Mono', monospace;      /* Contract adresi, on-chain data */

/* Sizes */
--text-hero: clamp(48px, 8vw, 80px);          /* Hero başlık */
--text-statement: clamp(36px, 5vw, 56px);     /* Statement bölümü */
--text-section: clamp(28px, 4vw, 44px);       /* Section başlıkları */
--text-body: 18px;
--text-small: 14px;
--text-label: 12px;                            /* Monospace etiketler */
```

### Section Etiketleri (inversa tarzı)
Her section'ın başında monospace, uppercase etiket:
```
• PROBLEM       • HOW IT WORKS       • CAMPAIGNS       • IMPACT
```
CSS: `font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.2em; font-size: 12px; color: var(--accent);`
Başına kırmızı dot: `&::before { content: '•'; color: var(--accent); margin-right: 8px; }`

---

## Sayfa Akışı (7 Sahne)

### Sahne 1: HERO (100vh)
**Referans**: inversa hero + build.avax gradient mesh

- **Arka plan**: Three.js Globe3D (mevcut component'i koru ama opacity düşür) + üzerine subtle radial gradient (#E84142 → transparent)
- **İçerik**: Sol hizalı (inversa gibi, centered değil)
  - Monospace etiket: `• DECENTRALIZED EDUCATION`
  - Başlık (Space Grotesk, 80px, bold): **"Fund Education.\nChange Lives."**
  - Alt açıklama (Inter, 18px, text-secondary): "Zero commission, zero middlemen. Direct AVAX donations on Avalanche."
  - CTA butonları: [Start a Campaign] (filled accent) + [Explore Campaigns] (outline beyaz)
- **Scroll indicator**: Dairesel progress ring (kırmızı stroke) + "SCROLL" yazısı ortasında (inversa tarzı)
- **Animasyon**: Başlık harfleri sırayla fade-in (stagger 30ms), alt içerik 400ms delay ile fade-up

### Sahne 2: PROBLEM (100vh, scroll-triggered)
**Referans**: inversa'nın "DAMAGED ECOSYSTEMS" bölümü

- **Arka plan**: Koyu gradient (bg-primary → bg-secondary)
- **Layout**: İki sütun — solda istatistikler, sağda açıklama metni
- **Etiket**: `• THE PROBLEM`
- **İstatistikler** (büyük sayılar, fade-up ile geliyor):
  - "244M" — Children out of school
  - "$39B" — Annual education funding gap
  - "68%" — Donations lost to middlemen
- **Metin**: "Traditional education funding is broken. Bureaucracy eats donations. Students never see the money."
- **Animasyon**: Sayılar count-up animasyonu (0 → 244M), metinler scroll ile fade-in

### Sahne 3: ÇÖZÜM — HOW IT WORKS (auto height)
**Referans**: inversa'nın numaralı feature bölümü (001 · BODY CAMS)

- **Etiket**: `• HOW IT WORKS`
- **Layout**: 3 adım, numaralı (inversa tarzı):
  ```
  001 · CREATE        002 · DONATE        003 · IMPACT
  ```
- **Her adım**: Numara (mono, kırmızı) + başlık + açıklama + minimal ikon (line-art SVG, beyaz çizgi)
  1. Öğrenci kampanya oluşturur → smart contract'a kaydedilir
  2. Bağışçı direkt AVAX gönderir → sıfır komisyon, anlık transfer
  3. Hedefe ulaşılınca öğrenci fonları çeker → tamamen şeffaf
- **Animasyon**: Her kart soldan sağa stagger fade-in (200ms delay), line-art ikonlar draw-on efekti

### Sahne 4: STATEMENT (100vh, kontrast kırılması)
**Referans**: inversa'nın beyaz arka plan statement bölümü

- **Arka plan**: `#FFFFFF` (TAM BEYAZ — dramatik kontrast)
- **İçerik**: Ortada, büyük serif/display font, siyah text:
  **"Where blockchain meets education, every AVAX creates a future."**
- **Animasyon**: Metin kelime kelime fade-in (scroll-triggered)
- **Not**: Bu bölüm tüm sayfadaki TEK beyaz bölüm — kontrast etkisi çok güçlü

### Sahne 5: CAMPAIGNS (auto height)
**Referans**: avax.network kart yapısı + glass morphism

- **Etiket**: `• ACTIVE CAMPAIGNS`
- **Layout**: 3 sütunlu grid (responsive: mobile 1, tablet 2, desktop 3)
- **Kart tasarımı** (glass morphism):
  ```
  ┌─────────────────────────────┐
  │ ░░░░░ Progress Bar ░░░░░░░ │  ← kırmızı progress
  │                             │
  │ Campaign Title              │  ← Space Grotesk, 20px, bold
  │ by student.avax             │  ← mono, text-muted, 14px
  │                             │
  │ 2.5 / 5.0 AVAX              │  ← büyük sayı + progress %
  │ ████████░░░░░ 50%           │
  │                             │
  │ 12 donors · 18 days left    │  ← text-muted
  │                             │
  │ [Donate Now]                │  ← accent button
  └─────────────────────────────┘
  ```
  - bg: `var(--glass-bg)`, border: `var(--glass-border)`, backdrop-filter: `var(--glass-blur)`
  - Hover: border → `var(--border-accent)`, subtle glow, translateY(-4px)
- **Animasyon**: Kartlar stagger scale-up (150ms delay)

### Sahne 6: IMPACT / TESTIMONIAL (100vh, dramatik)
**Referans**: inversa'nın lime sarı testimonial bölümü

- **Arka plan**: `var(--accent)` (#E84142) — TAM KIRMIZI ARKA PLAN
- **İçerik**: Devasa siyah tipografi (80-100px, Space Grotesk bold):
  **"Education funded on-chain is education that can't be stolen."**
- **Alt**: Kaynak attribution (mono, küçük)
- **Not**: Bu bölüm sayfanın en unutulmaz anı — inversa'daki lime sarı bölümün kırmızı versiyonu
- **Animasyon**: Tüm text bir anda scale(0.9) → scale(1) ile pop-in

### Sahne 7: FOOTER
**Referans**: inversa footer tarzı

- **Üst kısım**: 3 sütunlu grid
  - Sol: Sha(vax)re logosu + kısa tagline
  - Orta: Navigation linkleri (Campaigns, Create, About)
  - Sağ: Social links (GitHub, Twitter/X) + contract adresi (mono, kırmızı)
- **Alt kısım**: Ekranı kaplayan mega tipografi — "SHA(VAX)RE" (çok büyük, kırmızı, ~200px+, overflow hidden)
- **En alt**: © 2026 · Built on Avalanche · Fuji Testnet

---

## Component Listesi

Güncellenecek / yeniden yazılacak:
1. `src/app/page.tsx` — Komple yeniden yaz (7 sahne yapısı)
2. `src/app/globals.css` — Komple yeniden yaz (design system)
3. `src/components/Navbar.tsx` — Floating, minimal, backdrop-blur
4. `src/components/Globe3D.tsx` — KORU, sadece opacity ve z-index ayarla
5. `src/components/ScrollReveal.tsx` — KORU veya güncelle
6. `src/components/CampaignCard.tsx` — Glass morphism ile yeniden tasarla
7. `src/components/Footer.tsx` — inversa tarzı mega footer

Yeni component'ler:
8. `src/components/ScrollIndicator.tsx` — Dairesel "SCROLL" progress ring
9. `src/components/CountUp.tsx` — Sayı count-up animasyonu
10. `src/components/SectionLabel.tsx` — Monospace "• LABEL" etiket component'i

## DOKUNMA
- `src/lib/contract.ts` — Contract interaction logic
- `src/lib/abi.json` — Contract ABI
- `contracts/` — Solidity dosyaları
- `hardhat.config.js` — Deploy config
- `.env` — Private key

---

## Teknik Notlar

- **Next.js 16 App Router** kullan (mevcut yapı)
- **Globe3D** dynamic import ile yükle: `const Globe3D = dynamic(() => import('@/components/Globe3D'), { ssr: false })`
- **Tüm animasyonlar** CSS + Intersection Observer — external kütüphane EKLEME (Framer Motion, GSAP vb.)
- **Responsive**: Mobile-first, 3 breakpoint (640px, 1024px, 1440px)
- **Performance**: Lazy load images, will-change on animated elements, prefers-reduced-motion support
