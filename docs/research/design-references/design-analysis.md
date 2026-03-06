# Sha(vax)re — Frontend Redesign Reference Analysis

## Referans Siteler

### 1. avax.network (Avalanche Ana Sayfa)
**Awwwards SOTD** — Wonder Makers & Ava Labs tarafından yapıldı.

**Renk Paleti:**
- Background: `#000000` (saf siyah)
- Accent: `#FF394A` (Avalanche kırmızı) — CTA butonları, vurgular
- Text: `#FFFFFF` (beyaz), `#A1A1AA` (muted gray)
- Gradient: Kırmızıdan turuncu/pembeye geçişler

**Tipografi:**
- Display: Bold, büyük başlıklar (60-80px hero)
- Body: Clean sans-serif, 16-18px
- Mono: Kod snippetleri için monospace

**Layout Patterns:**
- Full-width hero, ortadan hizalı
- Grid-based kart yapısı (3-4 sütun)
- Generous whitespace (padding 80-120px section arası)
- Sticky/floating navbar (backdrop-blur)

**Animasyon:**
- Smooth page transitions
- Scroll-triggered fade-in/slide-up
- Hover: subtle scale + glow efektleri
- Gradient mesh animasyonları arka planda

**Dikkat Çeken:**
- Minimalist ama güçlü tipografi kontrastı
- Kırmızı sadece CTA ve önemli vurgularda — overuse yok
- Dark theme'de depth yaratmak için subtle gradient'ler
- İstatistik sayıları büyük ve bold (social proof)

---

### 2. build.avax.network (Developer Hub)
**Hero Section Focus**

**Hero Tasarım:**
- Büyük gradient arka plan (kırmızı → turuncu → pembe mesh)
- Ortada bold başlık + alt açıklama
- CTA butonları: filled (kırmızı) + outline (beyaz border)
- Animated particle/grid efekti arka planda

**Renk Paleti:**
- Ana palette avax.network ile tutarlı
- Hero'da daha cesur gradient kullanımı
- Kart arka planları: `rgba(255,255,255,0.05)` — glass morphism

**Layout:**
- Hero: Full viewport height, centered content
- Altında: Feature grid (icon + title + description)
- Kod örnekleri: Syntax-highlighted code blocks
- Developer tools: Kart tabanlı navigation

**Dikkat Çeken:**
- Hero gradient mesh çok dikkat çekici ve modern
- Glass card'lar (backdrop-blur + border + low opacity bg)
- Code-first yaklaşım ama görsel olarak çekici
- Hover'da kart border'ları glow efekti

---

### 3. inversa.com (Kullanıcının Favorisi)
**Video analizi: 29 kare, 28.7s ekran kaydı — Exo Ape tarafından yapılmış**

**Renk Paleti:**
- Background: `#000000` (saf siyah) + koyu olive/army tonları hero'da
- Accent: `#D4E157` / `#E8F055` (parlak lime/neon sarı-yeşil) — CTA, vurgular, footer logo
- Text: `#FFFFFF` (beyaz başlıklar), `#CCCCCC` (body text)
- Section başlıkları: Monospace, uppercase, sarı-yeşil dot prefix (• DAMAGED ECOSYSTEMS)
- Testimonial bölümü: Lime/neon sarı arka plan + siyah büyük tipografi — dramatik kontrast

**Tipografi:**
- Hero başlık: Serif font, ~60-70px, "Invasions move fast. Be faster." — cesur, statement
- Section başlıkları: MONOSPACE, UPPERCASE, letter-spacing geniş (• EFFICIENCY)
- Body text: Sans-serif, ~18-20px, 1.6 line-height, max-width kontrollü
- Testimonial: Devasa serif (80-100px+), siyah üzerine lime bg — tam sayfa kaplayacak kadar büyük
- Footer: "INVERSA" kelimesi ekranın tamamını kaplayan mega tipografi

