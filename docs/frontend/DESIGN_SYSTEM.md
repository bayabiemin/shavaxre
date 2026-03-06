# Sha(vax)re Design System

## Renk Paleti
| Token | Değer | Kullanım |
|-------|-------|----------|
| --avax-red | #E84142 | Primary CTA, gradient, vurgular |
| --avax-dark-red | #c13435 | Hover state'leri |
| --bg-primary | #0a0a0f | Ana arka plan |
| --bg-secondary | #111118 | Footer, secondary areas |
| --bg-card | #16161f | Kart arka planları |
| --text-primary | #f0f0f5 | Ana metin |
| --text-secondary | #9a9ab0 | Açıklama metinleri |
| --text-muted | #5a5a70 | Soluk bilgi metinleri |

## Tipografi
- Font: Inter (300-900 weight)
- Hero title: clamp(2.5rem, 6vw, 4.5rem), weight 900
- Section title: 2rem, weight 800
- Body: 0.95rem, weight 400
- Monospace: system monospace (wallet adresleri)

## Border Radius
- sm: 8px (butonlar, input'lar)
- md: 12px (küçük kartlar)
- lg: 16px (ana kartlar)
- xl: 24px (CTA container)

## Animasyonlar
- Scroll reveal: cubic-bezier(0.16, 1, 0.3, 1)
- Hover transitions: 0.2s-0.3s ease
- Globe: continuous rotation + mouse parallax
- Reduced motion desteği zorunlu

## Component Yapısı
Her component kendi CSS class'larını `globals.css` içinde tutar.
Tailwind kullanılmaz — custom CSS utility system.
