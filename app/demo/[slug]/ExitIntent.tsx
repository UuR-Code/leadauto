"use client"

import { useState, useEffect } from "react"

type Props = {
  phone: string
  firmName: string
  primary: string
}

export function ExitIntent({ phone, firmName, primary }: Props) {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return
    let triggered = false

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10 && !triggered) {
        triggered = true
        setTimeout(() => setShow(true), 300)
      }
    }

    // Mobile: trigger on back button / inactivity after 30s
    const timeout = setTimeout(() => {
      if (!triggered) { triggered = true; setShow(true) }
    }, 45000)

    document.addEventListener("mouseleave", onMouseLeave)
    return () => {
      document.removeEventListener("mouseleave", onMouseLeave)
      clearTimeout(timeout)
    }
  }, [dismissed])

  const dismiss = () => { setShow(false); setDismissed(true) }
  const wa = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Merhaba ${firmName}, web sitenizi gördüm, bilgi almak istiyorum.`)}`

  if (!show) return null

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, animation: "fadeIn 0.3s ease",
    }} onClick={dismiss}>
      <div style={{
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 28, padding: 40, maxWidth: 420, width: "100%",
        textAlign: "center", boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        animation: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👋</div>
        <h2 style={{
          color: "#fff", fontSize: 24, fontWeight: 800,
          marginBottom: 10, letterSpacing: "-0.02em",
        }}>Gitmeden Önce!</h2>
        <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
          <strong style={{ color: "#fff" }}>{firmName}</strong> size özel avantajlı teklifimizi kaçırmayın.
          Hemen iletişime geçin!
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href={`tel:${phone}`} style={{
            background: primary, color: "#fff",
            padding: "14px", borderRadius: 12,
            fontWeight: 800, fontSize: 16, textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: `0 4px 20px ${primary}60`,
          }}>📞 Hemen Ara</a>
          <a href={wa} style={{
            background: "#25D366", color: "#fff",
            padding: "14px", borderRadius: 12,
            fontWeight: 800, fontSize: 16, textDecoration: "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>💬 WhatsApp ile Yaz</a>
          <button onClick={dismiss} style={{
            background: "transparent", color: "#475569",
            border: "none", padding: "10px", borderRadius: 8,
            fontSize: 14, cursor: "pointer", marginTop: 4,
          }}>Hayır, teşekkürler</button>
        </div>
      </div>
    </div>
  )
}
