import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function CampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { firms: true } } },
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
        <h1 className="text-base font-semibold">Kampanyalar</h1>
        <Link href="/dashboard"
          className="px-3 py-1.5 rounded-lg text-xs font-medium border"
          style={{ background: "#1e2d45", borderColor: "#2d3f5a", color: "#94a3b8" }}>
          ← Dashboard
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <p className="text-slate-400 text-sm">Henüz kampanya yok.</p>
            <p className="text-slate-600 text-xs mt-1">Dashboard'dan yeni kampanya başlat.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="rounded-xl border p-4 flex items-center gap-4"
                style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-100 truncate">{c.name}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs" style={{ color: "#64748b" }}>📍 {c.city} / {c.district}</span>
                    <span className="text-xs" style={{ color: "#64748b" }}>🏷️ {c.sector}</span>
                    <span className="text-xs" style={{ color: "#64748b" }}>
                      {new Date(c.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{c._count.firms}</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "#4a5568" }}>Firma</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-slate-300">{c.targetCount}</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "#4a5568" }}>Hedef</div>
                  </div>
                </div>
                <PauseButton id={c.id} status={c.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    RUNNING:   { label: "Aktif",    color: "#34d399", bg: "rgba(52,211,153,0.1)" },
    PAUSED:    { label: "Durduruldu", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    COMPLETED: { label: "Tamamlandı", color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
  }
  const s = map[status] ?? { label: status, color: "#94a3b8", bg: "transparent" }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ color: s.color, background: s.bg }}>
      {s.label}
    </span>
  )
}

function PauseButton({ id, status }: { id: string; status: string }) {
  if (status !== "RUNNING") return null
  return (
    <form action={`/api/campaigns/${id}/pause`} method="POST">
      <button type="submit"
        className="px-3 py-1.5 rounded-lg text-xs border transition-colors"
        style={{ borderColor: "#f59e0b", color: "#f59e0b" }}>
        ⏸ Durdur
      </button>
    </form>
  )
}
