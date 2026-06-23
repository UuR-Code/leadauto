"use client"

import { useState } from "react"
import type { Campaign } from "@prisma/client"

type Props = {
  campaign: Campaign & { _count: { firms: number } }
}

export default function ActiveCampaignBanner({ campaign }: Props) {
  const [pausing, setPausing] = useState(false)

  const progress = Math.min(Math.round((campaign._count.firms / campaign.targetCount) * 100), 100)

  async function handlePause() {
    setPausing(true)
    await fetch(`/api/campaigns/${campaign.id}/pause`, { method: "POST" })
    setPausing(false)
    window.location.reload()
  }

  return (
    <div
      className="rounded-xl px-5 py-4 border flex items-center justify-between gap-4"
      style={{ background: "linear-gradient(90deg,#1e3a5f,#162744)", borderColor: "#2d4a6f" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{campaign.name}</div>
          <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>
            {campaign.district} · {campaign.city} · Başlangıç: {new Date(campaign.createdAt).toLocaleDateString("tr-TR")}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="w-36 hidden sm:block">
          <div className="flex justify-between text-[10px] mb-1" style={{ color: "#64748b" }}>
            <span>İlerleme</span>
            <span>{campaign._count.firms}/{campaign.targetCount}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "#1e2d45" }}>
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <span
          className="text-[10px] font-medium px-2 py-1 rounded-full border"
          style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", borderColor: "rgba(34,197,94,0.3)" }}
        >
          ● Çalışıyor
        </span>

        <button
          onClick={handlePause}
          disabled={pausing}
          className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50"
          style={{ background: "#1e2d45", borderColor: "#2d3f5a", color: "#94a3b8" }}
        >
          {pausing ? "…" : "⏸ Durdur"}
        </button>
      </div>
    </div>
  )
}
