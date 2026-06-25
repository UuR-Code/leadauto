import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type {
  PageBlueprint,
  PageSection,
  HeroSection,
  StatsSection,
  ServicesSection,
  MenuSection,
  PricingSection,
  ScheduleSection,
  TeamSection,
  TestimonialsSection,
  FaqSection,
  AboutSection,
} from "@/lib/services/ai"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const firm = await prisma.firm.findUnique({
    where: { demoSlug: slug },
    include: { landingPage: true },
  })
  if (!firm) return { title: "Sayfa Bulunamadı" }
  const bp = firm.landingPage?.blueprint as PageBlueprint | null
  return {
    title: bp?.meta.title ?? `${firm.name} — Demo Site`,
    description: bp?.meta.description ?? `${firm.name} resmi web sitesi.`,
  }
}

// ─── Theme helpers ────────────────────────────────────────────────────────────

type ThemeVars = {
  primary: string
  accent: string
  bg: string
  bgMid: string
  bgCard: string
  text: string
  textMuted: string
  border: string
  dark: boolean
}

function getTheme(bp: PageBlueprint): ThemeVars {
  const dark = bp.theme.darkMode
  return {
    primary: bp.theme.primaryColor,
    accent: bp.theme.accentColor,
    bg: dark ? "#0f172a" : "#ffffff",
    bgMid: dark ? "#1e293b" : "#f8fafc",
    bgCard: dark ? "#1e293b" : "#ffffff",
    text: dark ? "#e2e8f0" : "#1e293b",
    textMuted: dark ? "#94a3b8" : "#64748b",
    border: dark ? "#334155" : "#e2e8f0",
    dark,
  }
}

type FirmRow = {
  name: string
  district: string
  city: string
  address: string
  phone: string | null
  photoUrl: string | null
}

// ─── Section renderers ────────────────────────────────────────────────────────

function NavBar({ firm, t, bp }: { firm: FirmRow; t: ThemeVars; bp: PageBlueprint }) {
  const navLinks = bp.sections
    .filter((s) => !["hero", "contact"].includes(s.type))
    .slice(0, 4)
    .map((s) => {
      const labels: Record<string, string> = {
        services: "Hizmetler", menu: "Menü", pricing: "Fiyatlar",
        team: "Ekip", about: "Hakkımızda", testimonials: "Yorumlar",
        faq: "SSS", stats: "Rakamlar", schedule: "Program",
      }
      return { href: `#${s.type}`, label: labels[s.type] ?? s.type }
    })

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: t.dark ? "rgba(15,23,42,0.95)" : "rgba(255,255,255,0.95)",
      backdropFilter: "blur(12px)",
      borderBottom: `1px solid ${t.border}`,
      padding: "0 24px",
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <span style={{ fontWeight: 800, fontSize: 17, color: t.primary }}>{firm.name}</span>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} style={{
              color: t.textMuted, textDecoration: "none", fontSize: 14,
              fontWeight: 500, display: "none",
            }}
              className="nav-link"
            >{l.label}</a>
          ))}
          {firm.phone && (
            <a href={`tel:${firm.phone}`} style={{
              background: t.primary, color: "#fff",
              padding: "8px 20px", borderRadius: 8,
              fontSize: 13, fontWeight: 700, textDecoration: "none",
            }}>📞 Ara</a>
          )}
        </div>
      </div>
    </nav>
  )
}

