"use client"

import { useState } from "react"

type Props = {
  firmId: string
  firmName: string
  primary: string
  bgCard: string
  border: string
  textMuted: string
  dark: boolean
}

export function ContactForm({ firmId, firmName, primary, bgCard, border, textMuted, dark }: Props) {
  const [form, setForm] = useState({ name: "", phone: "", message: "" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const textColor = dark ? "#fff" : "#0f172a"
  const inputBg = dark ? "rgba(255,255,255,0.05)" : "#f8fafc"

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/demo/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmId, firmName, ...form }),
      })
      setStatus(res.ok ? "success" : "error")
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div style={{
        background: bgCard, border: `1px solid ${border}`,
        borderRadius: 20, padding: 40, textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h3 style={{ color: textColor, fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
          Mesajınız İletildi!
        </h3>
        <p style={{ color: textMuted, fontSize: 15 }}>
          En kısa sürede sizinle iletişime geçeceğiz.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{
      background: bgCard, border: `1px solid ${border}`,
      borderRadius: 20, padding: 32,
      display: "flex", flexDirection: "column", gap: 16,
    }}>
      <h3 style={{ color: textColor, fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
        Randevu / Bilgi Al
      </h3>
      <p style={{ color: textMuted, fontSize: 14, marginBottom: 8 }}>
        Formu doldurun, sizi arayalım.
      </p>

      <div>
        <label style={{ display: "block", color: textMuted, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Ad Soyad *
        </label>
        <input
          required value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Adınızı girin"
          style={{
            width: "100%", padding: "12px 16px",
            background: inputBg, border: `1px solid ${border}`,
            borderRadius: 10, color: textColor, fontSize: 15,
            outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <label style={{ display: "block", color: textMuted, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Telefon *
        </label>
        <input
          required type="tel" value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="05XX XXX XX XX"
          style={{
            width: "100%", padding: "12px 16px",
            background: inputBg, border: `1px solid ${border}`,
            borderRadius: 10, color: textColor, fontSize: 15,
            outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <label style={{ display: "block", color: textMuted, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Mesaj
        </label>
        <textarea
          value={form.message} rows={3}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          placeholder="Bilgi almak istediğiniz konu..."
          style={{
            width: "100%", padding: "12px 16px",
            background: inputBg, border: `1px solid ${border}`,
            borderRadius: 10, color: textColor, fontSize: 15,
            outline: "none", resize: "vertical", boxSizing: "border-box",
          }}
        />
      </div>

      <button type="submit" disabled={status === "loading"} style={{
        background: primary, color: "#fff",
        padding: "14px", borderRadius: 12,
        fontWeight: 800, fontSize: 16, border: "none",
        cursor: status === "loading" ? "not-allowed" : "pointer",
        opacity: status === "loading" ? 0.7 : 1,
        transition: "opacity 0.2s",
        boxShadow: `0 4px 20px ${primary}50`,
      }}>
        {status === "loading" ? "Gönderiliyor..." : "📩 Gönder"}
      </button>

      {status === "error" && (
        <p style={{ color: "#ef4444", fontSize: 13, textAlign: "center" }}>
          Bir hata oluştu. Lütfen tekrar deneyin.
        </p>
      )}
    </form>
  )
}
