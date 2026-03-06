# Sha(vax)re — V3 Cinematic Scroll Overhaul

> **HEDEF**: Inversa.com seviyesinde scroll-driven sinematik deneyim.
> **TEMEL FARK**: Intersection Observer → **GSAP ScrollTrigger + scrub** geçişi.
> **KURAL**: Mevcut section yapısı ve içerik korunacak, animasyon motoru değişecek.

---

## ADIM 0: Paket Kurulumu

```bash
npm install gsap @studio-freight/lenis
```

**GSAP ScrollTrigger** → Scroll pozisyonuna bağlı animasyon (scrub)
**Lenis** → Smooth scroll (native scroll yerine lerp-based scroll)

---

## ADIM 1: Smooth Scroll Altyapısı

### Dosya: `src/components/SmoothScroll.tsx` (YENİ)

```tsx
"use client";
import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // GSAP ScrollTrigger ile Lenis senkronizasyonu
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return <div id="smooth-wrapper">{children}</div>;
}
```

### Dosya: `src/app/client-layout.tsx` — SmoothScroll'u wrap et

```tsx
// Mevcut layout yapısını SmoothScroll ile sar:
<SmoothScroll>
  <Navbar />
  {children}
  <Footer />
  <DonationToast />
</SmoothScroll>
```

---

## ADIM 2: ScrollReveal Componentini GSAP ile Yeniden Yaz

### Dosya: `src/components/ScrollReveal.tsx` — GSAP versiyonu

Mevcut Intersection Observer yaklaşımını **tamamen kaldır**.
Yerine GSAP ScrollTrigger ile scrub-based animasyon koy.

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface Props {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-left" | "fade-right" | "scale-up" | "blur-in" | "wipe-left" | "wipe-right";
  delay?: number;
  duration?: number;
  scrub?: boolean | number; // true = scroll-linked, number = smoothing
  className?: string;
}

export default function ScrollReveal({
  children,
  animation = "fade-up",
  delay = 0,
  duration = 1,
  scrub = false,
  className = "",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const animations: Record<string, gsap.TweenVars> = {
      "fade-up":    { y: 80, opacity: 0 },
      "fade-left":  { x: -80, opacity: 0 },
      "fade-right": { x: 80, opacity: 0 },
      "scale-up":   { scale: 0.8, opacity: 0 },
      "blur-in":    { filter: "blur(20px)", opacity: 0 },
      "wipe-left":  { clipPath: "inset(0 100% 0 0)" },
      "wipe-right": { clipPath: "inset(0 0 0 100%)" },
    };

    const from = animations[animation] || animations["fade-up"];

    gsap.fromTo(el, from, {
      ...Object.fromEntries(Object.keys(from).map(k => [k, k === "opacity" ? 1 : k === "scale" ? 1 : k === "filter" ? "blur(0px)" : k === "clipPath" ? "inset(0 0% 0 0)" : 0])),
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        end: "top 20%",
        scrub: scrub,
        toggleActions: scrub ? undefined : "play none none none",
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === el) st.kill();
      });
    };
  }, [animation, delay, duration, scrub]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

**ÖNEMLİ**: `scrub={1}` kullanılan yerlerde animasyon scroll pozisyonuna birebir bağlı olacak. Kullanıcı scroll ettikçe animasyon ilerleyecek, geri sardıkça geri gidecek.

---

## ADIM 3: Section-Level Timeline Animasyonları

Bu kısım projenin EN KRİTİK noktası. Her section bir "sahne" (scene) ve kendi GSAP timeline'ına sahip.

### 3A: Hero Section — Pinned + Parallax Fade

```
Davranış:
- Hero section PIN'lenir (scroll ederken ekranda sabit kalır)
- İçindeki elementler scroll ile ayrı hızlarda hareket eder (parallax)
- Başlık yukarı kayarken opacity azalır
- Alt metin daha yavaş kayar
- Globe3D (varsa) arka planda daha da yavaş kayar
- %100 scroll'da hero tamamen kaybolur, sonraki section gelir
```

