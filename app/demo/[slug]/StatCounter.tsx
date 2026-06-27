"use client"

import { useState, useEffect, useRef } from "react"

type Props = {
  value: string
  label: string
  primary: string
  textMuted: string
  delay?: number
}

function parseNumber(v: string): { num: number; suffix: string; prefix: string } {
  const prefix = v.match(/^[^0-9]*/)?.[0] ?? ""
  const suffix = v.match(/[^0-9]*$/)?.[0] ?? ""
  const num = parseInt(v.replace(/[^0-9]/g, ""), 10) || 0
  return { num, suffix, prefix }
}

export function StatCounter({ value, label, primary, textMuted, delay = 0 }: Props) {
  const { num, suffix, prefix } = parseNumber(value)
  const [count, setCount] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect() } },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || num === 0) return
    const timeout = setTimeout(() => {
      const duration = 1800
      const start = performance.now()
      const step = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        setCount(Math.round(ease * num))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(timeout)
  }, [visible, num, delay])

  const display = num > 0 ? `${prefix}${count}${suffix}` : value

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{
        fontSize: "clamp(32px,5vw,48px)", fontWeight: 900,
        color: primary, lineHeight: 1, letterSpacing: "-0.03em",
        transition: "opacity 0.5s",
        opacity: visible ? 1 : 0,
      }}>{display}</div>
      <div style={{ fontSize: 13, color: textMuted, marginTop: 10, fontWeight: 600 }}>{label}</div>
    </div>
  )
}
