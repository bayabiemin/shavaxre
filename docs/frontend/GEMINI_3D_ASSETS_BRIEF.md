# Sha(vax)re — 3D Görsel Asset Brief (Gemini)

> Bu brief'i Gemini'ye ver. Her asset için ayrı ayrı üretsin.
> Tüm görseller koyu arka plan üzerinde çalışacak (#000000).
> Ana renk paleti: Siyah + Kırmızı (#E84142) + Beyaz

---

## Asset 1: Open Graph Image (og-image.png)
**Boyut**: 1200 x 630px
**Kullanım**: Twitter/LinkedIn'de paylaşılınca görünecek

**Tarif**:
- Koyu siyah arka plan
- Sol tarafta "Sha(vax)re" logosu/yazısı (büyük, beyaz, Space Grotesk bold)
- Altında: "Fund Education on Avalanche" (küçük, kırmızı)
- Sağ tarafta: 3D stilize dünya küresi veya mezuniyet şapkası, kırmızı neon glow efekti
- Genel his: Premium, dark, Web3 estetiği
- Avalanche logosu küçük olarak sağ alt köşede

---

## Asset 2: Kategori İkonları (6 adet, SVG veya PNG)
**Boyut**: 64 x 64px her biri (veya SVG scalable)
**Kullanım**: Kampanya kartlarında ve filtreleme butonlarında

**İkonlar** (3D isometric tarzda, kırmızı accent ile):
1. **Tuition** — 3D mezuniyet şapkası (mortarboard)
2. **Books** — 3D kitap yığını
3. **Research** — 3D mikroskop veya beaker
4. **Equipment** — 3D laptop
5. **Scholarship** — 3D madalya/ödül
6. **General** — 3D yıldız veya kalp

**Stil**:
- Koyu arka plana uyumlu (transparent bg veya #000)
- Ana renk: Beyaz gövde + #E84142 kırmızı accent/glow
- İnce, modern, minimal 3D (flat-3D hybrid)
- Her ikonda subtle kırmızı neon glow alttan veya yandan

---

## Asset 3: Hero İllüstrasyonu (opsiyonel)
**Boyut**: 800 x 800px, transparent bg
**Kullanım**: Hero section sağ tarafı veya arka plan olarak

**Seçenek A — 3D Globe**:
- Siyah-transparan dünya küresi
- Kıtalar kırmızı neon çizgilerle (wireframe)
- Eğitim merkezleri arasında kırmızı bağlantı çizgileri
- Altta kırmızı neon reflection/glow

**Seçenek B — 3D Blockchain Blokları**:
- Bağlı bloklar zinciri, isometric görünüm
- Blokların içinde: mezuniyet şapkası, kitap, AVAX sembolü
- Kırmızı neon kenarlar, koyu cam efekti (glass morphism 3D)

**Seçenek C — 3D Mezuniyet Şapkası + AVAX**:
- Dev 3D mezuniyet şapkası
- Üzerinden Avalanche kırmızı partiküller yükseliyor
- Şapkanın ipi ucunda AVAX sembolü
- Sinematik ışıklandırma (rim light kırmızı, key light beyaz)

---

## Asset 4: "How It Works" Adım İllüstrasyonları (3 adet)
**Boyut**: 200 x 200px her biri
**Kullanım**: How It Works bölümündeki 3 adım kartı

1. **Create (001)** — 3D el/parmak tablet ekranına dokunuyor, ekranda form
2. **Donate (002)** — 3D AVAX coin'i bir cüzdandan diğerine uçuyor
3. **Impact (003)** — 3D öğrenci mezuniyet şapkasını havaya fırlatıyor

**Stil**: Line-art + kırmızı neon accent hibrit
- Çizgiler beyaz, ince (2px)
- Accent noktalar ve glow efektleri kırmızı (#E84142)
- Transparent arka plan

---

## Asset 5: Dashboard İkon Seti (4 adet)
**Boyut**: 48 x 48px
**Kullanım**: Dashboard istatistik kartlarının üstünde

1. **Total Donated** — 3D AVAX coin stack
2. **Campaigns Supported** — 3D kalp + sayı
3. **Impact Score** — 3D yıldız/rozet
4. **Avg Donation** — 3D grafik çubuğu

**Stil**: Aynı isometric 3D, kırmızı accent

---

## Asset 6: Empty State İllüstrasyonu
**Boyut**: 300 x 300px
**Kullanım**: Kampanya yokken veya sonuç bulunamadığında

**Tarif**: Boş bir kutu/klasör + küçük kırmızı soru işareti
- Minimal, sevimli ama profesyonel
- "Nothing here yet" hissi

---

## Teslim Formatı

Tüm görselleri şu isimlendirme ile kaydet:
```
public/
├── og-image.png                    (1200x630)
├── icons/
│   ├── category-tuition.svg        (64x64)
│   ├── category-books.svg
│   ├── category-research.svg
│   ├── category-equipment.svg
│   ├── category-scholarship.svg
│   └── category-general.svg
├── illustrations/
│   ├── hero-illustration.png       (800x800, transparent)
│   ├── step-create.png             (200x200, transparent)
│   ├── step-donate.png
│   ├── step-impact.png
│   └── empty-state.png             (300x300, transparent)
└── dashboard/
    ├── stat-donated.svg            (48x48)
    ├── stat-campaigns.svg
    ├── stat-impact.svg
    └── stat-average.svg
```
