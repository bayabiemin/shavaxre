"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import { useWallet } from "@/components/WalletProvider";
import { useLang } from "@/contexts/LangContext";
import SwipeDeck from "@/components/SwipeDeck";
import CountUp from "@/components/CountUp";

/* ─── Animation helpers ─── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.8, ease: EASE_OUT },
  },
};

/* ─── Reveal wrapper ─── */
function RevealSection({ children, className = "", delay = 0 }: {
  children: React.ReactNode; className?: string; delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── Step icons ─── */
const STEP_ICONS = ["+", "◆", "→"];

export default function Home() {
  const { isConnected, address } = useWallet();
  const { t } = useLang();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  const COMPARISONS = [
    { feature: t("cmp.platformFee"),  gfm: t("cmp.gfmFee"), kickstarter: t("cmp.ksFee"), shavaxre: t("cmp.shavaxreFee") },
    { feature: t("cmp.fundRelease"),  gfm: t("cmp.instant"), kickstarter: t("cmp.allOrNothing"), shavaxre: t("cmp.milestone") },
    { feature: t("cmp.accountability"), gfm: t("cmp.none"), kickstarter: t("cmp.honorSystem"), shavaxre: t("cmp.daoVote") },
    { feature: t("cmp.transparency"), gfm: t("cmp.opaque"), kickstarter: t("cmp.limited"), shavaxre: t("cmp.onChain") },
  ];

  const STEPS = [
    { num: "01", title: t("how.step1.title"), desc: t("how.step1.desc"), icon: STEP_ICONS[0] },
    { num: "02", title: t("how.step2.title"), desc: t("how.step2.desc"), icon: STEP_ICONS[1] },
    { num: "03", title: t("how.step3.title"), desc: t("how.step3.desc"), icon: STEP_ICONS[2] },
  ];

  const STATS = [
    { label: t("stats.campaigns"), value: 12, suffix: "" },
    { label: t("stats.donated"),   value: 48.5, suffix: " AVAX", decimals: 1 },
    { label: t("stats.donors"),    value: 87, suffix: "" },
    { label: t("stats.fee"),       value: 0, suffix: "%", prefix: "" },
  ];

  const BANNER_ITEMS = [
    t("banner.zeroFee"),
    t("banner.onChain"),
    t("banner.directP2P"),
    t("banner.avalanche"),
  ];

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ══════ HERO — avax-style: centered, massive type ══════ */}
      <section ref={heroRef} className="hero">
        <div className="hero-watermark" aria-hidden="true">SHAVAXRE</div>
        <motion.div
          className="hero-content"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeUp} className="hero-label">
            {t("hero.label")}
          </motion.div>

          <motion.h1 variants={fadeUp} className="hero-title">
            <span className="hero-line">
              <span className="hero-line-inner" style={{ opacity: 1, transform: "none", animation: "none" }}>
                {t("hero.title1")}
              </span>
            </span>
            <span className="hero-line hero-line-accent">
              <span className="hero-line-inner" style={{ opacity: 1, transform: "none", animation: "none", color: "var(--accent)" }}>
                {t("hero.title2")}
              </span>
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="hero-subtitle" style={{ opacity: 1, animation: "none" }}>
            {t("hero.subtitle")}
          </motion.p>

          <motion.div variants={fadeUp} className="hero-bottom" style={{ opacity: 1, animation: "none" }}>
            <div className="hero-actions">
              <Link href="/create" className="btn-primary">
                {t("hero.launch")}
              </Link>
              <a href="#explore" className="btn-secondary">
                {t("hero.explore")}
              </a>
            </div>

            <div className="hero-comparison-bar">
              <div className="hero-cmp-item">
                <span className="hero-cmp-platform">GoFundMe</span>
                <span className="hero-cmp-val hero-cmp-bad">2.9% {t("hero.fee")}</span>
              </div>
              <div className="hero-cmp-vs">VS</div>
              <div className="hero-cmp-item hero-cmp-us">
                <span className="hero-cmp-platform">Sha(vax)re</span>
                <span className="hero-cmp-val hero-cmp-good">0% {t("hero.fee")}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <div className="scroll-indicator-ring">
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
              <circle cx="22" cy="22" r="20" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <circle cx="22" cy="22" r="20" stroke="var(--accent)" strokeWidth="1"
                strokeDasharray="126" strokeDashoffset="126" className="scroll-ring-draw" />
            </svg>
            <span className="scroll-indicator-text">↓</span>
          </div>
        </motion.div>
      </section>

      {/* ══════ SWIPE DECK — hero'dan hemen sonra, ana deneyim ══════ */}
      <section id="explore" className="swipe-section">
        <RevealSection className="swipe-section-header">
          <motion.span
            className="section-label"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t("swipe.label")}
          </motion.span>
          <motion.h2
            className="swipe-section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            {t("swipe.title")} <span style={{ color: "var(--accent)" }}>{t("swipe.titleAccent")}</span>
          </motion.h2>
          <motion.p
            className="swipe-section-sub"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t("swipe.sub")}
          </motion.p>
        </RevealSection>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
          style={{ minHeight: 620 }}
        >
          <SwipeDeck walletConnected={isConnected} walletAddress={address || undefined} />
        </motion.div>
      </section>

      {/* ══════ AVAX-STYLE BANNER — full-width red strip ══════ */}
      <RevealSection className="avax-banner">
        <motion.div
          className="avax-banner-inner"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {BANNER_ITEMS.map((item, i) => (
            <span key={i} className="avax-banner-text" style={{ display: "flex", alignItems: "center", gap: "inherit" }}>
              {i > 0 && <span className="avax-banner-dot" />}
              {item}
            </span>
          ))}
        </motion.div>
      </RevealSection>

      {/* ══════ STATS TICKER ══════ */}
      <RevealSection className="stats-ticker">
        <div className="stats-ticker-inner">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="stat-item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: EASE_OUT }}
            >
              <span className="stat-value">
                {s.prefix}<CountUp end={s.value} decimals={s.decimals || 0} />{s.suffix}
              </span>
              <span className="stat-label">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      {/* ══════ HOW IT WORKS — avax-style numbered cards ══════ */}
      <RevealSection className="how-section">
        <span className="section-label">{t("how.label")}</span>
        <h2 className="how-title">
          {t("how.title")} <span style={{ color: "var(--accent)" }}>{t("how.titleAccent")}</span> {t("how.titleEnd")}
        </h2>
        <div className="how-grid">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="how-card"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.8, ease: EASE_OUT }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              <div className="how-card-num">{step.num}</div>
              <div className="how-card-icon">{step.icon}</div>
              <h3 className="how-card-title">{step.title}</h3>
              <p className="how-card-desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      {/* ══════ COMPARISON TABLE ══════ */}
      <RevealSection className="comparison-section">
        <div className="comparison-inner">
          <div className="comparison-header">
            <span className="section-label">{t("cmp.label")}</span>
            <h2>{t("cmp.title")} <span style={{ color: "var(--accent)" }}>{t("cmp.titleAccent")}</span></h2>
            <p className="comparison-subhead">{t("cmp.sub")}</p>
          </div>
          <div className="comparison-table">
            <div className="cmp-row cmp-head-row">
              <div className="cmp-cell cmp-label-cell">{t("cmp.feature")}</div>
              <div className="cmp-cell cmp-other-cell">GoFundMe</div>
              <div className="cmp-cell cmp-other-cell">Kickstarter</div>
              <div className="cmp-cell cmp-us-cell">
                <span className="cmp-us-logo">
                  <span style={{ color: "var(--text-primary)" }}>Sha</span>
                  <span style={{ color: "var(--accent)" }}>(vax)</span>
                  <span style={{ color: "var(--text-primary)" }}>re</span>
                </span>
              </div>
            </div>
            {COMPARISONS.map((row, i) => (
              <motion.div
                key={row.feature}
                className="cmp-row"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <div className="cmp-cell cmp-label-cell">{row.feature}</div>
                <div className="cmp-cell cmp-other-cell cmp-bad">{row.gfm}</div>
                <div className="cmp-cell cmp-other-cell cmp-bad">{row.kickstarter}</div>
                <div className="cmp-cell cmp-us-cell cmp-good">{row.shavaxre}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* ══════ CTA — avax-style: full-width red block ══════ */}
      <RevealSection className="cta-section">
        <motion.div
          className="cta-inner"
          whileInView={{ scale: [0.98, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <h2 className="cta-title">{t("cta.title")}</h2>
          <p className="cta-sub">{t("cta.sub")}</p>
          <div className="cta-actions">
            <Link href="/create" className="btn-primary" style={{ fontSize: "1rem", padding: "1rem 2.25rem" }}>
              {t("cta.create")}
            </Link>
            <a href="#explore" className="btn-secondary" style={{ fontSize: "1rem", padding: "1rem 2.25rem" }}>
              {t("cta.browse")}
            </a>
          </div>
        </motion.div>
      </RevealSection>
    </main>
  );
}
