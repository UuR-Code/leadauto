import { FIRM_STATUS_LABELS } from "@/types"

type FunnelItem = { status: string; count: number }

const FUNNEL_ORDER = ["SCRAPED", "PAGE_READY", "DEPLOYED", "SENT", "REPLIED", "MEETING", "CLOSED"]
const FUNNEL_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#22c55e", "#f59e0b", "#f97316", "#ef4444"]

export default function FunnelChart({ data }: { data: FunnelItem[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)

  const ordered = FUNNEL_ORDER.map((s) => ({
    status: s,
    label: FIRM_STATUS_LABELS[s]?.label ?? s,
    count: data.find((d) => d.status === s)?.count ?? 0,
  }))

  return (
    <div className="rounded-xl border" style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: "#1e2d45" }}>
        <h2 className="text-sm font-semibold">Satış Hunisi</h2>
      </div>
      <div className="p-4 space-y-3">
        {ordered.map((item, i) => (
          <div key={item.status} className="flex items-center gap-3">
            <div className="w-20 text-xs text-right flex-shrink-0" style={{ color: "#64748b" }}>
              {item.label}
            </div>
            <div className="flex-1 h-6 rounded overflow-hidden" style={{ background: "#0f1117" }}>
              <div
                className="h-full rounded flex items-center px-2 text-[10px] font-semibold transition-all"
                style={{
                  width: `${Math.max((item.count / max) * 100, item.count > 0 ? 8 : 0)}%`,
                  background: FUNNEL_COLORS[i],
                  color: "white",
                  opacity: 0.9,
                }}
              >
                {item.count > 0 ? item.count : ""}
              </div>
            </div>
            <div className="w-8 text-right text-xs font-semibold flex-shrink-0" style={{ color: "#94a3b8" }}>
              {item.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
