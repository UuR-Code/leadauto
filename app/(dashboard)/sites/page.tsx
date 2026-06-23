import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function SitesPage() {
  let sites: any[] = []
  try {
    sites = await prisma.firm.findMany({
      where: { status: { in: ["DEPLOYED", "SENT", "REPLIED", "MEETING", "CLOSED"] } },
      orderBy: { deployedAt: "desc" },
      include: { landingPage: true, campaign: { select: { sector: true } } },
      take: 100,
    })
  } catch (e) {
    console.error("sites query error:", e)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
        <div>
          <h1 className="text-base font-semibold">Demo Siteler</h1>
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{sites.length} site yayında</p>
        </div>
        <Link href="/dashboard"
          className="px-3 py-1.5 rounded-lg text-xs font-medium border"
          style={{ background: "#1e2d45", borderColor: "#2d3f5a", color: "#94a3b8" }}>
          ← Dashboard
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">🌐</div>
            <p className="text-slate-400 text-sm">Henüz yayında site yok.</p>
            <p className="text-slate-600 text-xs mt-1">Kampanya başlattıktan sonra siteler burada görünecek.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {sites.map((f) => (
              <div key={f.id} className="rounded-xl border overflow-hidden"
                style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
                {/* Preview header */}
                <div className="h-24 flex items-center justify-center relative"
                  style={{ background: f.landingPage?.colorPrimary ? `${f.landingPage.colorPrimary}22` : "#0f1117" }}>
                  <div className="text-center px-4">
                    <div className="text-sm font-bold text-slate-100 truncate">{f.name}</div>
                    <div className="text-[11px] mt-1" style={{ color: "#64748b" }}>
                      {f.landingPage?.heroSub?.slice(0, 60) ?? f.category}…
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <StatusDot status={f.status} />
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
                    <span>📍 {f.city}</span>
                    <span>·</span>
                    <span>{f.campaign?.sector ?? f.category}</span>
                  </div>

                  {f.landingPage && (
                    <div className="flex flex-wrap gap-1">
                      {(f.landingPage.services as string[]).slice(0, 3).map((s: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px]"
                          style={{ background: "#0f1117", color: "#64748b" }}>{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px]" style={{ color: "#4a5568" }}>
                      {f.deployedAt ? new Date(f.deployedAt).toLocaleDateString("tr-TR") : "—"}
                    </span>
                    {f.demoUrl && (
                      <a href={f.demoUrl} target="_blank" rel="noopener"
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                        style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
                        Siteyi Gör ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    DEPLOYED: "#60a5fa",
    SENT: "#34d399",
    REPLIED: "#f59e0b",
    MEETING: "#fb923c",
    CLOSED: "#4ade80",
  }
  const color = colorMap[status] ?? "#94a3b8"
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: `${color}22`, color }}>
      ● {status === "DEPLOYED" ? "Yayında" : status === "SENT" ? "Mail Gönderildi"
        : status === "REPLIED" ? "Yanıt Geldi" : status === "MEETING" ? "Toplantı" : "Kapandı"}
    </span>
  )
}
