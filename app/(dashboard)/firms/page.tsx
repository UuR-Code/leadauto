import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  SCRAPED:    { label: "Bulundu",      color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  PAGE_READY: { label: "Site Hazır",   color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  DEPLOYED:   { label: "Yayında",      color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  SENT:       { label: "Mail Gönderildi", color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  REPLIED:    { label: "Yanıt Geldi",  color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  MEETING:    { label: "Toplantı",     color: "#fb923c", bg: "rgba(251,146,60,0.1)"  },
  CLOSED:     { label: "Kapandı",      color: "#4ade80", bg: "rgba(74,222,128,0.1)"  },
  SKIPPED:    { label: "Atlandı",      color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
}

export default async function FirmsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page } = await searchParams
  const pageNum = Math.max(1, parseInt(page ?? "1"))
  const pageSize = 25

  const where = status ? { status: status as never } : {}

  let firms: Awaited<ReturnType<typeof prisma.firm.findMany>> = []
  let total = 0
  try {
    ;[firms, total] = await Promise.all([
      prisma.firm.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
        include: { campaign: { select: { name: true, sector: true } } },
      }),
      prisma.firm.count({ where }),
    ])
  } catch (e) {
    console.error("firms query error:", e)
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
        <div>
          <h1 className="text-base font-semibold">Firmalar</h1>
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{total} firma</p>
        </div>
        <Link href="/dashboard"
          className="px-3 py-1.5 rounded-lg text-xs font-medium border"
          style={{ background: "#1e2d45", borderColor: "#2d3f5a", color: "#94a3b8" }}>
          ← Dashboard
        </Link>
      </header>

      {/* Filters */}
      <div className="px-6 py-3 border-b flex gap-2 overflow-x-auto flex-shrink-0"
        style={{ borderColor: "#1e2d45" }}>
        <FilterChip label="Tümü" value="" current={status} />
        {Object.entries(STATUS_MAP).map(([k, v]) => (
          <FilterChip key={k} label={v.label} value={k} current={status} />
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {firms.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-500 text-sm">Firma bulunamadı.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#1e2d45" }}>
                {["Firma", "Sektör / Şehir", "Email", "Durum", "Demo", "Tarih"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] uppercase tracking-wider font-medium"
                    style={{ color: "#4a5568" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {firms.map((f) => {
                const s = STATUS_MAP[f.status] ?? STATUS_MAP.SKIPPED
                return (
                  <tr key={f.id} className="border-b transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: "#0f1117" }}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200 truncate max-w-[180px]">{f.name}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "#4a5568" }}>{f.phone ?? "—"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-400 text-xs">{f.campaign?.sector ?? f.category}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: "#4a5568" }}>{f.city} / {f.district}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{f.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ color: s.color, background: s.bg }}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {f.demoUrl ? (
                        <a href={f.demoUrl} target="_blank" rel="noopener"
                          className="text-blue-400 text-xs hover:underline">Görüntüle ↗</a>
                      ) : <span style={{ color: "#4a5568" }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#4a5568" }}>
                      {new Date(f.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t flex items-center justify-between flex-shrink-0"
          style={{ borderColor: "#1e2d45" }}>
          <span className="text-xs" style={{ color: "#64748b" }}>
            Sayfa {pageNum} / {totalPages}
          </span>
          <div className="flex gap-2">
            {pageNum > 1 && (
              <Link href={`?status=${status ?? ""}&page=${pageNum - 1}`}
                className="px-3 py-1.5 rounded-lg text-xs border"
                style={{ borderColor: "#1e2d45", color: "#94a3b8" }}>← Önceki</Link>
            )}
            {pageNum < totalPages && (
              <Link href={`?status=${status ?? ""}&page=${pageNum + 1}`}
                className="px-3 py-1.5 rounded-lg text-xs border"
                style={{ borderColor: "#1e2d45", color: "#94a3b8" }}>Sonraki →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, value, current }: { label: string; value: string; current?: string }) {
  const active = (current ?? "") === value
  return (
    <Link href={`?status=${value}`}
      className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border transition-colors flex-shrink-0"
      style={{
        background: active ? "rgba(59,130,246,0.15)" : "transparent",
        borderColor: active ? "#3b82f6" : "#1e2d45",
        color: active ? "#60a5fa" : "#64748b",
      }}>
      {label}
    </Link>
  )
}