function Hero({ s, t, firm }: { s: HeroSection; t: ThemeVars; firm: FirmRow }) {
  return (
    <section id="hero" style={{
      background: `linear-gradient(135deg, ${t.primary}18 0%, ${t.bg} 60%)`,
      padding: "80px 24px 72px",
      textAlign: "center",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {firm.photoUrl && (
          <img
            src={firm.photoUrl}
            alt={firm.name}
            style={{
              width: 100, height: 100, borderRadius: 24,
              objectFit: "cover", margin: "0 auto 24px", display: "block",
              boxShadow: `0 0 0 4px ${t.primary}40, 0 8px 32px rgba(0,0,0,0.15)`,
            }}
          />
        )}
        {s.badge && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: `${t.primary}18`, color: t.primary,
            padding: "6px 18px", borderRadius: 999,
            fontSize: 13, fontWeight: 600, marginBottom: 20,
            border: `1px solid ${t.primary}30`,
          }}>
            ✦ {s.badge}
          </div>
        )}
        <h1 style={{
          fontSize: "clamp(30px, 5.5vw, 56px)", fontWeight: 900,
          color: t.dark ? "#fff" : "#0f172a",
          marginBottom: 18, lineHeight: 1.15, letterSpacing: "-0.02em",
        }}>{s.title}</h1>
        <p style={{
          fontSize: 18, color: t.textMuted,
          maxWidth: 540, margin: "0 auto 36px", lineHeight: 1.75,
        }}>{s.subtitle}</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          {firm.phone && (
            <a href={`tel:${firm.phone}`} style={{
              background: t.primary, color: "#fff",
              padding: "14px 32px", borderRadius: 12,
              fontWeight: 700, fontSize: 15, textDecoration: "none",
              boxShadow: `0 4px 20px ${t.primary}50`,
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>📞 {s.ctaText}</a>
          )}
          {firm.phone && (
            <a href={`https://wa.me/${firm.phone.replace(/\D/g, "")}`} style={{
              background: "#25D366", color: "#fff",
              padding: "14px 32px", borderRadius: 12,
              fontWeight: 700, fontSize: 15, textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}>💬 WhatsApp</a>
          )}
        </div>
        <div style={{ marginTop: 28, color: t.textMuted, fontSize: 13 }}>
          📍 {firm.district}, {firm.city}
        </div>
      </div>
    </section>
  )
}

function Stats({ s, t }: { s: StatsSection; t: ThemeVars }) {
  return (
    <section id="stats" style={{ background: t.bgMid, padding: "48px 24px", borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}>
      <div style={{
        maxWidth: 900, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(s.items.length, 4)}, 1fr)`,
        gap: 24, textAlign: "center",
      }}>
        {s.items.map((item, i) => (
          <div key={i}>
            <div style={{ fontSize: 36, fontWeight: 900, color: t.primary, lineHeight: 1 }}>{item.value}</div>
            <div style={{ fontSize: 13, color: t.textMuted, marginTop: 6, fontWeight: 500 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Services({ s, t }: { s: ServicesSection; t: ThemeVars }) {
  const cols = s.items.length <= 2 ? s.items.length : s.items.length <= 4 ? 2 : 3
  return (
    <section id="services" style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 48 }}>
          {s.title ?? "Hizmetlerimiz"}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`, gap: 24 }}>
          {s.items.map((item, i) => (
            <div key={i} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 20, padding: 28,
              boxShadow: t.dark ? "none" : "0 2px 16px rgba(0,0,0,0.06)",
              transition: "transform 0.2s",
            }}>
              {item.icon && (
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${t.primary}18`, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 26, marginBottom: 18,
                }}>{item.icon}</div>
              )}
              <h3 style={{ fontWeight: 700, color: t.dark ? "#fff" : "#0f172a", marginBottom: 8, fontSize: 17 }}>{item.name}</h3>
              <p style={{ color: t.textMuted, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              {item.price && (
                <div style={{ color: t.primary, fontWeight: 700, fontSize: 16, marginTop: 14 }}>{item.price}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Menu({ s, t }: { s: MenuSection; t: ThemeVars }) {
  return (
    <section id="menu" style={{ padding: "80px 24px", background: t.bgMid }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 48 }}>
          {s.title ?? "Menümüz"}
        </h2>
        {s.categories.map((cat, ci) => (
          <div key={ci} style={{ marginBottom: 40 }}>
            <h3 style={{
              fontSize: 18, fontWeight: 700, color: t.primary,
              marginBottom: 16, paddingBottom: 12,
              borderBottom: `2px solid ${t.primary}30`,
            }}>{cat.name}</h3>
            <div style={{ display: "grid", gap: 12 }}>
              {cat.items.map((item, ii) => (
                <div key={ii} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  background: t.bgCard, border: `1px solid ${t.border}`,
                  borderRadius: 12, padding: "14px 18px",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: t.dark ? "#fff" : "#0f172a", fontSize: 15 }}>{item.name}</div>
                    {item.desc && <div style={{ color: t.textMuted, fontSize: 13, marginTop: 3 }}>{item.desc}</div>}
                  </div>
                  {item.price && (
                    <div style={{ color: t.primary, fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", marginLeft: 16 }}>{item.price}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Pricing({ s, t }: { s: PricingSection; t: ThemeVars }) {
  return (
    <section id="pricing" style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 48 }}>
          {s.title ?? "Fiyatlarımız"}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(240px, 1fr))`, gap: 24 }}>
          {s.plans.map((plan, i) => (
            <div key={i} style={{
              background: plan.highlighted ? t.primary : t.bgCard,
              border: `2px solid ${plan.highlighted ? t.primary : t.border}`,
              borderRadius: 24, padding: 32, textAlign: "center",
              boxShadow: plan.highlighted ? `0 8px 40px ${t.primary}40` : t.dark ? "none" : "0 2px 16px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: plan.highlighted ? "#fff" : t.dark ? "#fff" : "#0f172a", marginBottom: 8 }}>{plan.name}</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: plan.highlighted ? "#fff" : t.primary, lineHeight: 1, marginBottom: 4 }}>{plan.price}</div>
              {plan.period && <div style={{ fontSize: 13, color: plan.highlighted ? "rgba(255,255,255,0.75)" : t.textMuted, marginBottom: 24 }}>/ {plan.period}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}>
                {plan.features.map((f, fi) => (
                  <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: plan.highlighted ? "rgba(255,255,255,0.9)" : t.text }}>
                    <span style={{ color: plan.highlighted ? "#fff" : t.primary, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Schedule({ s, t }: { s: ScheduleSection; t: ThemeVars }) {
  return (
    <section id="schedule" style={{ padding: "80px 24px", background: t.bgMid }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 40 }}>
          {s.title ?? "Çalışma Saatleri"}
        </h2>
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 20, overflow: "hidden" }}>
          {s.days.map((d, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "14px 24px",
              borderBottom: i < s.days.length - 1 ? `1px solid ${t.border}` : "none",
              background: i % 2 === 0 ? "transparent" : t.dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            }}>
              <span style={{ fontWeight: 600, color: t.dark ? "#fff" : "#0f172a", fontSize: 15 }}>{d.day}</span>
              <span style={{ color: t.primary, fontWeight: 600, fontSize: 15 }}>{d.hours}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Team({ s, t }: { s: TeamSection; t: ThemeVars }) {
  return (
    <section id="team" style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 48 }}>
          {s.title ?? "Ekibimiz"}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
          {s.members.map((m, i) => (
            <div key={i} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 20, padding: 28, textAlign: "center",
              boxShadow: t.dark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: `${t.primary}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, margin: "0 auto 16px",
              }}>👤</div>
              <div style={{ fontWeight: 700, color: t.dark ? "#fff" : "#0f172a", fontSize: 16 }}>{m.name}</div>
              <div style={{ color: t.primary, fontSize: 13, fontWeight: 600, marginTop: 4 }}>{m.role}</div>
              {m.highlight && <div style={{ color: t.textMuted, fontSize: 13, marginTop: 8 }}>{m.highlight}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Testimonials({ s, t }: { s: TestimonialsSection; t: ThemeVars }) {
  const stars = (n: number) => "★".repeat(Math.min(5, Math.max(0, n))) + "☆".repeat(Math.max(0, 5 - n))
  return (
    <section id="testimonials" style={{ padding: "80px 24px", background: t.bgMid }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 48 }}>
          {s.title ?? "Müşteri Yorumları"}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {s.items.map((item, i) => (
            <div key={i} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 20, padding: 28,
              boxShadow: t.dark ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
            }}>
              <div style={{ color: "#f59e0b", fontSize: 18, marginBottom: 12 }}>{stars(item.rating)}</div>
              <p style={{ color: t.text, lineHeight: 1.7, fontSize: 15, fontStyle: "italic", margin: "0 0 16px" }}>
                &ldquo;{item.text}&rdquo;
              </p>
              <div style={{ color: t.primary, fontWeight: 600, fontSize: 14 }}>— {item.author}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Faq({ s, t }: { s: FaqSection; t: ThemeVars }) {
  return (
    <section id="faq" style={{ padding: "80px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 40 }}>
          {s.title ?? "Sık Sorulan Sorular"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {s.items.map((item, i) => (
            <details key={i} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 14, overflow: "hidden",
            }}>
              <summary style={{
                padding: "18px 22px", fontWeight: 600,
                color: t.dark ? "#fff" : "#0f172a", fontSize: 15,
                cursor: "pointer", listStyle: "none", userSelect: "none",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                {item.question}
                <span style={{ color: t.primary, fontSize: 20, flexShrink: 0, marginLeft: 12 }}>+</span>
              </summary>
              <div style={{ padding: "0 22px 18px", color: t.textMuted, fontSize: 14, lineHeight: 1.7 }}>
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function About({ s, t }: { s: AboutSection; t: ThemeVars }) {
  return (
    <section id="about" style={{ padding: "80px 24px", background: t.bgMid }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 20 }}>
          {s.title ?? "Hakkımızda"}
        </h2>
        <p style={{ color: t.textMuted, lineHeight: 1.8, fontSize: 16, marginBottom: s.highlights ? 32 : 0 }}>{s.text}</p>
        {s.highlights && s.highlights.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {s.highlights.map((h, i) => (
              <span key={i} style={{
                background: `${t.primary}18`, color: t.primary,
                border: `1px solid ${t.primary}30`,
                padding: "6px 16px", borderRadius: 999,
                fontSize: 14, fontWeight: 600,
              }}>✓ {h}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function Contact({ firm, t, note }: { firm: FirmRow; t: ThemeVars; note?: string }) {
  return (
    <section id="contact" style={{ padding: "80px 24px", background: t.dark ? "#0a1020" : "#f1f5f9" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 40 }}>
          İletişim
        </h2>
        <div style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: 24, padding: 36,
          boxShadow: t.dark ? "none" : "0 4px 24px rgba(0,0,0,0.08)",
        }}>
          <div style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>📍</div>
              <div>
                <div style={{ fontWeight: 600, color: t.dark ? "#fff" : "#0f172a", marginBottom: 2 }}>Adres</div>
                <div style={{ color: t.textMuted, fontSize: 15 }}>{firm.address}</div>
              </div>
            </div>
            {firm.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>📞</div>
                <div>
                  <div style={{ fontWeight: 600, color: t.dark ? "#fff" : "#0f172a", marginBottom: 2 }}>Telefon</div>
                  <a href={`tel:${firm.phone}`} style={{ color: t.primary, fontSize: 15, textDecoration: "none", fontWeight: 600 }}>{firm.phone}</a>
                </div>
              </div>
            )}
            {note && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ fontSize: 24, flexShrink: 0 }}>ℹ️</div>
                <div style={{ color: t.textMuted, fontSize: 15 }}>{note}</div>
              </div>
            )}
          </div>
          {firm.phone && (
            <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
              <a href={`tel:${firm.phone}`} style={{
                flex: 1, background: t.primary, color: "#fff",
                padding: "13px 20px", borderRadius: 12,
                fontWeight: 700, fontSize: 15, textDecoration: "none",
                textAlign: "center", minWidth: 140,
              }}>📞 Hemen Ara</a>
              <a href={`https://wa.me/${firm.phone.replace(/\D/g, "")}`} style={{
                flex: 1, background: "#25D366", color: "#fff",
                padding: "13px 20px", borderRadius: 12,
                fontWeight: 700, fontSize: 15, textDecoration: "none",
                textAlign: "center", minWidth: 140,
              }}>💬 WhatsApp</a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function renderSection(section: PageSection, t: ThemeVars, firm: FirmRow) {
  switch (section.type) {
    case "hero":        return <Hero key="hero" s={section} t={t} firm={firm} />
    case "stats":       return <Stats key="stats" s={section} t={t} />
    case "services":    return <Services key="services" s={section} t={t} />
    case "menu":        return <Menu key="menu" s={section} t={t} />
    case "pricing":     return <Pricing key="pricing" s={section} t={t} />
    case "schedule":    return <Schedule key="schedule" s={section} t={t} />
    case "team":        return <Team key="team" s={section} t={t} />
    case "testimonials":return <Testimonials key="testimonials" s={section} t={t} />
    case "faq":         return <Faq key="faq" s={section} t={t} />
    case "about":       return <About key="about" s={section} t={t} />
    case "contact":     return <Contact key="contact" firm={firm} t={t} note={section.note} />
    default:            return null
  }
}

// ─── Legacy renderer (firms without blueprint) ────────────────────────────────

function LegacyPage({ firm, lp }: { firm: FirmRow; lp: { heroTitle: string; heroSub: string; services: unknown; aboutText: string; ctaText: string; colorPrimary: string } }) {
  const primary = lp.colorPrimary
  const services = lp.services as { name: string; description: string }[]
  return (
    <div style={{ background: "#0f172a", color: "#e2e8f0", minHeight: "100vh" }}>
      <section style={{ padding: "80px 24px 60px", textAlign: "center", background: `linear-gradient(135deg, ${primary}22, #0f172a)` }}>
        {firm.photoUrl && <img src={firm.photoUrl} alt={firm.name} style={{ width: 96, height: 96, borderRadius: 20, objectFit: "cover", margin: "0 auto 24px", display: "block", outline: `2px solid ${primary}` }} />}
        <div style={{ fontSize: 13, color: primary, marginBottom: 12 }}>{firm.district} · {firm.city}</div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: "#fff", marginBottom: 16 }}>{lp.heroTitle}</h1>
        <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 520, margin: "0 auto 32px" }}>{lp.heroSub}</p>
        {firm.phone && (
          <a href={`tel:${firm.phone}`} style={{ background: primary, color: "#fff", padding: "14px 28px", borderRadius: 12, fontWeight: 700, textDecoration: "none" }}>{lp.ctaText}</a>
        )}
      </section>
      <section style={{ padding: "64px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
          {services.map((s, i) => (
            <div key={i} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 24 }}>
              <h3 style={{ color: "#fff", marginBottom: 8 }}>{s.name}</h3>
              <p style={{ color: "#94a3b8", fontSize: 14 }}>{s.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: "48px 24px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ color: "#fff", marginBottom: 16 }}>Hakkımızda</h2>
        <p style={{ color: "#94a3b8", lineHeight: 1.8 }}>{lp.aboutText}</p>
      </section>
      <section style={{ padding: "48px 24px", background: "#1e293b", textAlign: "center" }}>
        <div style={{ color: "#94a3b8", fontSize: 14 }}>📍 {firm.address}{firm.phone && ` · 📞 ${firm.phone}`}</div>
      </section>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default async function DemoPage({ params }: Props) {
  const { slug } = await params
  const firm = await prisma.firm.findUnique({
    where: { demoSlug: slug },
    include: { landingPage: true },
  })

  if (!firm || !firm.landingPage) notFound()

  const lp = firm.landingPage
  const blueprint = lp.blueprint as PageBlueprint | null

  const firmRow: FirmRow = {
    name: firm.name,
    district: firm.district,
    city: firm.city,
    address: firm.address,
    phone: firm.phone,
    photoUrl: firm.photoUrl,
  }

  if (!blueprint) {
    return (
      <>
        <LegacyPage firm={firmRow} lp={{
          heroTitle: lp.heroTitle,
          heroSub: lp.heroSub,
          services: lp.services,
          aboutText: lp.aboutText,
          ctaText: lp.ctaText,
          colorPrimary: lp.colorPrimary,
        }} />
        <div style={{ position: "fixed", bottom: 16, right: 16, fontSize: 12, padding: "6px 14px", borderRadius: 999, background: "#1e293b", border: "1px solid #334155", color: "#64748b" }}>
          Demo Site
        </div>
      </>
    )
  }

  const t = getTheme(blueprint)

  return (
    <>
      <style>{`
        html { scroll-behavior: smooth; }
        @media (min-width: 640px) { .nav-link { display: block !important; } }
        details summary::-webkit-details-marker { display: none; }
        details[open] summary span:last-child { transform: rotate(45deg); display: inline-block; }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      `}</style>
      <div style={{ background: t.bg, color: t.text, minHeight: "100vh" }}>
        <NavBar firm={firmRow} t={t} bp={blueprint} />
        {blueprint.sections.map((section, i) => (
          <div key={i}>{renderSection(section, t, firmRow)}</div>
        ))}
        <footer style={{ background: t.dark ? "#080f1a" : "#f1f5f9", borderTop: `1px solid ${t.border}`, padding: "28px 24px", textAlign: "center" }}>
          <div style={{ color: t.textMuted, fontSize: 13 }}>{blueprint.meta.title}</div>
          <div style={{ color: t.border, fontSize: 12, marginTop: 6 }}>Bu site demo amaçlıdır.</div>
        </footer>
        <div style={{ position: "fixed", bottom: 16, right: 16, fontSize: 12, padding: "6px 14px", borderRadius: 999, background: t.bgCard, border: `1px solid ${t.border}`, color: t.textMuted }}>
          Demo Site
        </div>
      </div>
    </>
  )
}
