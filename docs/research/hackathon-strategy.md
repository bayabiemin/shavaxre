# Sha(vax)re — Hackathon Kazanma Stratejisi
## Avalanche Build Games 2026

---

## Mevcut Durum Analizi

### Elimizde Ne Var?
- ✅ Smart contract (Fuji'de deploy edilmiş)
- ✅ Kampanya oluşturma / bağış / claim fonksiyonları
- ✅ Corporate matching pool mekanizması
- ✅ Cinematic frontend (V2)
- ✅ Wallet bağlantısı (MetaMask/Core)

### Neyimiz Eksik? (Jüri Gözüyle)
- ❌ Kullanıcı bir kampanyayı neden güvensin? — Doğrulama yok
- ❌ Bağış yaptıktan sonra ne oluyor? — Takip mekanizması yok
- ❌ Öğrenci gerçekten öğrenci mi? — Kimlik doğrulama yok
- ❌ Kampanya sahibi parayı alıp kaçarsa? — Milestone/escrow yok
- ❌ Topluluk etkileşimi yok — Sadece para gönder, o kadar
- ❌ Dashboard yok — Bağışçı ve öğrenci ne görüyor?
- ❌ Avalanche'a özgü özellik yok — Herhangi bir EVM chain'de çalışır
- ❌ Mobil uyumluluk zayıf olabilir

---

## ÖNCELİK SIRASI — Ne Eklenmeli?

### 🔴 KRİTİK (Hackathon'da fark yaratacak)

#### 1. Milestone-Based Funding (Smart Contract)
**Neden**: Jüri "fonlar bir anda mı gidiyor?" diye soracak. Milestone sistemi güven inşa eder.
**Nasıl**: Kampanyalar 3 milestone'a bölünsün. Her milestone'da fonların %33'ü serbest kalsın.
- Milestone 1: Kampanya %33 hedefe ulaşınca → ilk ödeme
- Milestone 2: Öğrenci progress proof yüklediğinde → ikinci ödeme
- Milestone 3: Kampanya tamamlandığında → son ödeme
- Bağışçılar oylama ile milestone'u onaylıyor

**Contract değişikliği**: `Campaign` struct'ına `milestoneCount`, `currentMilestone`, `milestoneApprovals` ekle

#### 2. Bağışçı Dashboard Sayfası
**Neden**: Bağış yapan kişi "param nereye gitti?" diye merak ediyor.
**Sayfa**: `/dashboard`
- Toplam bağış miktarım
- Desteklediğim kampanyalar listesi
- Her kampanyanın durumu (progress, milestone)
- Transaction geçmişi (Snowtrace linkleri ile)
- "Impact Score" — kaç öğrenciye yardım ettin

#### 3. Kampanya Detay Sayfası İyileştirmesi
**Mevcut**: Basit bağış formu
**Olması gereken**:
- Kampanya hikayesi (zengin metin)
- Progress timeline (milestone göstergesi)
- Bağışçı listesi (anonim/açık seçeneği ile)
- Sosyal paylaşım butonları
- Benzer kampanyalar önerisi
- Transaction log (on-chain proof)

#### 4. "Powered by Avalanche" Entegrasyonu
**Neden**: Bu bir Avalanche hackathon'u — Avalanche'a özgü avantajları göstermelisin.
**Eklenecekler**:
- Sub-second finality göstergesi (bağış yapıldığında "Confirmed in 0.8s" gibi)
- Gas fee karşılaştırması (Ethereum'da bu bağış $3.50 gas, Avalanche'da $0.02)
- Snowtrace entegrasyonu — her işlemin explorer linki
- "Why Avalanche?" sayfası veya section'ı

---

### 🟡 ÖNEMLİ (Projeyi olgunlaştıracak)

#### 5. Kampanya Kategorileri & Filtreleme
- Tuition, Books, Research, Equipment, Scholarship
- Filtreleme: Kategori, miktar aralığı, süre
- Sıralama: En yeni, en çok bağış, yaklaşan deadline

#### 6. Öğrenci Profil Sayfası
- `/student/[address]`
- Öğrencinin tüm kampanyaları
- Toplam toplanan miktar
- Başarı oranı (kaç kampanya hedefe ulaştı)
- On-chain reputation badge fikri

#### 7. Arama Fonksiyonu
- Kampanya ismi/açıklamada arama
- Navbar'a search ikonu ekle
- Debounced search, anlık sonuçlar

#### 8. Responsive & PWA
- Mobile-first responsive kontrol
- PWA manifest (telefona add to home screen)
- Touch-friendly butonlar (44px min)

---

### 🟢 BONUS (Demo'da "wow" efekti yaratacak)

#### 9. Canlı Bağış Bildirimi
- WebSocket veya polling ile yeni bağış geldiğinde toast notification
- "🎉 0x3f...a2b1 just donated 0.5 AVAX to 'Avalanche Web3 Bootcamp'"
- Ana sayfada son bağışlar ticker'ı (marquee efekti)

#### 10. Leaderboard
- Top bağışçılar listesi (haftalık/aylık/tüm zamanlar)
- Top kampanyalar (en çok bağış alan)
- Gamification: "Top Donor This Week" badge

#### 11. Share & Embed
- Kampanya sayfasını Twitter/LinkedIn'de paylaşma
- Open Graph meta tags (paylaşınca güzel görünsün)
- Embed widget kodu (harici sitelere kampanya kartı embed)

#### 12. Dark/Light Mode Toggle
- Şu an dark-only — light mode opsiyonu ekle
- CSS variables zaten var, sadece toggle mekanizması lazım

---

## UYGULAMA PLANI — 2 Haftalık Sprint

### Hafta 1: Core Features
| Gün | Görev | Kim |
|-----|-------|-----|
| 1-2 | Milestone-based funding contract yazımı + test | Code (Solidity) |
| 3 | Contract deploy (Fuji) + ABI güncelle | Code |
| 4-5 | Dashboard sayfası frontend | Code |
| 6 | Kampanya detay iyileştirmesi | Code |
| 7 | Avalanche entegrasyonları (finality, gas) | Code |

### Hafta 2: Polish & Demo
| Gün | Görev | Kim |
|-----|-------|-----|
| 1 | Kategoriler + filtreleme | Code |
| 2 | Öğrenci profil sayfası | Code |
| 3 | Canlı bildirimler + leaderboard | Code |
| 4 | Responsive fine-tuning + testing | Code + Cowork |
| 5 | Open Graph + sosyal paylaşım | Cowork |
| 6 | Demo video + sunum hazırlığı | Cowork |
| 7 | Son test + bug fix + deploy mainnet? | Code |

---

## DEMODAKİ HİKAYE

Jüriye anlatılacak senaryo:

> "Selam, ben Ayşe. İstanbul'da bilgisayar mühendisliği okuyorum ama ailem harç paramı ödeyemiyor.
> Sha(vax)re'de bir kampanya açtım. 5 AVAX hedefledim — kitap ve laboratuvar masraflarım için.
>
> 3 gün içinde 12 kişi bağış yaptı. Biri corporate sponsor — bağışları 2x match etti.
> Her milestone'da ilerleme fotoğrafımı paylaştım. Bağışçılar onayladı.
>
> Toplam 7.2 AVAX toplandı. Sıfır komisyon. Sıfır aracı. 0.8 saniyede onay.
> Ethereum'da aynı işlem $3.50 gas olurdu. Avalanche'da $0.02.
>
> Sha(vax)re: Where blockchain meets education."

---

## TEKNİK KARAR: İlk Ne Yapılmalı?

**Önerim: Sırayla şu 3 şeye odaklan:**

1. **Dashboard sayfası** (frontend-only, contract değişikliği gerektirmez)
2. **Kampanya detay iyileştirmesi** (frontend-only)
3. **Milestone sistemi** (contract + frontend, en büyük iş)

İlk ikisi tamamen frontend çalışması — Claude Code'da hızlıca yapılır.
Milestone sistemi contract upgrade gerektiriyor — bu daha kritik karar.
