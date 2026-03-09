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
  "hero.launch":    { en: "Launch Campaign →", tr: "Kampanya Başlat →" },
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
  "cta.create":     { en: "Create Campaign →",  tr: "Kampanya Oluştur →" },
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
  "deck.createCta":  { en: "Create Campaign →",      tr: "Kampanya Oluştur →" },
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
  "card.confirming": { en: "Confirm in wallet...",  tr: "Cüzdanda onayla..." },
  "card.onChain":    { en: "Confirming on-chain...", tr: "Zincirde onaylanıyor..." },

  // Common
  "common.connectWallet": { en: "Connect Wallet", tr: "Cüzdan Bağla" },
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
