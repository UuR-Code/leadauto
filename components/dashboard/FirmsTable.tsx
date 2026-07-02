import type { Firm } from "@prisma/client"
import { FIRM_STATUS_LABELS } from "@/types"
import Link from "next/link"

const STATUS_COLORS: Record<string, string> = {
  purple: "rgba(99,102,241,0.15)",
  yellow: "rgba(234,179,8,0.15)",
  blue:   "rgba(59,130,246,0.15)",
  cyan:   "rgba(6,182,212,0.15)",
  green:  "rgba(34,197,94,0.15)",
  orange: "rgba(249,115,22,0.15)",
  emerald:"rgba(16,185,129,0.15)",
  gray:   "rgba(107,114,128,0.15)",
}

const TEXT_COLORS: Record<string, string> = {
  purple: "#818cf8", yellow: "#eab308", blue: "#60a5fa",
  cyan: "#22d3ee", green: "#22c55e", orange: "#f97316",
  emerald: "#10b981", gray: "#6b7280",
}

type FirmWithCampaign = Firm & { campaign: { sector: string } }

export default function FirmsTable({ firms }: { firms: FirmWithCampaign[] }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#1e2d45" }}>
        <h2 className="text-sm font-semibold">Son Firmalar</h2>
        <Link href="/firms" className="text-xs" style={{ color: "#60a5fa" }}>Tümünü gör →</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid #1e2d45" }}>
              {["Firma", "Durum", "Demo", "Görüntülenme", "Tarih"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-medium" style={{ color: "#4a5568" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {firms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: "#4a5568" }}>
                  Henüz firma yok. Kampanya başlatarak başlayın.
                </td>
              </tr>
            )}
            {firms.map((firm) => {
              const statusInfo = FIRM_STATUS_LABELS[firm.status] ?? { label: firm.status, color: "gray" }
              return (
                <tr key={firm.id} className="transition-colors hover:bg-[#1e2d45]/30" style={{ borderBottom: "1px solid #0f1117" }}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm text-slate-200">{firm.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{firm.district}, {firm.city}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border"
                      style={{
                        background: STATUS_COLORS[statusInfo.color],
                        color: TEXT_COLORS[statusInfo.color],
                        borderColor: TEXT_COLORS[statusInfo.color] + "33",
                      }}
                    >
                      ● {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {firm.demoUrl ? (
                      <a href={firm.demoUrl} target="_blank" className="text-xs" style={{ color: "#60a5fa" }}>
                        demo/{firm.demoSlug?.slice(0, 20)}
                      </a>
                    ) : (
                      <span className="text-xs" style={{ color: "#4a5568" }}>Hazırlanıyor…</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#94a3b8" }}>
                    👁 {firm.viewCount}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#64748b" }}>
                    {timeAgo(firm.createdAt)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "az önce"
  if (mins < 60) return `${mins}dk önce`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}sa önce`
  return `${Math.floor(hrs / 24)}g önce`
}
