"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/components/WalletProvider";
import { useCreateCampaign } from "@/hooks/useShavaxre";

export default function CreatePage() {
    const { isConnected, connect } = useWallet();
    const { create, isPending, isConfirming, isSuccess, error } = useCreateCampaign();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "Tuition",
        goalAvax: "",
        twitter: "",
        instagram: "",
        liveStream: "",
    });

    // Image state
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // AI Moderation state
    const [moderating, setModerating] = useState(false);
    const [moderationResult, setModerationResult] = useState<{
        safe: boolean; reason?: string;
    } | null>(null);

    const categories = ["Tuition", "Books", "Research", "Housing", "Technology", "Other"];

    // ── Image Upload + AI Moderation ──────────────────────────

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Dosya boyutu kontrolu (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setModerationResult({ safe: false, reason: "Dosya boyutu 5MB'dan buyuk" });
            return;
        }

        // Sadece resim
        if (!file.type.startsWith("image/")) {
            setModerationResult({ safe: false, reason: "Sadece resim dosyalari yuklenebilir" });
            return;
        }

        setImageFile(file);
        setModerationResult(null);

        // Preview + base64
        const reader = new FileReader();
        reader.onload = async (event) => {
            const dataUrl = event.target?.result as string;
            setImagePreview(dataUrl);

            // Base64 data'yi ayikla (data:image/xxx;base64, prefix'i kaldir)
            const base64 = dataUrl.split(",")[1];
            setImageBase64(base64);

            // AI Moderation cagir
            setModerating(true);
            try {
                const res = await fetch("/api/moderate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64, mimeType: file.type }),
                });
                const result = await res.json();
                setModerationResult(result);

                if (!result.safe) {
                    // Gorseli temizle
                    setImageFile(null);
                    setImagePreview(null);
                    setImageBase64(null);
                }
            } catch {
                // API cokerse guvensiz say
                setModerationResult({ safe: false, reason: "Moderasyon servisi yanitlamiyor" });
                setImageFile(null);
                setImagePreview(null);
                setImageBase64(null);
            } finally {
                setModerating(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setImageBase64(null);
        setModerationResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Form Submit ───────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            await connect();
            return;
        }

        // Metadata JSON — SwipeDeck'in resolveMetadata'sinin beklediği format
        // NOT: Gorsel base64 on-chain'e yazilamaz (calldata maliyeti cok yuksek).
        // Production'da gorsel IPFS'e yuklenir, buraya sadece CID/URL konur.
        // Test icin: gorsel localStorage'a kaydedilip placeholder URL kullaniliyor.
        let imageUrl = "";
        if (imagePreview) {
            // Test: goruntuyu localStorage'a kaydet, campaignCount key'i ile
            // Production'da bu blok IPFS upload ile degistirilecek
            const tempKey = `shavaxre_img_pending`;
            try { localStorage.setItem(tempKey, imagePreview); } catch {}
            imageUrl = `local://${tempKey}`;
        }

        const metadata: Record<string, unknown> = {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            image: imageUrl,
            socialLinks: {
                twitter: formData.twitter || undefined,
                instagram: formData.instagram || undefined,
                liveStream: formData.liveStream || undefined,
            },
        };

        // Data URI olarak encode et (production'da IPFS CID olacak)
        const metadataURI = `data:application/json;base64,${btoa(
            unescape(encodeURIComponent(JSON.stringify(metadata)))
        )}`;

        await create(metadataURI, formData.goalAvax);
    };

    const isFormValid =
        formData.title.trim() &&
        formData.description.trim() &&
        formData.goalAvax &&
        parseFloat(formData.goalAvax) > 0;

    // ── Success State ─────────────────────────────────────────

    if (isSuccess) {
        return (
            <div className="page-container">
                <motion.div
                    className="success-card"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                >
                    <div className="success-icon">🎉</div>
                    <h2>Campaign Created!</h2>
                    <p>Your campaign is now live on Avalanche. Swipe feed&apos;de gorunecek.</p>
                    <p style={{ fontSize: "0.85rem", opacity: 0.7, marginTop: "0.5rem" }}>
                        0.1 AVAX stake deposited. Basarili kanit + oylamadan sonra iade edilecek.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                        <a href="/" className="btn-primary">
                            Swipe Feed&apos;e Don
                        </a>
                        <a href="/campaigns" className="btn-secondary" style={{
                            padding: "0.75rem 1.5rem",
                            borderRadius: "var(--radius-lg)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                            textDecoration: "none",
                            transition: "all 0.2s",
                        }}>
                            Tum Kampanyalar
                        </a>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── Form Render ───────────────────────────────────────────

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Kampanya Olustur</h1>
                <p className="page-subtitle">
                    Hikayeni anlat, gorselini yukle, sosyal hesaplarini baglayip guvenilirligini kanitla.
                    Kampanyan zincir ustune yazilacak. 0.1 AVAX stake gerekli.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="create-form">
                {/* ── Gorsel Yukleme + AI Moderation ────────── */}
                <div className="form-group">
                    <label>Kampanya Gorseli</label>
                    <div
                        onClick={() => !imagePreview && fileInputRef.current?.click()}
                        style={{
                            position: "relative",
                            width: "100%",
                            minHeight: imagePreview ? "auto" : "200px",
                            borderRadius: "var(--radius-lg)",
                            border: `2px dashed ${moderationResult && !moderationResult.safe
                                ? "#ef4444"
                                : imagePreview
                                    ? "var(--accent)"
                                    : "var(--border)"}`,
                            background: "var(--bg-card)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: imagePreview ? "default" : "pointer",
                            overflow: "hidden",
                            transition: "all 0.3s",
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: "none" }}
                        />

                        {imagePreview ? (
                            <div style={{ position: "relative", width: "100%" }}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{
                                        width: "100%",
                                        maxHeight: "300px",
                                        objectFit: "cover",
                                        borderRadius: "var(--radius-lg)",
                                    }}
                                />
                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    style={{
                                        position: "absolute",
                                        top: "12px",
                                        right: "12px",
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        background: "rgba(0,0,0,0.7)",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                        color: "#fff",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    ✕
                                </button>
                                {/* AI check badge */}
                                <AnimatePresence>
                                    {moderating && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{
                                                position: "absolute",
                                                bottom: "12px",
                                                left: "12px",
                                                padding: "6px 14px",
                                                borderRadius: "20px",
                                                background: "rgba(0,0,0,0.8)",
                                                backdropFilter: "blur(8px)",
                                                color: "#f59e0b",
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            AI taramasi yapiliyor...
                                        </motion.div>
                                    )}
                                    {moderationResult?.safe && !moderating && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{
                                                position: "absolute",
                                                bottom: "12px",
                                                left: "12px",
                                                padding: "6px 14px",
                                                borderRadius: "20px",
                                                background: "rgba(16,185,129,0.2)",
                                                backdropFilter: "blur(8px)",
                                                border: "1px solid rgba(16,185,129,0.3)",
                                                color: "#10b981",
                                                fontSize: "0.8rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            AI Onayladi
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div style={{ textAlign: "center", padding: "2rem" }}>
                                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem", opacity: 0.4 }}>
                                    📷
                                </div>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                                    Gorsel yuklemek icin tikla
                                </p>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                                    JPG, PNG, WebP — Maks 5MB — AI ile otomatik taranacak
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Moderation error */}
                    {moderationResult && !moderationResult.safe && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                color: "#ef4444",
                                fontSize: "0.85rem",
                                marginTop: "0.5rem",
                                padding: "0.5rem 0.75rem",
                                background: "rgba(239,68,68,0.1)",
                                borderRadius: "var(--radius-sm)",
                                border: "1px solid rgba(239,68,68,0.2)",
                            }}
                        >
                            Gorsel reddedildi: {moderationResult.reason || "NSFW / siddet icerigi tespit edildi"}
                        </motion.p>
                    )}
                </div>

                {/* ── Baslik ───────────────────────────────── */}
                <div className="form-group">
                    <label htmlFor="title">Kampanya Basligi</label>
                    <input
                        id="title"
                        type="text"
                        placeholder='orn: "Sanayiye cekmem lazim" veya "Son sinif bilgisayar muhendisligi"'
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        maxLength={80}
                    />
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", float: "right" }}>
                        {formData.title.length}/80
                    </span>
                </div>

                {/* ── Aciklama ─────────────────────────────── */}
                <div className="form-group">
                    <label htmlFor="description">Aciklama</label>
                    <textarea
                        id="description"
                        rows={4}
                        placeholder="Fonlari ne icin kullanacagini kisa ve net anlat..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        maxLength={500}
                    />
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", float: "right" }}>
                        {formData.description.length}/500
                    </span>
                </div>

                {/* ── Kategori + Hedef ─────────────────────── */}
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="category">Kategori</label>
                        <select
                            id="category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="goalAvax">Hedef (AVAX)</label>
                        <input
                            id="goalAvax"
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="50.00"
                            value={formData.goalAvax}
                            onChange={(e) => setFormData({ ...formData, goalAvax: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* ── Social KYC ───────────────────────────── */}
                <div className="form-group">
                    <label style={{ marginBottom: "0.25rem" }}>
                        Social KYC
                        <span style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontWeight: 400,
                            marginLeft: "0.5rem",
                        }}>
                            (opsiyonel — guvenilirligini arttirir)
                        </span>
                    </label>
                    <p style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        marginBottom: "0.75rem",
                    }}>
                        Sosyal hesaplarini baglayarak bagiscilar seni dogrulayabilir. Kartinda gorunecek.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute",
                                left: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#1DA1F2",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                pointerEvents: "none",
                            }}>𝕏</span>
                            <input
                                type="url"
                                placeholder="https://x.com/kullaniciadin"
                                value={formData.twitter}
                                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                                style={{ paddingLeft: "2.5rem" }}
                            />
                        </div>

                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute",
                                left: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#E4405F",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                pointerEvents: "none",
                            }}>IG</span>
                            <input
                                type="url"
                                placeholder="https://instagram.com/kullaniciadin"
                                value={formData.instagram}
                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                style={{ paddingLeft: "2.5rem" }}
                            />
                        </div>

                        <div style={{ position: "relative" }}>
                            <span style={{
                                position: "absolute",
                                left: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#9146FF",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                pointerEvents: "none",
                            }}>▶</span>
                            <input
                                type="url"
                                placeholder="Canli yayin linki (Twitch, YouTube, vb.)"
                                value={formData.liveStream}
                                onChange={(e) => setFormData({ ...formData, liveStream: e.target.value })}
                                style={{ paddingLeft: "2.5rem" }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Info Box ─────────────────────────────── */}
                <div className="form-info">
                    <div className="info-item">
                        <span>💰</span>
                        <p>
                            <strong>Zero Commission</strong> — Bagislarin %100&apos;u direkt cuzdanina
                        </p>
                    </div>
                    <div className="info-item">
                        <span>🔗</span>
                        <p>
                            <strong>On-Chain</strong> — Kampanyan kalici olarak Avalanche&apos;a yazilacak
                        </p>
                    </div>
                    <div className="info-item">
                        <span>🔒</span>
                        <p>
                            <strong>Stake</strong> — 0.1 AVAX stake (basarili kanit + oylama sonrasi iade)
                        </p>
                    </div>
                    <div className="info-item">
                        <span>🤖</span>
                        <p>
                            <strong>AI Filtre</strong> — Gorseller uygunsuz icerik icin otomatik taranir
                        </p>
                    </div>
                </div>

                {/* ── Error ────────────────────────────────── */}
                {error && (
                    <motion.div
                        className="tx-error"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        ⚠️ {error}
                    </motion.div>
                )}

                {/* ── Submit ───────────────────────────────── */}
                <button
                    type="submit"
                    className="btn-primary btn-full"
                    disabled={isPending || isConfirming || moderating || !isFormValid}
                    style={{
                        opacity: isPending || isConfirming || moderating || !isFormValid ? 0.5 : 1,
                    }}
                >
                    {!isConnected
                        ? "Cuzdani Bagla"
                        : isPending
                            ? "Cuzdanda onayla..."
                            : isConfirming
                                ? "Zincire yaziliyor..."
                                : moderating
                                    ? "AI taramasi bekleniyor..."
                                    : `Kampanya Olustur (0.1 AVAX stake)`}
                </button>
            </form>
        </div>
    );
}
