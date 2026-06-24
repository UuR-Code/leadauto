"use client"

import { useState } from "react"
import { SECTORS, CITIES } from "@/types"
import { useRouter } from "next/navigation"

export default function NewCampaignForm() {
  const router = useRouter()
  const [sector, setSector] = useState("")
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [channel, setChannel] = useState("email")
  const [targetCount, setTargetCount] = useState(100)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const selectedCity = CITIES.find((c) => c.value === city)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sector || !city || !district) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${selectedCity?.label} ${SECTORS.find((s) => s.value === sector)?.label} Kampanyası`,
          sector,
          city,
          district,
          channel,
          targetCount,
        }),
      })

      if (res.ok) {
        setDone(true)
        setTimeout(() => { setDone(false); router.refresh() }, 2000)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ? JSON.stringify(data.error) : `Hata: ${res.status}`)
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-xl border" style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "#1e2d45" }}>
        <h2 className="text-sm font-semibold">Yeni Kampanya Başlat</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Sector */}
        <div>
          <label className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: "#64748b" }}>
            Sektör Seç
          </label>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSector(s.value)}
                className="px-3 py-1.5 rounded-full text-xs border transition-all"
                style={{
                  background: sector === s.value ? "rgba(59,130,246,0.15)" : "transparent",
                  borderColor: sector === s.value ? "#3b82f6" : "#1e2d45",
                  color: sector === s.value ? "#60a5fa" : "#64748b",
                }}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: "#64748b" }}>Şehir</label>
            <select
              value={city}
              onChange={(e) => { setCity(e.target.value); setDistrict("") }}
              className="w-full rounded-lg px-3 py-2 text-sm border outline-none focus:border-blue-500"
              style={{ background: "#0f1117", borderColor: "#1e2d45", color: "#e2e8f0" }}
            >
              <option value="">Seç…</option>
              {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: "#64748b" }}>İlçe</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!city}
              className="w-full rounded-lg px-3 py-2 text-sm border outline-none focus:border-blue-500 disabled:opacity-40"
              style={{ background: "#0f1117", borderColor: "#1e2d45", color: "#e2e8f0" }}
            >
              <option value="">Seç…</option>
              {selectedCity?.districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Channel + Count */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: "#64748b" }}>Kanal</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
              style={{ background: "#0f1117", borderColor: "#1e2d45", color: "#e2e8f0" }}
            >
              <option value="email">📧 Sadece Email</option>
              <option value="both">📧+💬 Email + WhatsApp</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: "#64748b" }}>Hedef Firma</label>
            <input
              type="number"
              min={1}
              max={500}
              value={targetCount}
              onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full rounded-lg px-3 py-2 text-sm border outline-none"
              style={{ background: "#0f1117", borderColor: "#1e2d45", color: "#e2e8f0" }}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs rounded-lg px-3 py-2" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!sector || !city || !district || loading || done}
          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: done ? "#16a34a" : "#3b82f6", color: "white" }}
        >
          {done ? "✅ Kampanya Başlatıldı!" : loading ? "⏳ Başlatılıyor…" : "🚀 Kampanyayı Başlat"}
        </button>
      </form>
    </div>
  )
}
