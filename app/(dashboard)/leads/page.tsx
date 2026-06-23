import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function LeadsPage() {
  let leads: any[] = []
  try {
    leads = await prisma.firm.findMany({
      where: { status: { in: ["REPLIED", "MEETING", "CLOSED"] } },
      orderBy: { repliedAt: "desc" },
      include: {
        campaign: { select: { name: true, sector: true } },
        emails: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    })
  } catch (e) {
    console.error("leads query error:", e)
  }

  const stats = {
    replied: leads.filter((l) => l.status === "REPLIED").length,
    meeting: leads.filter((l) => l.status === "MEETING").length,
    closed: leads.filter((l) => l.status === "CLOSED").length,
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
        <div>
          <h1 className="text-base font-semibold">Yanıt Verenler</h1>
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{leads.length} lead</p>
        </div>
        <Link href="/dashboard"
          className="px-3 py-1.5 rounded-lg text-xs font-medium border"
          style={{ background: "#1e2d45", borderColor: "#2d3f5a", color: "#94a3b8" }}>
          ← Dashboard
        </Link>
      </header>

      {/* Stats */}
      <div className="px-6 py-4 border-b flex gap-6 flex-shrink-0" style={{ borderColor: "#1e2d45" }}>
        <Stat label="Yanıt Geldi" value={stats.replied} color="#f59e0b" />
        <Stat label="Toplantı" value={stats.meeting} color="#fb923c" />
        <Stat label="Kapandı / Satış" value={stats.closed} color="#4ade80" />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-slate-400 text-sm">Henüz yanıt yok.</p>
            <p className="text-slate-600 text-xs mt-1">Firmalar maile yanıt verdikçe burada görünecek.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((f) => (
              <div key={f.id} className="rounded-xl border p-4"
                style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">{f.name}</span>
                      <LeadBadge status={f.status} />
                    </div>
                    <div className="flex gap-3 mt-1 text-xs" style={{ color: "#64748b" }}>
                      <span>📍 {f.city}</span>
                      <span>🏷️ {f.campaign?.sector ?? f.category}</span>
                      {f.email && <span>✉️ {f.email}</span>}
                      {f.phone && <span>📞 {f.phone}</span>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {f.repliedAt && (
                      <div className="text-xs" style={{ color: "#4a5568" }}>
                        {new Date(f.repliedAt).toLocaleDateString("tr-TR")}
                      </div>
                    )}
                    {f.demoUrl && (
                      <a href={f.demoUrl} target="_blank" rel="noopener"
                        className="text-xs text-blue-400 hover:underline mt-1 block">
                        Demo ↗
                      </a>
                    )}
                  </div>
                </div>

                {f.replyText && (
                  <div className="mt-3 p-3 rounded-lg text-xs italic"
                    style={{ background: "#0f1117", color: "#94a3b8" }}>
                    "{f.replyText.slice(0, 200)}{f.replyText.length > 200 ? "…" : ""}"
                  </div>
                )}

                {f.meetingAt && (
                  <div className="mt-2 text-xs" style={{ color: "#fb923c" }}>
                    📅 Toplantı: {new Date(f.meetingAt).toLocaleString("tr-TR")}
                    {f.meetingNote && ` — ${f.meetingNote}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#4a5568" }}>{label}</div>
    </div>
  )
}

function LeadBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    REPLIED: { label: "Yanıt Geldi", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    MEETING: { label: "Toplantı",    color: "#fb923c", bg: "rgba(251,146,60,0.1)" },
    CLOSED:  { label: "Kapandı",     color: "#4ade80", bg: "rgba(74,222,128,0.1)" },
  }
  const s = map[status] ?? { label: status, color: "#94a3b8", bg: "transparent" }
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ color: s.color, background: s.bg }}>{s.label}</span>
  )
}
