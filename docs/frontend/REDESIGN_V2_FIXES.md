# Sha(vax)re — V2 Düzeltmeler: Cinematic Scroll & Hero Redesign

> Mevcut frontend'e bakıldı. İki ana sorun var:
> 1. Hero bölümü generic ve sıkıcı — globe ile build.avax kopyası gibi
> 2. Sayfa statik — scroll edince section'lar sadece sıralanıyor, Inversa'daki gibi cinematic akış yok
>
> Bu dosya düzeltme talimatlarını içerir. Uygulanacak değişiklikleri sırasıyla yap.

---

## 1. HERO REDESİGN — Globe'u Kaldır, Statement-First Yaklaşım

Mevcut hero'daki globe arka planı KALDIR. Yerine şu yapıyı koy:

### Yeni Hero Konsepti
- **Arka plan**: Saf siyah (#000000) + sol alt köşede çok subtle radial gradient (accent renk, opacity 0.08)
- **Layout**: İçerik SOL HİZALI, padding-left: 8-10%, dikey ortalı
- **Üstte**: Monospace etiket animasyonlu — harfler tek tek beliriyor:
  ```
  • DECENTRALIZED EDUCATION ON AVALANCHE
  ```
  font: JetBrains Mono, 12px, uppercase, letter-spacing: 0.25em, color: var(--accent)

- **Ana başlık**: Space Grotesk, clamp(56px, 8vw, 96px), font-weight: 700, line-height: 1.05
  ```
  Fund Education.
  Change Lives.
  ```
  İlk satır BEYAZ, ikinci satır ACCENT renk (#E84142)
  Animasyon: Her satır 0.6s aralıkla clip-path ile reveal (aşağıdan yukarı slide)

- **Alt açıklama**: Inter, 18px, color: var(--text-secondary), max-width: 480px
  0.8s delay ile fade-up

- **CTA butonları**: 1.2s delay ile fade-up
  - [Start a Campaign] → filled, bg: accent, hover: accent-hover + glow
  - [Explore Campaigns] → outline, border: rgba(255,255,255,0.2), hover: border-white

- **Sağ tarafta** (desktop only): Büyük, çok subtle "SHA(VAX)RE" watermark text
  font-size: 20vw, color: rgba(255,255,255,0.02), position: absolute, right: -5%, top: 50%, transform: translateY(-50%) rotate(-90deg)
  Bu neredeyse görünmez ama depth katıyor

- **Scroll Indicator** (yeni component): Sayfanın alt ortasında
  - Dairesel ring (stroke: accent, 2px, radius: 24px)
  - İçinde "SCROLL" yazısı (mono, 8px, uppercase)
  - Ring'in stroke-dashoffset'i scroll progress'e bağlı (scroll ettikçe doluyor)
  - Subtle bounce animasyonu (yukarı-aşağı 8px, 2s infinite)

### Globe3D Alternatif Kullanım
Globe3D'yi hero'dan ÇIKAR. Eğer kullanmak istersen, "How It Works" bölümünün arka planında ÇOK KÜÇÜK ve ÇOK SOLUK olarak kullan (opacity: 0.15). Ama hero'da OLMAMALI.

---

## 2. CİNEMATİC SCROLL SİSTEMİ — Statik → Dinamik

Mevcut ScrollReveal component'i yetersiz. Şu sistemi kur:

### A) Scroll Progress Tracker
Sayfa genelinde scroll progress'i takip eden bir context/hook:

```tsx
// src/hooks/useScrollProgress.ts
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(window.scrollY / total);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}
```

### B) Section-Level Scroll Animations
Her section kendi scroll progress'ini biliyor:

```tsx
// src/hooks/useSectionProgress.ts
export function useSectionProgress(ref: RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const rect = entry.boundingClientRect;
          const viewportHeight = window.innerHeight;
          // 0 = section viewport'un altında, 1 = section viewport'un üstünde
          const sectionProgress = 1 - (rect.top / viewportHeight);
          setProgress(Math.max(0, Math.min(1, sectionProgress)));
        }
      },
      { threshold: Array.from({ length: 100 }, (_, i) => i / 100) }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return progress;
}
```

### C) Her Section'a Uygula

**Problem Section (Sahne 2):**
- Scroll progress 0-0.3: İstatistik sayıları count-up animasyonu (0 → 244M, 0 → $39B, 0 → 68%)
- Scroll progress 0.3-0.6: Sağ taraftaki metin blokları fade-in + slide-left
- Arka plan: scroll ile opacity değişen subtle gradient overlay
- Sol tarafta sayılar sabit kalıyor (sticky), sağ taraf scroll ile değişiyor

**How It Works (Sahne 3):**
- 3 adım AYRI AYRI geliyor — her biri scroll ile tetikleniyor
- Her adım gelirken: numara önce (scale-up), sonra başlık (fade-right), sonra açıklama (fade-up)
- Adımlar arasında ince yatay çizgi çiziliyor (CSS animation, width: 0 → 100%)

**Statement (Sahne 4):**
- BEYAZ arka plan — ama scroll ile geliyor:
  - Arka plan: scaleX(0) → scaleX(1) (soldan sağa wipe efekti)
  - Text: arka plan geldikten 0.3s sonra, kelime kelime fade-in
  - Bu bölüm 100vh — viewport'u tamamen kaplayacak

**Campaign Kartları (Sahne 5):**
- Kartlar aşağıdan yukarı stagger ile geliyor (her kart 150ms delay)
- İlk gelişte scale(0.9) + opacity(0) → scale(1) + opacity(1)
- Hover: translateY(-8px) + border-color accent + box-shadow glow

**Impact/Testimonial (Sahne 6):**
- KIRMIZI arka plan — statement ile aynı wipe efekti ama SAĞDAN SOLA
- Text: tüm cümle bir anda scale(0.85) → scale(1) ile POP
- Bu bölüm de 100vh

**Footer (Sahne 7):**
- Mega "SHA(VAX)RE" tipografi: scroll ile opacity 0 → 1, translateY(50px) → translateY(0)
- Üstteki linkler basit fade-in

---

## 3. SCROLL PROGRESS BAR

Sayfanın sağ kenarında ince bir progress çizgisi:
```css
.scroll-progress {
  position: fixed;
  top: 0;
  right: 0;
  width: 3px;
  height: 100vh;
  z-index: 100;
  background: rgba(255, 255, 255, 0.05);
}
.scroll-progress-fill {
  width: 100%;
  background: var(--accent);
  transition: height 0.1s linear;
  /* height JS ile scroll progress'e göre ayarlanacak */
}
```

---

## 4. NAVBAR GÜNCELLEMESİ

- Scroll 0'dayken: transparent background, logo ve linkler visible
- Scroll > 100px: backdrop-blur(20px) + bg: rgba(0,0,0,0.8) + border-bottom: 1px solid var(--border)
- Geçiş: 300ms ease transition
- Statement bölümünde (beyaz bg): navbar renkleri INVERSE olmalı (siyah text, beyaz bg hint)

---

## 5. SMOOTH SCROLL

```css
html {
  scroll-behavior: smooth;
}
```

Ama daha önemlisi, tüm animasyonlar `scroll` event'ine değil, **Intersection Observer + CSS transition'a** bağlı olmalı. Bu performans için kritik.

Her animated element şu pattern'i izlesin:
```css
.animate-on-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.animate-on-scroll.visible {
  opacity: 1;
  transform: translateY(0);
}
```

---

## ÖZET: Ne Değişecek?

| Bölüm | Eski | Yeni |
|-------|------|------|
| Hero | Globe + centered text | Statement-first, sol hizalı, globe yok |
| Scroll | Statik section'lar | Cinematic, her section animasyonlu sahne |
| Problem | Basit istatistik listesi | Sticky sol + scrolling sağ, count-up |
| Statement | Normal section | 100vh beyaz wipe + kelime kelime reveal |
| Testimonial | Normal section | 100vh kırmızı wipe + pop animasyon |
| Footer | Basit footer | Mega tipografi + 3 sütun grid |
| Navbar | Sabit | Scroll-aware, transparent → blur |
| Progress | Yok | Sağda ince kırmızı progress bar |
| Scroll indicator | Yok | Dairesel ring + "SCROLL" text |