```tsx
// Hero section useEffect içinde:
useEffect(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: heroRef.current,
      start: "top top",
      end: "+=100%", // 1 viewport height kadar pin
      scrub: 1,
      pin: true,
      pinSpacing: true,
    },
  });

  tl.to(titleRef.current, { y: -150, opacity: 0, ease: "none" }, 0)
    .to(subtitleRef.current, { y: -80, opacity: 0, ease: "none" }, 0)
    .to(ctaRef.current, { y: -50, opacity: 0, ease: "none" }, 0.1)
    .to(bgRef.current, { scale: 1.1, opacity: 0.3, ease: "none" }, 0);

  return () => { tl.kill(); };
}, []);
```

### 3B: Problem/Stats Section — Count-Up ile Scrub

```
Davranış:
- Section viewport'a girince elementler fade-up ile belirir
- Sayılar (12, 127, $50K vb.) scroll pozisyonuyla ARTAR
  → Scroll %0 = sayı 0, Scroll %100 = final sayı
- Bu Intersection Observer count-up'tan FARKLI:
  Sayılar scroll'a bağlı, otomatik artmıyor
```

```tsx
// GSAP ile scroll-linked counter:
useEffect(() => {
  const counter = { val: 0 };
  gsap.to(counter, {
    val: targetNumber,
    duration: 1,
    ease: "none",
    scrollTrigger: {
      trigger: sectionRef.current,
      start: "top 60%",
      end: "top 10%",
      scrub: 1,
    },
    onUpdate: () => {
      if (numberRef.current) {
        numberRef.current.textContent = Math.round(counter.val).toLocaleString();
      }
    },
  });
}, []);
```

### 3C: How It Works — Stagger + Line Draw

```
Davranış:
- 3 adım kartı sırayla fade-up ile gelir (stagger: 0.15)
- Her kartın arasındaki bağlantı çizgisi ÇIZIYOR gibi belirir (stroke-dashoffset animasyonu)
- Scrub: true — scroll ettikçe adımlar ortaya çıkar
```

```tsx
useEffect(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.current,
      start: "top 70%",
      end: "bottom 30%",
      scrub: 1,
    },
  });

  // Kartlar stagger ile
  tl.from(cardRefs.current, {
    y: 60,
    opacity: 0,
    stagger: 0.2,
    ease: "power2.out",
  });

  // Bağlantı çizgileri draw-on
  tl.from(lineRefs.current, {
    strokeDashoffset: 300, // SVG path uzunluğu
    stagger: 0.15,
    ease: "none",
  }, "<0.1");

  return () => { tl.kill(); };
}, []);
```

### 3D: Statement Section — BEYAZ WIPE + Word-by-Word Reveal (PIN)

**Bu Inversa'nın en güçlü anı — aynen uygula.**

```
Davranış:
- Section 100vh, PINNED
- Scroll başladığında arka plan SİYAHTAN BEYAZA wipe eder (soldan sağa)
- Wipe tamamlanınca, metin kelime kelime fade-in olur
- Son kelime ("future.") accent renk (#E84142)
- Scroll bitince unpin, sonraki section gelir
```

```tsx
useEffect(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: statementRef.current,
      start: "top top",
      end: "+=200%", // 2x viewport = daha yavaş, sinematik
      scrub: 1,
      pin: true,
    },
  });

  // Arka plan wipe: siyah → beyaz
  tl.fromTo(
    bgOverlayRef.current,
    { scaleX: 0, transformOrigin: "left center" },
    { scaleX: 1, ease: "none", duration: 0.4 }
  );

  // Kelime kelime reveal
  const words = wordRefs.current;
  words.forEach((word, i) => {
    tl.fromTo(
      word,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.05 },
      0.4 + i * 0.04 // wipe'dan sonra başla
    );
  });

  return () => { tl.kill(); };
}, []);
```

**Statement JSX yapısı:**
```tsx
<section ref={statementRef} className="statement-section">
  {/* Beyaz wipe overlay */}
  <div ref={bgOverlayRef} className="statement-wipe-bg" />

  <div className="statement-content">
    {/* Her kelime ayrı span */}
    {"Where blockchain meets education".split(" ").map((word, i) => (
      <span key={i} ref={el => { if (el) wordRefs.current[i] = el; }} className="statement-word">
        {word}{" "}
      </span>
    ))}
  </div>
</section>
```

