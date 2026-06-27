"use client"

import { useState, useEffect } from "react"

type NavLink = { href: string; label: string }

type Props = {
  firmName: string
  phone: string | null
  primary: string
  dark: boolean
  border: string
  textMuted: string
  navLinks: NavLink[]
}

export function NavBarClient({ firmName, phone, primary, dark, border, textMuted, navLinks }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const bg = scrolled
    ? dark ? "rgba(15,23,42,0.98)" : "rgba(255,255,255,0.98)"
    : "transparent"

  const shadow = scrolled ? "0 2px 24px rgba(0,0,0,0.12)" : "none"
  const borderColor = scrolled ? border : "transparent"

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: bg,
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: `1px solid ${borderColor}`,
      boxShadow: shadow,
      padding: "0 24px",
      transition: "background 0.4s, box-shadow 0.4s, border-color 0.4s",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: scrolled ? 60 : 72,
        transition: "height 0.3s",
      }}>
        <a href="#hero" style={{
          fontWeight: 900, fontSize: scrolled ? 16 : 18, color: scrolled ? primary : "#fff",
          textDecoration: "none", letterSpacing: "-0.02em",
          transition: "color 0.3s, font-size 0.3s",
        }}>{firmName}</a>

        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} style={{
              color: scrolled ? textMuted : "rgba(255,255,255,0.85)",
              textDecoration: "none", fontSize: 14, fontWeight: 500,
              display: "none", transition: "color 0.3s",
            }} className="nav-link">{l.label}</a>
          ))}
          {phone && (
            <a href={`tel:${phone}`} style={{
              background: scrolled ? primary : "rgba(255,255,255,0.15)",
              color: "#fff",
              padding: "8px 20px", borderRadius: 8,
              fontSize: 13, fontWeight: 700, textDecoration: "none",
              backdropFilter: scrolled ? "none" : "blur(8px)",
              border: scrolled ? "none" : "1px solid rgba(255,255,255,0.25)",
              transition: "background 0.3s",
            }}>📞 Ara</a>
          )}
        </div>
      </div>
    </nav>
  )
}
