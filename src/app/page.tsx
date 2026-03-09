"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import { useWallet } from "@/components/WalletProvider";
import SwipeDeck from "@/components/SwipeDeck";
import CountUp from "@/components/CountUp";

/* ─── Stagger helpers ─── */
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
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1, scale: 1,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

/* ─── Animated section wrapper ─── */
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

/* ─── Comparison data ─── */
const COMPARISONS = [
  { feature: "Platform Fee", gfm: "2.9% + 30¢", kickstarter: "5% + fees", shavaxre: "0%" },
  { feature: "Fund Release", gfm: "Instant", kickstarter: "All-or-nothing", shavaxre: "65/35 Milestone" },
  { feature: "Accountability", gfm: "None", kickstarter: "Honor system", shavaxre: "DAO Vote" },
  { feature: "Transparency", gfm: "Opaque", kickstarter: "Limited", shavaxre: "On-Chain" },
];

/* ─── How It Works steps ─── */
const STEPS = [
  { num: "01", title: "Create", desc: "Stake 0.1 AVAX as trust collateral. Upload your campaign with AI-verified content.", icon: "+" },
  { num: "02", title: "Fund", desc: "Donors swipe right to like, tap to donate. Funds flow directly — zero intermediaries.", icon: "◆" },
  { num: "03", title: "Release", desc: "65% unlocks at goal. Submit proof, donors vote, remaining 35% releases on approval.", icon: "→" },
];

export default function Home() {
  const { isConnected, address } = useWallet();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  return (
    <main className="min-h-screen bg-[#000]">
      {/* ══════ HERO ══════ */}
      <section ref={heroRef} className="hero">
        <div className="hero-watermark" aria-hidden="true">SHAVAXRE</div>
        <motion.div
          className="hero-content"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Label */}
          <motion.div variants={fadeUp} className="hero-label">
            AVALANCHE BUILD GAMES 2026
          </motion.div>

          {/* Title */}
          <motion.h1 variants={fadeUp} className="hero-title">
            <span className="hero-line">
              <span className="hero-line-inner" style={{ opacity: 1, transform: "none", animation: "none" }}>
                Education Funding,
              </span>
            </span>
            <span className="hero-line hero-line-accent">
              <span className="hero-line-inner" style={{ opacity: 1, transform: "none", animation: "none", color: "var(--accent)" }}>
                Reinvented.
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={fadeUp} className="hero-subtitle" style={{ opacity: 1, animation: "none" }}>
            Swipe to discover student campaigns. Donate directly on Avalanche.
            Zero fees. Full transparency. DAO-verified milestones.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="hero-bottom" style={{ opacity: 1, animation: "none" }}>
            <div className="hero-actions">
              <Link href="/create" className="btn-primary">
                Launch Campaign →
              </Link>
              <a href="#explore" className="btn-secondary">
                Explore ↓
              </a>
            </div>

            {/* Comparison bar */}
            <div className="hero-comparison-bar">
              <div className="hero-cmp-item">
                <span className="hero-cmp-platform">GoFundMe</span>
                <span className="hero-cmp-val hero-cmp-bad">2.9% fee</span>
              </div>
              <div className="hero-cmp-vs">VS</div>
              <div className="hero-cmp-item hero-cmp-us">
                <span className="hero-cmp-platform">Sha(vax)re</span>
                <span className="hero-cmp-val hero-cmp-good">0% fee</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
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

      {/* ══════ LIVE STATS TICKER ══════ */}
      <RevealSection className="stats-ticker">
        <div className="stats-ticker-inner">
          {[
            { label: "Total Campaigns", value: 12, suffix: "" },
            { label: "AVAX Donated", value: 48.5, suffix: " AVAX", decimals: 1 },
            { label: "Unique Donors", value: 87, suffix: "" },
            { label: "Platform Fee", value: 0, suffix: "%", prefix: "" },
          ].map((s, i) => (
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

      {/* ══════ SWIPE DECK ══════ */}
      <section id="explore" className="swipe-section">
        <RevealSection className="swipe-section-header">
          <motion.span
            className="section-label"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            DISCOVER
          </motion.span>
          <motion.h2
            className="swipe-section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          >
            Swipe. Like. <span style={{ color: "var(--accent)" }}>Fund.</span>
          </motion.h2>
          <motion.p
            className="swipe-section-sub"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Discover student campaigns. Swipe right to boost, tap to donate directly.
          </motion.p>
        </RevealSection>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <SwipeDeck walletConnected={isConnected} walletAddress={address || undefined} />
        </motion.div>
      </section>

      {/* ══════ HOW IT WORKS ══════ */}
      <RevealSection className="how-section">
        <span className="section-label">HOW IT WORKS</span>
        <h2 className="how-title">
          Three steps to <span style={{ color: "var(--accent)" }}>transparent</span> funding
        </h2>
        <div className="how-grid">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="how-card"
              initial={{ opacity: 0, y: 50, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: i * 0.15,
                duration: 0.8,
                ease: EASE_OUT,
              }}
              whileHover={{
                y: -8,
                boxShadow: "0 20px 60px rgba(232,65,66,0.15)",
                transition: { duration: 0.3 },
              }}
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
            <span className="section-label">WHY SHA(VAX)RE</span>
            <h2>Built different. <span style={{ color: "var(--accent)" }}>Verified on-chain.</span></h2>
            <p className="comparison-subhead">
              Traditional platforms take fees and offer no accountability.
              We put every transaction on Avalanche — verifiable, permanent, trustless.
            </p>
          </div>
          <div className="comparison-table">
            <div className="cmp-row cmp-head-row">
              <div className="cmp-cell cmp-label-cell">Feature</div>
              <div className="cmp-cell cmp-other-cell">GoFundMe</div>
              <div className="cmp-cell cmp-other-cell">Kickstarter</div>
              <div className="cmp-cell cmp-us-cell">
                <span className="cmp-us-logo">
                  <span style={{ color: "#fff" }}>Sha</span>
                  <span style={{ color: "var(--accent)" }}>(vax)</span>
                  <span style={{ color: "#fff" }}>re</span>
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

      {/* ══════ CTA BANNER ══════ */}
      <RevealSection className="cta-section">
        <motion.div
          className="cta-inner"
          whileInView={{ scale: [0.95, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        >
          <h2 className="cta-title">Ready to make a difference?</h2>
          <p className="cta-sub">
            Launch your campaign or start supporting students today.
            Every AVAX counts.
          </p>
          <div className="cta-actions">
            <Link href="/create" className="btn-primary" style={{ fontSize: "1rem", padding: "0.9rem 2rem" }}>
              Create Campaign →
            </Link>
            <a href="#explore" className="btn-secondary" style={{ fontSize: "1rem", padding: "0.9rem 2rem" }}>
              Browse Campaigns
            </a>
          </div>
        </motion.div>
      </RevealSection>
    </main>
  );
}