**CSS:**
```css
.statement-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
}
.statement-wipe-bg {
  position: absolute;
  inset: 0;
  background: #fff;
  transform: scaleX(0);
  transform-origin: left center;
  z-index: 1;
}
.statement-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  text-align: center;
}
.statement-word {
  display: inline-block;
  font-family: var(--font-display);
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 700;
  color: #000;
  opacity: 0;
}
```

### 3E: Impact/Testimonial Section — KIRMIZI WIPE + Scale Pop (PIN)

**Inversa'daki lime testimonial bölümünün Avalanche kırmızısı versiyonu.**

```
Davranış:
- Section 100vh, PINNED
- Arka plan siyahtan KIRMIZIYA (#E84142) wipe eder (sağdan sola)
- Wipe tamamlanınca, büyük quote text scale(0.5) → scale(1) ile pop-in
- Çok güçlü dramatik an — sitenin "wow" momenti
```

```tsx
useEffect(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: impactRef.current,
      start: "top top",
      end: "+=200%",
      scrub: 1,
      pin: true,
    },
  });

  // Kırmızı wipe sağdan sola
  tl.fromTo(
    redOverlayRef.current,
    { scaleX: 0, transformOrigin: "right center" },
    { scaleX: 1, ease: "none", duration: 0.4 }
  );

  // Quote pop-in
  tl.fromTo(
    quoteRef.current,
    { scale: 0.5, opacity: 0 },
    { scale: 1, opacity: 1, ease: "back.out(1.7)", duration: 0.3 },
    0.45
  );

  // Attribution fade
  tl.fromTo(
    attrRef.current,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.15 },
    0.7
  );

  return () => { tl.kill(); };
}, []);
```

### 3F: Campaign Cards — Stagger + Hover Glow

```
Davranış:
- Kartlar scroll ile stagger fade-up (her kart 0.1s arayla)
- Scrub: 1 — scroll pozisyonuna bağlı
- Hover'da: transform scale(1.03) + box-shadow glow + border renk değişimi
```

### 3G: "Why Avalanche" Section — Counter Cards + Parallax

```
Davranış:
- 3 istatistik kartı stagger ile gelir (scrub)
- İçlerindeki sayılar (< 1s, $0.02, 100%) scroll ile count-up
- Arka planda subtle parallax grid/pattern
```

### 3H: Footer — Mega Text Reveal

```
Davranış:
- "SHA(VAX)RE" mega text (vw-based font-size, ekranı kaplayan)
- Footer'a yaklaşırken clipPath ile ortadan dışa doğru reveal
- Accent renk (#E84142) metin
```

```tsx
useEffect(() => {
  gsap.fromTo(
    megaTextRef.current,
    { clipPath: "inset(50% 50% 50% 50%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "power2.out",
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 80%",
        end: "top 20%",
        scrub: 1,
      },
    }
  );
}, []);
```

---

## ADIM 4: Scroll Progress Indicator

### Dosya: `src/components/ScrollProgress.tsx` (YENİ)

Inversa'daki dairesel "SCROLL" indicator'ın Sha(vax)re versiyonu.

```
Davranış:
- Sağ alt köşede fixed, 60x60px dairesel SVG
- İçinde "SCROLL" yazısı (10px, monospace, uppercase)
- SVG circle stroke-dashoffset scroll progress'e bağlı
- Sayfa scroll edildikçe halka dolur
- Stroke renk: #E84142 (accent)
- Sayfa en üstündeyken görünür, scroll %5'ten sonra fade-out (veya tam tersi, tercihe göre)
```

```tsx
"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ScrollProgress() {
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!circleRef.current) return;

    const circumference = 2 * Math.PI * 26; // r=26
    circleRef.current.style.strokeDasharray = `${circumference}`;
    circleRef.current.style.strokeDashoffset = `${circumference}`;

    gsap.to(circleRef.current, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    });
  }, []);

  return (
    <div className="scroll-progress-indicator">
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <circle ref={circleRef} cx="30" cy="30" r="26" fill="none" stroke="var(--accent)" strokeWidth="2"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
      </svg>
      <span className="scroll-label">SCROLL</span>
    </div>
  );
}
```

**CSS:**
```css
.scroll-progress-indicator {
  position: fixed;
  bottom: 32px;
  right: 32px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.scroll-label {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 8px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-secondary);
}
```

---

## ADIM 5: Scroll-Aware Navbar

