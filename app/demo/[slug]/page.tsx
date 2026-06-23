import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const firm = await prisma.firm.findUnique({ where: { demoSlug: slug }, include: { landingPage: true } })
  if (!firm) return { title: "Sayfa Bulunamadı" }
  return { title: `${firm.name} — Demo Site` }
}

export default async function DemoPage({ params }: Props) {
  const { slug } = await params
  const firm = await prisma.firm.findUnique({
    where: { demoSlug: slug },
    include: { landingPage: true },
  })

  if (!firm || !firm.landingPage) notFound()

  const lp = firm.landingPage
  const services = lp.services as { name: string; description: string }[]
  const primary = lp.colorPrimary

  return (
    <div className="min-h-screen" style={{ background: "#0f172a", color: "#e2e8f0" }}>
      {/* Hero */}
      <section
        className="px-6 py-20 text-center"
        style={{ background: `linear-gradient(135deg, ${primary}22, #0f172a)` }}
      >
        {firm.photoUrl && (
          <img src={firm.photoUrl} alt={firm.name} className="w-24 h-24 rounded-2xl object-cover mx-auto mb-6" style={{ outline: `2px solid ${primary}` }} />
        )}
        <div className="text-sm font-medium mb-3" style={{ color: primary }}>{firm.district} · {firm.city}</div>
        <h1 className="text-4xl font-bold mb-4 text-white">{lp.heroTitle}</h1>
        <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: "#94a3b8" }}>{lp.heroSub}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {firm.phone && (
            <a
              href={`tel:${firm.phone}`}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: primary }}
            >
              📞 {lp.ctaText}
            </a>
          )}
          {firm.phone && (
            <a
              href={`https://wa.me/${firm.phone.replace(/\D/g, "")}`}
              className="px-6 py-3 rounded-xl font-semibold border transition-colors hover:bg-white/5"
              style={{ borderColor: primary, color: primary }}
            >
              💬 WhatsApp ile Yaz
            </a>
          )}
        </div>
      </section>

      {/* Services */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10 text-white">Hizmetlerimiz</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <div key={i} className="p-6 rounded-2xl border" style={{ background: "#1e293b", borderColor: "#334155" }}>
              <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center" style={{ background: primary + "33" }}>
                <span style={{ color: primary }}>✦</span>
              </div>
              <h3 className="font-semibold text-white mb-2">{s.name}</h3>
              <p className="text-sm" style={{ color: "#94a3b8" }}>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="px-6 py-12 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">Hakkımızda</h2>
        <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>{lp.aboutText}</p>
      </section>

      {/* Contact */}
      <section className="px-6 py-12" style={{ background: "#1e293b" }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-white">İletişim</h2>
          <div className="space-y-3 text-sm" style={{ color: "#94a3b8" }}>
            <div>📍 {firm.address}</div>
            {firm.phone && <div>📞 {firm.phone}</div>}
          </div>
        </div>
      </section>

      {/* Demo Badge */}
      <div className="fixed bottom-4 right-4 text-xs px-3 py-1.5 rounded-full border" style={{ background: "#1e293b", borderColor: "#334155", color: "#64748b" }}>
        Demo Site
      </div>
    </div>
  )
}
