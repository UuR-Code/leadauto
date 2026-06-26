"use client"

import { useState, useEffect, useCallback } from "react"

type Props = {
  images: string[]
  firmName: string
  district: string
  city: string
  phone: string | null
  primary: string
  title: string
  subtitle: string
  ctaText: string
  badge?: string
}

export function HeroSlider({ images, firmName, district, city, phone, primary, title, subtitle, ctaText, badge }: Props) {
  const [current, setCurrent] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const next = useCallback(() => setCurrent(c => (c + 1) % images.length), [images.length])

  useEffect(() => {
    setLoaded(true)
    if (images.length <= 1) return
    const id = setInterval(next, 6000)
    return () => clearInterval(id)
  }, [next, images.length])

  const wa = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : null

  return (
    <section style={{ position: "relative", height: "100vh", minHeight: 600, overflow: "hidden" }}>
      {/* Background slides */}
      {images.map((img, i) => (
        <div key={i} style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${img})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: i === current ? 1 : 0,
          transition: "opacity 1.5s ease-in-out",
          transform: i === current ? "scale(1.04)" : "scale(1)",
          transitionProperty: "opacity, transform",
          transitionDuration: "1.5s, 8s",
          willChange: "opacity, transform",
        }} />
      ))}

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.88) 100%)",
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 2,
        height: "100%", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 24px 120px", textAlign: "center",
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}>
        {badge && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: `${primary}50`, color: "#fff",
            padding: "6px 20px", borderRadius: 999, fontSize: 13,
            fontWeight: 600, marginBottom: 24, border: `1px solid ${primary}80`,
            backdropFilter: "blur(8px)",
            letterSpacing: "0.05em", textTransform: "uppercase",
          }}>✦ {badge}</div>
        )}

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 76px)", fontWeight: 900, color: "#fff",
          marginBottom: 20, lineHeight: 1.08, letterSpacing: "-0.025em",
          textShadow: "0 2px 32px rgba(0,0,0,0.6)",
          maxWidth: 900,
        }}>{title}</h1>

        <p style={{
          fontSize: "clamp(16px, 2.2vw, 20px)", color: "rgba(255,255,255,0.82)",
          maxWidth: 580, marginBottom: 40, lineHeight: 1.75,
          textShadow: "0 1px 12px rgba(0,0,0,0.5)",
        }}>{subtitle}</p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          {phone && (
            <a href={`tel:${phone}`} style={{
              background: primary, color: "#fff",
              padding: "16px 36px", borderRadius: 14,
              fontWeight: 800, fontSize: 16, textDecoration: "none",
              boxShadow: `0 6px 32px ${primary}80`,
              display: "inline-flex", alignItems: "center", gap: 10,
              letterSpacing: "-0.01em",
            }}>📞 {ctaText}</a>
          )}
          {wa && (
            <a href={wa} style={{
              background: "rgba(37,211,102,0.92)", color: "#fff",
              backdropFilter: "blur(8px)",
              padding: "16px 36px", borderRadius: 14,
              fontWeight: 800, fontSize: 16, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 10,
              boxShadow: "0 6px 24px rgba(37,211,102,0.4)",
            }}>💬 WhatsApp</a>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3,
        padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
      }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
          <span>📍</span>
          <span>{district}, {city}</span>
        </div>

        {/* Dots */}
        {images.length > 1 && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} style={{
                width: i === current ? 28 : 8, height: 8, borderRadius: 999,
                background: i === current ? primary : "rgba(255,255,255,0.45)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
              }} />
            ))}
          </div>
        )}

        {/* Scroll hint */}
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span>↓</span>
          <span>Keşfet</span>
        </div>
      </div>
    </section>
  )
}