```
Davranış:
- Sayfa en üstünde: transparan, border yok
- Scroll > 50px: backdrop-blur(20px) + bg rgba(0,0,0,0.8) + border-bottom
- Geçiş: smooth (GSAP ile veya CSS transition)
```

Bu zaten V2'de tanımlanmıştı ama GSAP ile daha smooth yapılabilir.

---

## ADIM 6: Eski Intersection Observer Kodlarını Temizle

### Kaldırılacaklar:
1. `useScrollProgress` hook'undaki raw scroll listener → GSAP ScrollTrigger kullanılacak
2. `ScrollReveal` içindeki IntersectionObserver → GSAP versiyonu ile değiştirildi
3. `CountUp` componentindeki IntersectionObserver → GSAP scroll-linked counter
4. `page.tsx` içindeki tüm manual `useEffect` + IntersectionObserver blokları
5. `SectionLabel` veya `TypewriterLabel` içindeki IO kodları

### KALACAKLAR:
- Globe3D (Three.js) — ama scroll interactivity GSAP ile kontrol edilecek
- Tüm CSS design system (renkler, tipografi, glass morphism)
- Section yapısı ve içerik metinleri

---

## ADIM 7: Performans Optimizasyonu

```
- GSAP `will-change` otomatik yönetir — manual will-change CSS'lerini kaldır
- Lenis smooth scroll tek bir rAF loop kullanır — multiple scroll listener'ları kaldır
- ScrollTrigger.batch() kullan: Aynı animasyonu olan elementleri grupla
- Pin section'larda `anticipatePin: 1` ekle (jank önleme)
- Mobile'da pin sayısını azalt (matchMedia ile):
  ScrollTrigger.matchMedia({
    "(min-width: 768px)": () => { /* desktop pins */ },
    "(max-width: 767px)": () => { /* simpler mobile animations */ }
  });
```

---

## ADIM 8: CSS Güncellemeleri

### globals.css'e EKLE:

```css
/* Lenis smooth scroll base */
html.lenis, html.lenis body {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}
.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
.lenis.lenis-stopped {
  overflow: hidden;
}

/* Pin section base styles */
.pin-section {
  position: relative;
  overflow: hidden;
  will-change: auto; /* GSAP yönetir */
}

/* Statement wipe */
.statement-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
}
.statement-wipe-bg {
  position: absolute;
  inset: 0;
  background: #fff;
  transform: scaleX(0);
  transform-origin: left center;
  z-index: 1;
}
.statement-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  text-align: center;
  padding: 0 2rem;
}
.statement-word {
  display: inline-block;
  font-family: var(--font-display);
  font-size: clamp(32px, 5vw, 64px);
  font-weight: 700;
  line-height: 1.2;
  color: #000;
  margin-right: 0.25em;
}

/* Impact red wipe */
.impact-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  overflow: hidden;
}
.impact-wipe-bg {
  position: absolute;
  inset: 0;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: right center;
  z-index: 1;
}
.impact-quote {
  position: relative;
  z-index: 2;
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 56px);
  font-weight: 700;
  color: #fff;
  text-align: center;
  max-width: 800px;
  padding: 0 2rem;
}

/* Footer mega text */
.footer-mega-text {
  font-family: var(--font-display);
  font-size: clamp(60px, 15vw, 200px);
  font-weight: 800;
  color: var(--accent);
  text-align: center;
  letter-spacing: -0.02em;
  line-height: 1;
  overflow: hidden;
}
```

---

## GENEL AKIŞ ÖZETİ (Scroll Journey)

