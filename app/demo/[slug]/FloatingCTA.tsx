"use client"

import { useState, useEffect } from "react"

type Props = {
  phone: string
  primary: string
  firmName: string
}

export function FloatingCTA({ phone, primary, firmName }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.75)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const wa = `https://wa.me/${phone.replace(/\D/g, "")}`

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
      transform: visible ? "translateY(0)" : "translateY(110%)",
      transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
    }}>
      {/* Subtle firm name label */}
      <div style={{
        textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.5)",
        paddingTop: 8,
        background: "rgba(10,16,30,0.97)",
      }}>{firmName}</div>
      <div style={{
        background: "rgba(10,16,30,0.97)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "12px 16px 16px",
        display: "flex", gap: 10,
      }}>
        <a href={`tel:${phone}`} style={{
          flex: 1, background: primary, color: "#fff",
          padding: "14px", borderRadius: 12,
          fontWeight: 800, fontSize: 15, textDecoration: "none",
          textAlign: "center", display: "flex",
          alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: `0 4px 20px ${primary}60`,
        }}>📞 Hemen Ara</a>
        <a href={wa} style={{
          flex: 1, background: "#25D366", color: "#fff",
          padding: "14px", borderRadius: 12,
          fontWeight: 800, fontSize: 15, textDecoration: "none",
          textAlign: "center", display: "flex",
          alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
        }}>💬 WhatsApp</a>
      </div>
    </div>
  )
}
