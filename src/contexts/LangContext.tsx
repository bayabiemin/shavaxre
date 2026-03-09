"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Lang = "tr" | "en";

/* ────────────────────────────────────────────
   Translation dictionary — all UI strings
   ──────────────────────────────────────────── */
const dict = {
  // Navbar
  "nav.home":       { en: "Home",       tr: "Ana Sayfa" },
  "nav.campaigns":  { en: "Campaigns",  tr: "Kampanyalar" },
  "nav.create":     { en: "Create",     tr: "Oluştur" },
  "nav.dashboard":  { en: "Dashboard",  tr: "Panel" },
  "nav.connect":    { en: "Connect Wallet", tr: "Cüzdan Bağla" },

  // Hero
  "hero.label":     { en: "AVALANCHE BUILD GAMES 2026", tr: "AVALANCHE BUILD GAMES 2026" },
  "hero.title1":    { en: "Education Funding,",          tr: "Eğitim Fonlaması," },
  "hero.title2":    { en: "Reinvented.",                  tr: "Yeniden Keşfedildi." },
  "hero.subtitle":  {
    en: "Swipe to discover student campaigns. Donate directly on Avalanche. Zero fees. Full transparency. DAO-verified milestones.",
    tr: "Öğrenci kampanyalarını keşfet. Avalanche üzerinde doğrudan bağış yap. Sıfır komisyon. Tam şeffaflık. DAO onaylı kilometre taşları.",
  },
  "hero.launch":    { en: "Launch Campaign", tr: "Kampanya Başlat" },
  "hero.explore":   { en: "Explore ↓",         tr: "Keşfet ↓" },
  "hero.fee":       { en: "fee",               tr: "komisyon" },

  // Stats
  "stats.campaigns":  { en: "Total Campaigns",  tr: "Toplam Kampanya" },
  "stats.donated":    { en: "AVAX Donated",      tr: "Bağışlanan AVAX" },
  "stats.donors":     { en: "Unique Donors",     tr: "Tekil Bağışçı" },
  "stats.fee":        { en: "Platform Fee",      tr: "Platform Komisyonu" },

  // Swipe section
  "swipe.label":    { en: "DISCOVER",     tr: "KEŞFET" },
  "swipe.title":    { en: "Swipe. Like.", tr: "Kaydır. Beğen." },
  "swipe.titleAccent": { en: "Fund.",     tr: "Fonla." },
  "swipe.sub":      {
    en: "Discover student campaigns. Swipe right to boost, tap to donate directly.",
    tr: "Öğrenci kampanyalarını keşfet. Sağa kaydırarak destekle, dokunarak bağış yap.",
  },

  // How it works
  "how.label":      { en: "HOW IT WORKS", tr: "NASIL ÇALIŞIR" },
  "how.title":      { en: "Three steps to", tr: "Şeffaf fonlamaya" },
  "how.titleAccent": { en: "transparent", tr: "üç adımda" },
  "how.titleEnd":   { en: "funding",     tr: "ulaş" },
  "how.step1.title": { en: "Create",     tr: "Oluştur" },
  "how.step1.desc": {
    en: "Stake 0.1 AVAX as trust collateral. Upload your campaign with AI-verified content.",
    tr: "Güven teminatı olarak 0.1 AVAX stake et. Kampanyanı AI doğrulamalı içerikle yükle.",
  },
  "how.step2.title": { en: "Fund",       tr: "Fonla" },
  "how.step2.desc": {
    en: "Donors swipe right to like, tap to donate. Funds flow directly — zero intermediaries.",
    tr: "Bağışçılar sağa kaydırarak beğenir, dokunarak bağış yapar. Fonlar doğrudan akar — sıfır aracı.",
  },
  "how.step3.title": { en: "Release",    tr: "Serbest Bırak" },
  "how.step3.desc": {
    en: "65% unlocks at goal. Submit proof, donors vote, remaining 35% releases on approval.",
    tr: "Hedefe ulaşınca %65 açılır. Kanıt sun, bağışçılar oylasın, kalan %35 onay ile serbest kalır.",
  },

  // Comparison
  "cmp.label":      { en: "WHY SHA(VAX)RE", tr: "NEDEN SHA(VAX)RE" },
  "cmp.title":      { en: "Built different.", tr: "Farklı inşa edildi." },
  "cmp.titleAccent": { en: "Verified on-chain.", tr: "Zincir üzerinde doğrulanmış." },
  "cmp.sub":        {
    en: "Traditional platforms take fees and offer no accountability. We put every transaction on Avalanche — verifiable, permanent, trustless.",
    tr: "Geleneksel platformlar komisyon alır ve hesap verebilirlik sunmaz. Her işlemi Avalanche'a koyuyoruz — doğrulanabilir, kalıcı, güvensiz ortama gerek yok.",
  },
  "cmp.feature":      { en: "Feature",          tr: "Özellik" },
  "cmp.platformFee":  { en: "Platform Fee",     tr: "Platform Komisyonu" },
  "cmp.fundRelease":  { en: "Fund Release",     tr: "Fon Dağıtımı" },
  "cmp.accountability": { en: "Accountability", tr: "Hesap Verebilirlik" },
  "cmp.transparency": { en: "Transparency",     tr: "Şeffaflık" },
  "cmp.instant":     { en: "Instant",           tr: "Anında" },
  "cmp.allOrNothing": { en: "All-or-nothing",   tr: "Ya hep ya hiç" },
  "cmp.milestone":   { en: "65/35 Milestone",   tr: "65/35 Kilometre Taşı" },
  "cmp.none":        { en: "None",              tr: "Yok" },
  "cmp.honorSystem": { en: "Honor system",      tr: "Güven sistemi" },
  "cmp.daoVote":     { en: "DAO Vote",          tr: "DAO Oylama" },
  "cmp.opaque":      { en: "Opaque",            tr: "Opak" },
  "cmp.limited":     { en: "Limited",           tr: "Sınırlı" },
  "cmp.onChain":     { en: "On-Chain",          tr: "Zincir Üstü" },

  // CTA
  "cta.title":      { en: "Ready to make a difference?", tr: "Fark yaratmaya hazır mısın?" },
  "cta.sub":        {
    en: "Launch your campaign or start supporting students today. Every AVAX counts.",
    tr: "Kampanyanı başlat ya da bugün öğrencilere destek olmaya başla. Her AVAX önemli.",
  },
  "cta.create":     { en: "Create Campaign",  tr: "Kampanya Oluştur" },
  "cta.browse":     { en: "Browse Campaigns",   tr: "Kampanyalara Göz At" },

  // Footer
  "footer.tagline": {
    en: "Decentralized education funding on Avalanche.\nTransparent. Trustless. Direct.",
    tr: "Avalanche üzerinde merkeziyetsiz eğitim fonlaması.\nŞeffaf. Güvensiz ortama gerek yok. Doğrudan.",
  },
  "footer.platform":  { en: "Platform",          tr: "Platform" },
  "footer.browse":    { en: "Browse Campaigns",  tr: "Kampanyalara Göz At" },
  "footer.create":    { en: "Create Campaign",   tr: "Kampanya Oluştur" },
  "footer.onChain":   { en: "On-Chain",          tr: "Zincir Üstü" },
  "footer.builtOn":   { en: "Built on Avalanche · Fuji Testnet", tr: "Avalanche · Fuji Testnet üzerine inşa edildi" },

  // SwipeDeck
  "deck.loading":    { en: "Loading campaigns...",   tr: "Kampanyalar yükleniyor..." },
  "deck.empty":      { en: "No campaigns yet",       tr: "Henüz kampanya yok" },
  "deck.emptyDesc":  { en: "Be the first to ignite!", tr: "İlk ateşi sen yak!" },
  "deck.createCta":  { en: "Create Campaign",      tr: "Kampanya Oluştur" },
  "deck.done":       { en: "You've seen them all!",   tr: "Hepsini gördün!" },
  "deck.doneDesc":   { en: "Check back when new campaigns arrive", tr: "Yeni kampanyalar geldiğinde tekrar bak" },
  "deck.restart":    { en: "Start Over",              tr: "Baştan Başla" },

  // SwipeCard
  "card.like":       { en: "LIKE",  tr: "BEĞENDİM" },
  "card.nope":       { en: "NOPE",  tr: "GEÇ" },
  "card.trending":   { en: "TRENDING", tr: "TREND" },
  "card.likes":      { en: "likes",    tr: "beğeni" },
  "card.donors":     { en: "donors",   tr: "bağışçı" },
  "card.donate":     { en: "Quick Donate", tr: "Hızlı Bağış" },
  "card.walletFirst": { en: "Connect wallet first", tr: "Önce cüzdan bağla" },
  "card.alreadyLiked": { en: "Already liked", tr: "Zaten beğendin" },
  "card.confirming": { en: "Confirm in wallet...",  tr: "Cüzdanda onayla..." },
  "card.onChain":    { en: "Confirming on-chain...", tr: "Zincirde onaylanıyor..." },

  // Banner
  "banner.zeroFee":   { en: "ZERO FEES",        tr: "SIFIR KOMİSYON" },
  "banner.onChain":   { en: "ON-CHAIN",          tr: "ZİNCİR ÜSTÜ" },
  "banner.directP2P": { en: "DIRECT P2P",        tr: "DOĞRUDAN P2P" },
  "banner.avalanche": { en: "BUILT ON AVALANCHE", tr: "AVALANCHE ÜZERİNDE" },

  // Comparison — hardcoded platform values
  "cmp.gfmFee":       { en: "2.9% + 30¢",  tr: "2.9% + 30¢" },
  "cmp.ksFee":        { en: "5% + fees",    tr: "%5 + ücret" },
  "cmp.shavaxreFee":  { en: "0%",           tr: "%0" },

  // Common
  "common.connectWallet": { en: "Connect Wallet", tr: "Cüzdan Bağla" },
  "common.loading": { en: "Loading...", tr: "Yükleniyor..." },
  "common.browseCampaigns": { en: "Browse Campaigns", tr: "Kampanyalara Göz At" },
  "common.viewOnSnowtrace": { en: "View on Snowtrace ↗", tr: "Snowtrace'de Görüntüle ↗" },
  "common.viewAllSnowtrace": { en: "View all on Snowtrace ↗", tr: "Tümünü Snowtrace'de Gör ↗" },
  "common.campaign": { en: "Campaign", tr: "Kampanya" },
  "common.active": { en: "Active", tr: "Aktif" },
  "common.view": { en: "View →", tr: "Görüntüle →" },

  // Campaign Detail
  "detail.loading": { en: "Loading campaign from blockchain...", tr: "Kampanya blokzincirden yükleniyor..." },
  "detail.notFound": { en: "Campaign Not Found", tr: "Kampanya Bulunamadı" },
  "detail.notFoundDesc": { en: "This campaign doesn't exist or has been removed.", tr: "Bu kampanya mevcut değil veya kaldırılmış." },
  "detail.back": { en: "← Back to Campaigns", tr: "← Kampanyalara Dön" },
  "detail.createdBy": { en: "Created by", tr: "Oluşturan" },
  "detail.stats": { en: "Campaign Stats", tr: "Kampanya İstatistikleri" },
  "detail.donors": { en: "Donors", tr: "Bağışçılar" },
  "detail.avgDonation": { en: "Avg Donation", tr: "Ort. Bağış" },
  "detail.likes": { en: "Likes", tr: "Beğeniler" },
  "detail.progress": { en: "Progress", tr: "İlerleme" },
  "detail.transparency": { en: "On-Chain Transparency", tr: "Zincir Üstü Şeffaflık" },
  "detail.contract": { en: "Contract", tr: "Sözleşme" },
  "detail.network": { en: "Network", tr: "Ağ" },
  "detail.commission": { en: "Commission", tr: "Komisyon" },
  "detail.commissionVal": { en: "0% — Direct P2P", tr: "%0 — Doğrudan P2P" },
  "detail.campaignId": { en: "Campaign ID", tr: "Kampanya ID" },
  "detail.recentDonations": { en: "Recent Donations", tr: "Son Bağışlar" },
  "detail.share": { en: "Share This Campaign", tr: "Bu Kampanyayı Paylaş" },
  "detail.copied": { en: "Copied!", tr: "Kopyalandı!" },
  "detail.copyLink": { en: "Copy Link", tr: "Bağlantıyı Kopyala" },
  "detail.donorCount": { en: "donors", tr: "bağışçı" },
  "detail.funded": { en: "funded", tr: "fonlandı" },
  "detail.thankYou": { en: "Thank you!", tr: "Teşekkürler!" },
  "detail.donationConfirmed": { en: "Your donation is confirmed on Avalanche.", tr: "Bağışın Avalanche üzerinde onaylandı." },
  "detail.viewTx": { en: "View tx on Snowtrace ↗", tr: "İşlemi Snowtrace'de Gör ↗" },
  "detail.donationAmount": { en: "Donation Amount (AVAX)", tr: "Bağış Miktarı (AVAX)" },
  "detail.connectToDonate": { en: "Connect Wallet to Donate", tr: "Bağış İçin Cüzdan Bağla" },
  "detail.confirmWallet": { en: "Confirm in wallet...", tr: "Cüzdanda onayla..." },
  "detail.confirmChain": { en: "Confirming on-chain...", tr: "Zincirde onaylanıyor..." },
  "detail.donateBtn": { en: "Donate", tr: "Bağış Yap" },
  "detail.donateNote": { en: "Funds go directly to the smart contract. Zero fees. Fully transparent.", tr: "Fonlar doğrudan akıllı sözleşmeye gider. Sıfır komisyon. Tam şeffaflık." },
  "detail.campaignEnded": { en: "This campaign is", tr: "Bu kampanya" },
  "detail.campaignCompleted": { en: "Campaign completed successfully.", tr: "Kampanya başarıyla tamamlandı." },
  "detail.of": { en: "of", tr: "/" },

  // Campaigns List
  "campaigns.label": { en: "Browse Campaigns", tr: "Kampanyalara Göz At" },
  "campaigns.title": { en: "Active Campaigns", tr: "Aktif Kampanyalar" },
  "campaigns.subtitle": { en: "Browse verified student campaigns and donate AVAX directly — zero middlemen.", tr: "Doğrulanmış öğrenci kampanyalarına göz at ve doğrudan AVAX bağışla — sıfır aracı." },
  "campaigns.create": { en: "+ Create Campaign", tr: "+ Kampanya Oluştur" },
  "campaigns.sortNewest": { en: "Sort: Newest", tr: "Sırala: En Yeni" },
  "campaigns.sortFunded": { en: "Sort: Most Funded", tr: "Sırala: En Çok Fonlanan" },
  "campaigns.sortDonors": { en: "Sort: Most Donors", tr: "Sırala: En Çok Bağışçı" },
  "campaigns.loading": { en: "Loading campaigns from blockchain...", tr: "Kampanyalar blokzincirden yükleniyor..." },
  "campaigns.error": { en: "Could not load campaigns from blockchain.", tr: "Kampanyalar blokzincirden yüklenemedi." },
  "campaigns.empty": { en: "No campaigns found.", tr: "Kampanya bulunamadı." },
  "campaigns.beFirst": { en: "Be the first!", tr: "İlk sen ol!" },
  "campaigns.count": { en: "campaign", tr: "kampanya" },
  "campaigns.countPlural": { en: "campaigns", tr: "kampanya" },

  // Dashboard
  "dash.connectTitle": { en: "Connect Your Wallet", tr: "Cüzdanını Bağla" },
  "dash.connectDesc": { en: "Connect your wallet to view your donation history and impact score.", tr: "Bağış geçmişini ve etki puanını görmek için cüzdanını bağla." },
  "dash.loading": { en: "Loading your dashboard from blockchain...", tr: "Panelin blokzincirden yükleniyor..." },
  "dash.title": { en: "My Dashboard", tr: "Panelim" },
  "dash.impact": { en: "Your Impact", tr: "Etkin" },
  "dash.totalDonated": { en: "Total Donated", tr: "Toplam Bağış" },
  "dash.campaignsSupported": { en: "Campaigns Supported", tr: "Desteklenen Kampanyalar" },
  "dash.campaignsUnit": { en: "campaigns", tr: "kampanya" },
  "dash.impactScore": { en: "Impact Score", tr: "Etki Puanı" },
  "dash.pts": { en: "pts", tr: "puan" },
  "dash.avgDonation": { en: "Avg Donation", tr: "Ort. Bağış" },
  "dash.supported": { en: "Supported Campaigns", tr: "Desteklenen Kampanyalar" },
  "dash.noDonations": { en: "You haven't donated to any campaigns yet.", tr: "Henüz hiçbir kampanyaya bağış yapmadın." },
  "dash.colCampaign": { en: "Campaign", tr: "Kampanya" },
  "dash.colStatus": { en: "Status", tr: "Durum" },
  "dash.colDonation": { en: "My Donation", tr: "Bağışım" },
  "dash.recentTx": { en: "Recent Transactions", tr: "Son İşlemler" },

  // Create
  "create.title": { en: "Create Campaign", tr: "Kampanya Oluştur" },
  "create.subtitle": { en: "Tell your story, upload your image, link your social accounts and prove your credibility. Your campaign will be written on-chain. 0.1 AVAX stake required.", tr: "Hikayeni anlat, görselini yükle, sosyal hesaplarını bağlayıp güvenilirliğini kanıtla. Kampanyan zincir üstüne yazılacak. 0.1 AVAX stake gerekli." },
  "create.image": { en: "Campaign Image", tr: "Kampanya Görseli" },
  "create.imageClick": { en: "Click to upload image", tr: "Görsel yüklemek için tıkla" },
  "create.imageFormats": { en: "JPG, PNG, WebP — Max 5MB — Auto-scanned by AI", tr: "JPG, PNG, WebP — Maks 5MB — AI ile otomatik taranacak" },
  "create.imageTooLarge": { en: "File size exceeds 5MB", tr: "Dosya boyutu 5MB'dan büyük" },
  "create.imageOnlyImages": { en: "Only image files can be uploaded", tr: "Sadece resim dosyaları yüklenebilir" },
  "create.moderating": { en: "AI scanning...", tr: "AI taraması yapılıyor..." },
  "create.aiApproved": { en: "AI Approved", tr: "AI Onayladı" },
  "create.moderationFail": { en: "Moderation service not responding", tr: "Moderasyon servisi yanıtlamıyor" },
  "create.imageRejected": { en: "Image rejected:", tr: "Görsel reddedildi:" },
  "create.nsfwDetected": { en: "NSFW / violence content detected", tr: "NSFW / şiddet içeriği tespit edildi" },
  "create.campaignTitle": { en: "Campaign Title", tr: "Kampanya Başlığı" },
  "create.titlePlaceholder": { en: "e.g: \"Need tuition help\" or \"Final year CS student\"", tr: "örn: \"Sanayiye çekmem lazım\" veya \"Son sınıf bilgisayar mühendisliği\"" },
  "create.description": { en: "Description", tr: "Açıklama" },
  "create.descPlaceholder": { en: "Briefly explain what you'll use the funds for...", tr: "Fonları ne için kullanacağını kısa ve net anlat..." },
  "create.category": { en: "Category", tr: "Kategori" },
  "create.goal": { en: "Goal (AVAX)", tr: "Hedef (AVAX)" },
  "create.socialKyc": { en: "Social KYC", tr: "Sosyal KYC" },
  "create.socialOptional": { en: "(optional — increases credibility)", tr: "(opsiyonel — güvenilirliğini artırır)" },
  "create.socialDesc": { en: "Link your social accounts so donors can verify you. Will appear on your card.", tr: "Sosyal hesaplarını bağlayarak bağışçılar seni doğrulayabilir. Kartında görünecek." },
  "create.twitterPlaceholder": { en: "https://x.com/yourusername", tr: "https://x.com/kullanıcıadın" },
  "create.instagramPlaceholder": { en: "https://instagram.com/yourusername", tr: "https://instagram.com/kullanıcıadın" },
  "create.livePlaceholder": { en: "Live stream link (Twitch, YouTube, etc.)", tr: "Canlı yayın linki (Twitch, YouTube, vb.)" },
  "create.infoZeroFee": { en: "Zero Commission", tr: "Sıfır Komisyon" },
  "create.infoZeroFeeDesc": { en: "100% of donations go directly to your wallet", tr: "Bağışların %100'ü direkt cüzdanına" },
  "create.infoOnChain": { en: "On-Chain", tr: "Zincir Üstü" },
  "create.infoOnChainDesc": { en: "Your campaign will be permanently written to Avalanche", tr: "Kampanyan kalıcı olarak Avalanche'a yazılacak" },
  "create.infoStake": { en: "Stake", tr: "Stake" },
  "create.infoStakeDesc": { en: "0.1 AVAX stake (refunded after successful proof + vote)", tr: "0.1 AVAX stake (başarılı kanıt + oylama sonrası iade)" },
  "create.infoAI": { en: "AI Filter", tr: "AI Filtre" },
  "create.infoAIDesc": { en: "Images are automatically scanned for inappropriate content", tr: "Görseller uygunsuz içerik için otomatik taranır" },
  "create.connectWallet": { en: "Connect Wallet", tr: "Cüzdanı Bağla" },
  "create.confirmWallet": { en: "Confirm in wallet...", tr: "Cüzdanda onayla..." },
  "create.writingChain": { en: "Writing to chain...", tr: "Zincire yazılıyor..." },
  "create.waitingAI": { en: "Waiting for AI scan...", tr: "AI taraması bekleniyor..." },
  "create.submitBtn": { en: "Create Campaign (0.1 AVAX stake)", tr: "Kampanya Oluştur (0.1 AVAX stake)" },
  "create.successTitle": { en: "Campaign Created!", tr: "Kampanya Oluşturuldu!" },
  "create.successDesc": { en: "Your campaign is now live on Avalanche. It will appear in the swipe feed.", tr: "Kampanyan artık Avalanche'da yayında. Swipe feed'de görünecek." },
  "create.successStake": { en: "0.1 AVAX stake deposited. Will be refunded after successful proof + vote.", tr: "0.1 AVAX stake yatırıldı. Başarılı kanıt + oylamadan sonra iade edilecek." },
  "create.backToFeed": { en: "Back to Swipe Feed", tr: "Swipe Feed'e Dön" },
  "create.allCampaigns": { en: "All Campaigns", tr: "Tüm Kampanyalar" },

  // CampaignCard
  "campaignCard.by": { en: "by", tr: "tarafından" },
  "campaignCard.donor": { en: "donor", tr: "bağışçı" },
  "campaignCard.donors": { en: "donors", tr: "bağışçı" },
  "campaignCard.donateNow": { en: "Donate Now →", tr: "Şimdi Bağışla →" },

  // SwipeCard — manual donate
  "card.customPlaceholder": { en: "Enter amount...", tr: "Miktar gir..." },
  "card.customSend": { en: "Send", tr: "Gönder" },
  "card.confirmBig": { en: "This is a large donation. Are you sure?", tr: "Bu büyük bir bağış. Emin misin?" },
  "card.confirmSend": { en: "Yes, Send", tr: "Evet, Gönder" },
  "card.confirmCancel": { en: "Cancel", tr: "İptal" },

  // Dashboard — Tier
  "tier.label": { en: "IMPACT LEVEL", tr: "ETKİ SEVİYESİ" },
  "tier.seed": { en: "Seed", tr: "Tohum" },
  "tier.sprout": { en: "Sprout", tr: "Filiz" },
  "tier.tree": { en: "Tree", tr: "Ağaç" },
  "tier.forest": { en: "Forest Guardian", tr: "Orman Koruyucusu" },
  "tier.progressTo": { en: "to next tier", tr: "sonraki seviyeye" },
  "tier.maxLevel": { en: "Maximum level reached!", tr: "Maksimum seviyeye ulaştın!" },

  // Dashboard — Achievements
  "achieve.title": { en: "Achievements", tr: "Başarımlar" },
  "achieve.subtitle": { en: "Unlock badges by taking action on-chain.", tr: "Zincir üstü aksiyonlarla rozetler kazan." },
  "achieve.firstDrop.name": { en: "First Drop", tr: "İlk Damla" },
  "achieve.firstDrop.desc": { en: "Made your first donation", tr: "İlk bağışını yaptın" },
  "achieve.diversifier.name": { en: "Diversifier", tr: "Çeşitlendirici" },
  "achieve.diversifier.desc": { en: "Supported 3+ different campaigns", tr: "3+ farklı kampanyaya bağış yaptın" },
  "achieve.whale.name": { en: "Whale", tr: "Balina" },
  "achieve.whale.desc": { en: "Donated 1+ AVAX in a single tx", tr: "Tek seferde 1+ AVAX bağışladın" },
  "achieve.builder.name": { en: "Builder", tr: "İnşaatçı" },
  "achieve.builder.desc": { en: "Created at least 1 campaign", tr: "En az 1 kampanya oluşturdun" },
  "achieve.centurion.name": { en: "Centurion", tr: "Yüzbaşı" },
  "achieve.centurion.desc": { en: "Reached Impact Score 100+", tr: "100+ Etki Puanına ulaştın" },

  // Leaderboard
  "leader.label": { en: "TOP SUPPORTERS", tr: "EN İYİ DESTEKÇILER" },
  "leader.title": { en: "Community", tr: "Topluluk" },
  "leader.titleAccent": { en: "Leaders", tr: "Liderleri" },
  "leader.sub": { en: "Based on recent on-chain activity.", tr: "Son zincir üstü aktiviteye göre." },
  "leader.rank": { en: "#", tr: "#" },
  "leader.wallet": { en: "Wallet", tr: "Cüzdan" },
  "leader.total": { en: "Total", tr: "Toplam" },
  "leader.campaigns": { en: "Campaigns", tr: "Kampanya" },
  "leader.noData": { en: "No activity found in recent blocks.", tr: "Son bloklarda aktivite bulunamadı." },
  "leader.loading": { en: "Loading leaders...", tr: "Liderler yükleniyor..." },
} as const;

type TranslationKey = keyof typeof dict;

interface LangState {
  lang: Lang;
  toggle: () => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangState>({
  lang: "en",
  toggle: () => {},
  t: (key) => key,
});

export const useLang = () => useContext(LangContext);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("shavaxre-lang") as Lang | null;
    if (saved === "tr" || saved === "en") setLang(saved);
  }, []);

  const toggle = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "tr" : "en";
      localStorage.setItem("shavaxre-lang", next);
      return next;
    });
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return dict[key]?.[lang] ?? key;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}