```
SAYFA ÜSTÜ (scroll = 0)
│
├── HERO (PINNED) ────────────────────────────
│   Parallax: title yukarı, subtitle yavaş, bg en yavaş
│   Scroll indicator: dairesel "SCROLL"
│   PIN sonu: hero fade out
│
├── PROBLEM / STATS ──────────────────────────
│   Scrub count-up: sayılar scroll ile artar
│   Glass kartlar stagger fade-up
│
├── HOW IT WORKS ─────────────────────────────
│   3 adım kartı scrub stagger
│   SVG connector çizgileri draw-on
│
├── STATEMENT (PINNED, 200vh) ────────────────
│   Phase 1: Beyaz wipe soldan sağa (0% → 40%)
│   Phase 2: Kelimeler tek tek belirir (40% → 90%)
│   Son kelime accent renk
│   PIN sonu: normal scroll devam
│
├── CAMPAIGNS ────────────────────────────────
│   Stagger grid, scrub fade-up
│   Category filter pills (no animation needed)
│
├── WHY AVALANCHE ────────────────────────────
│   3 kart stagger + scrub count-up
│   "< 1s Finality" / "$0.02 Gas" / "100% On-Chain"
│
├── IMPACT (PINNED, 200vh) ───────────────────
│   Phase 1: Kırmızı wipe sağdan sola (0% → 40%)
│   Phase 2: Quote scale pop-in (40% → 70%)
│   Phase 3: Attribution fade (70% → 85%)
│
├── FOOTER ───────────────────────────────────
│   "SHA(VAX)RE" mega text clipPath reveal
│   3 sütun grid fade-up
│
SAYFA SONU
```

---

## KRİTİK KURALLAR

1. **`scrub: 1`** → Animasyon scroll pozisyonuyla 1:1 senkron. Bu ZORUNLU — trigger-based değil.
2. **`pin: true`** → Hero, Statement, Impact section'ları sabitlenir. Diğerleri normal scroll.
3. **Lenis** → Native scroll yerine smooth interpolated scroll. Cinematic his için şart.
4. **Mevcut design system'e DOKUNMA**: Renkler, fontlar, glass morphism aynı kalacak.
5. **`contract.ts` ve `abi.json`'a DOKUNMA**: Contract interaction mevcut haliyle çalışır.
6. **Mobile responsive**: `ScrollTrigger.matchMedia()` ile mobile'da pin sayısı azaltılacak, basit fade-in'e dönecek.
7. **IntersectionObserver kodlarını KALDIR**: Tüm scroll animasyonları GSAP üzerinden.
8. **Her section bir GSAP timeline'ına sahip**: Timeline'lar section unmount'da kill edilmeli (memory leak önleme).

---

## DOSYA DEĞİŞİKLİK TABLOSU

| Dosya | Aksiyon |
|-------|---------|
| `package.json` | gsap + @studio-freight/lenis ekle |
| `src/components/SmoothScroll.tsx` | YENİ — Lenis + GSAP entegrasyonu |
| `src/components/ScrollReveal.tsx` | YENIDEN YAZ — GSAP versiyonu |
| `src/components/ScrollProgress.tsx` | YENİ — Dairesel SVG scroll indicator |
| `src/app/client-layout.tsx` | GÜNCELLE — SmoothScroll wrap |
| `src/app/page.tsx` | BÜYÜK GÜNCELLEME — Tüm section'lara GSAP timeline ekle |
| `src/app/globals.css` | GÜNCELLE — Lenis base + pin section + wipe styles |
| `src/components/Globe3D.tsx` | GÜNCELLE — Scroll interactivity GSAP ile |
| `src/components/Navbar.tsx` | GÜNCELLE — GSAP scroll-aware |
| `src/components/Footer.tsx` | GÜNCELLE — Mega text reveal |
| `src/hooks/useScrollProgress.ts` | KALDIR veya GSAP'a dönüştür |
| `src/components/CountUp.tsx` | YENIDEN YAZ — GSAP scroll-linked counter |

---

## TEST KONTROL LİSTESİ

- [ ] Lenis smooth scroll çalışıyor (scroll hissi yumuşak)
- [ ] Hero section pin'leniyor, parallax çalışıyor
- [ ] Stats sayıları scroll ile artıyor (geri scroll'da azalıyor)
- [ ] How It Works kartları scrub stagger ile geliyor
- [ ] Statement beyaz wipe + kelime reveal çalışıyor
- [ ] Impact kırmızı wipe + quote pop-in çalışıyor
- [ ] Footer mega text clipPath reveal çalışıyor
- [ ] Scroll progress indicator (sağ alt dairesel SVG) çalışıyor
- [ ] Navbar scroll-aware (transparent → blur)
- [ ] Mobile'da pin section'lar basit fade'e dönüyor
- [ ] Sayfa performansı 60fps (Chrome DevTools Performance tab)
- [ ] Tüm eski IntersectionObserver kodları temizlenmiş
