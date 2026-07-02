import { prisma } from "@/lib/prisma"
import type { Suppression } from "@prisma/client"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function SuppressionsPage() {
  const suppressions = await prisma.suppression.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
        <div>
          <h1 className="text-base font-semibold">Engelliler Listesi</h1>
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{suppressions.length} e-posta — bunlara mail gönderilmez</p>
        </div>
        <Link href="/dashboard"
          className="px-3 py-1.5 rounded-lg text-xs font-medium border"
          style={{ background: "#1e2d45", borderColor: "#2d3f5a", color: "#94a3b8" }}>
          ← Dashboard
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {suppressions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-slate-400 text-sm">Engellenen e-posta yok.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#1e2d45" }}>
                {["E-posta", "Sebep", "Tarih"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] uppercase tracking-wider font-medium"
                    style={{ color: "#4a5568" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppressions.map((s: Suppression) => (
                <tr key={s.id} className="border-b" style={{ borderColor: "#0f1117" }}>
                  <td className="px-4 py-3 text-slate-200">{s.email}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{s.reason ?? "—"}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#4a5568" }}>
                    {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