**Layout & Scroll Akışı (Tam Sayfa Hikayesi):**
1. **Hero** — Full viewport, drone havadan çekim görüntüsü (mangrov/nehir), sol altta başlık + CTA butonu, "SCROLL" yazısı ile dairesel progress indicator
2. **Problem bölümü** — Scroll ile arka plan görüntü kararıyor/değişiyor, sağ üstte metin blokları beliriyor (• DAMAGED ECOSYSTEMS), parallax efekt
3. **Çözüm/Origin bölümü** — Metin sola, büyük doğa fotoğrafı sağda, iki sütunlu asimetrik layout
4. **Statement** — Tam genişlik, beyaz arka plan üzerinde büyük siyah serif: "Inversa is where economics, ecology, and efficiency meet." — minimal, güçlü
5. **Feature kartları** — Siyah arka plan, line-art illüstrasyonlar (beyaz çizgi, siyah bg), numaralı bölümler (001 · BODY CAMS), sol metin + orta illüstrasyon
6. **Testimonial** — NEON LİME SARI arka plan + devasa siyah serif tipografi — en dramatik kontrast anı
7. **Footer** — 3 sütunlu grid (contact, social, email), altında ekranı kaplayan mega "INVERSA" tipografi lime renkte

**Animasyon & Efektler:**
- Scroll-bağımlı dairesel progress indicator (sarı halka, "SCROLL" yazısı ortada)
- Arka plan görüntüleri scroll ile kararan/değişen parallax efektler
- Metin blokları scroll ile fade-in (yukarıdan veya soldan)
- Line-art illüstrasyonlar scroll ile çiziliyor gibi beliriyor (draw-on efekt)
- Section geçişleri: smooth, sinematik — her bölüm bir "sahne" gibi
- Scrollbar yerine custom sarı progress bar (sağda ince çizgi)
- Arka plan renk geçişleri: koyu yeşil-olive → siyah → beyaz → siyah → lime sarı → siyah

**Dikkat Çeken (Sha(vax)re İçin İlham):**
- Scroll'un kendisi bir hikaye anlatma aracı — her section bir sahne
- "SCROLL" dairesel indicator çok premium hissettiriyor
- Tek bir accent renk (lime sarı) tüm siteye karakter veriyor — bizde Avalanche kırmızısı aynı rolü üstlenecek
- Beyaz tam sayfa statement bölümü — güçlü contrast break
- Testimonial bölümünde accent renk arka plan + devasa tipografi = unutulmaz an
- Line-art illüstrasyonlar düşük maliyetli ama çok etkileyici
- Footer'da marka isminin ekranı kaplaması — identity statement
- Monospace + uppercase section etiketleri profesyonel/teknik his veriyor

---

## Sha(vax)re İçin Sentez — Tasarım Yönü

### Renk Sistemi
```css
--color-bg-primary: #000000;         /* Saf siyah ana arka plan */
--color-bg-secondary: #0A0A0F;       /* Koyu lacivert-siyah */
--color-bg-card: rgba(255,255,255,0.03); /* Glass card bg */
--color-accent: #E84142;             /* Avalanche kırmızı */
--color-accent-hover: #FF394A;       /* Hover state */
--color-accent-glow: rgba(232,65,66,0.3); /* Glow efekti */
--color-text-primary: #FFFFFF;
--color-text-secondary: #A1A1AA;
--color-text-muted: #71717A;
--color-border: rgba(255,255,255,0.08);
--color-border-hover: rgba(232,65,66,0.4);
```

### Tipografi Önerisi
- **Display**: Inter veya Satoshi (bold, tight letter-spacing)
- **Body**: Inter (regular, 1.6 line-height)
- **Mono**: JetBrains Mono (contract adresleri, on-chain data)
- Hero başlık: 64-80px, font-weight 700-800
- Section başlık: 40-48px
- Body: 16-18px

### Temel Tasarım Prensipleri
1. **Dark-first**: Siyah arka plan, kırmızı accent sparingly
2. **Glass morphism**: Kart elementlerde blur + low-opacity bg + border
3. **Generous spacing**: Section arası 100-120px padding
4. **Cinematic scroll**: Her section scroll-triggered animasyon ile reveal
5. **Hero impact**: Full-viewport, gradient mesh + bold tipografi
6. **Minimal but powerful**: Az element, güçlü kontrastlar
7. **3D/depth**: Globe veya particle efektleri arka planda subtle
