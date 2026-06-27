import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import type {
  PageBlueprint, PageSection, HeroSection, StatsSection, ServicesSection,
  MenuSection, PricingSection, ScheduleSection, TeamSection, TestimonialsSection,
  FaqSection, AboutSection, GallerySection, VideoSection, ComparisonSection, LogosSection,
} from "@/lib/services/ai"
import { HeroSlider } from "./HeroSlider"
import { FloatingCTA } from "./FloatingCTA"
import { NavBarClient } from "./NavBarClient"
import { StatCounter } from "./StatCounter"
import { ExitIntent } from "./ExitIntent"
import { Gallery } from "./Gallery"
import { ContactForm } from "./ContactForm"

// ─── Sector image library (Unsplash stable photo IDs) ────────────────────────

const SECTOR_PHOTOS: Record<string, string[]> = {
  gym: [
    "1534438327429-1f3cb61d6a35",
    "1571902943202-507ec2618e8f",
    "1517836357463-d25dfeac3438",
    "1581009146145-b5ef050c2e1e",
  ],
  spor: [
    "1534438327429-1f3cb61d6a35",
    "1571902943202-507ec2618e8f",
    "1581009146145-b5ef050c2e1e",
    "1549060279-7e168fcee0c2",
  ],
  restaurant: [
    "1414235077428-338989a2e8c0",
    "1555396273-367ea4eb4db5",
    "1466637574441-749b8f19452f",
    "1544025162-d76694265947",
  ],
  restoran: [
    "1414235077428-338989a2e8c0",
    "1555396273-367ea4eb4db5",
    "1466637574441-749b8f19452f",
    "1544025162-d76694265947",
  ],
  cafe: [
    "1501339847302-ac426a4a7cbb",
    "1495474472287-4d71bcdd2085",
    "1442512595331-e89bad46a7b3",
    "1447933601428-9abf002b9a69",
  ],
  barber: [
    "1503951914875-452162b0f3f1",
    "1521590832167-7bcbfaa6381f",
    "1599351431613-18ef1fdd27e1",
    "1605497788044-5a32c7078486",
  ],
  kuafor: [
    "1560066984-138dadb4c035",
    "1522337360788-8b13dee7a37e",
    "1599351431613-18ef1fdd27e1",
    "1521590832167-7bcbfaa6381f",
  ],
  dental: [
    "1588776814546-1ffbb4d18d6b",
    "1609840114035-3c981b782dfe",
    "1598256987236-8836eed163ba",
  ],
  doktor: [
    "1559757148-5c350d0d3c56",
    "1576091160399-112ba8d25d1d",
    "1581056771392-c13f8b63a547",
  ],
  oto: [
    "1503376780353-7e6692767b70",
    "1486006920555-c77dcf18193c",
    "1542362567-b07e54358753",
  ],
  default: [
    "1486406913551-ed72e35db2c2",
    "1497366216548-37526070297c",
    "1560179707-f14e90ef3623",
  ],
}

function getSectorImages(sector: string, photoUrl: string | null): string[] {
  const key = Object.keys(SECTOR_PHOTOS).find(k => sector.toLowerCase().includes(k)) ?? "default"
  const ids = SECTOR_PHOTOS[key]
  const unsplash = ids.map(id => `https://images.unsplash.com/photo-${id}?w=1920&q=80&auto=format&fit=crop`)
  // Put the firm's own Google photo first if available
  return photoUrl ? [photoUrl, ...unsplash.slice(0, 2)] : unsplash.slice(0, 3)
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const firm = await prisma.firm.findUnique({
    where: { demoSlug: slug },
    include: { landingPage: true },
  })
  if (!firm) return { title: "Sayfa Bulunamadı" }
  const bp = firm.landingPage?.blueprint as PageBlueprint | null
  const title = bp?.meta.title ?? `${firm.name} — ${firm.district}, ${firm.city}`
  const description = bp?.meta.description ?? `${firm.name} — ${firm.district}, ${firm.city}. Hizmetlerimiz için hemen arayın.`
  const ogImage = firm.photoUrl ?? `https://images.unsplash.com/photo-1486406913551-ed72e35db2c2?w=1200&q=80`
  return {
    title,
    description,
    keywords: (bp?.meta as any)?.keywords ?? [firm.category, firm.city, firm.district],
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: firm.name }],
      type: "website",
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
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

function getNavLinks(bp: PageBlueprint) {
  const labels: Record<string, string> = {
    services: "Hizmetler", menu: "Menü", pricing: "Fiyatlar",
    team: "Ekip", about: "Hakkımızda", testimonials: "Yorumlar",
    faq: "SSS", stats: "Rakamlar", schedule: "Program",
    gallery: "Galeri", video: "Video", comparison: "Neden Biz",
  }
  return bp.sections
    .filter(s => !["hero", "contact", "logos"].includes(s.type))
    .slice(0, 5)
    .map(s => ({ href: `#${s.type}`, label: labels[s.type] ?? s.type }))
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
    <section id="stats" style={{ background: t.bgMid, padding: "64px 24px", borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}>
      <div style={{
        maxWidth: 900, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(s.items.length, 4)}, 1fr)`,
        gap: 32,
      }}>
        {s.items.map((item, i) => (
          <StatCounter key={i} value={item.value} label={item.label} primary={t.primary} textMuted={t.textMuted} delay={i * 120} />
        ))}
      </div>
    </section>
  )
}

function Services({ s, t }: { s: ServicesSection; t: ThemeVars }) {
  return (
    <section id="services" style={{ padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="section-title" style={{ textAlign: "center", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 16 }}>
          {s.title ?? "Hizmetlerimiz"}
        </h2>
        <p className="section-title" data-delay="100" style={{ textAlign: "center", color: t.textMuted, fontSize: 16, maxWidth: 480, margin: "0 auto 56px" }}>
          Kaliteli ve profesyonel hizmet anlayışımızla yanınızdayız.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`, gap: 24 }}>
          {s.items.map((item, i) => (
            <div key={i} className="reveal-card" data-delay={String(i * 80)} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 24, padding: 32,
              boxShadow: t.dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
              transition: "transform 0.25s, box-shadow 0.25s",
            }}>
              {item.icon && (
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `linear-gradient(135deg, ${t.primary}30, ${t.accent ?? t.primary}18)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, marginBottom: 20,
                }}>{item.icon}</div>
              )}
              <h3 style={{ fontWeight: 700, color: t.dark ? "#fff" : "#0f172a", marginBottom: 10, fontSize: 18 }}>{item.name}</h3>
              <p style={{ color: t.textMuted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              {item.price && (
                <div style={{
                  color: t.primary, fontWeight: 800, fontSize: 18, marginTop: 20,
                  paddingTop: 16, borderTop: `1px solid ${t.border}`,
                }}>{item.price}</div>
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
            <div key={i} className={`reveal-card ${plan.highlighted ? "shimmer-card" : ""}`} data-delay={String(i * 100)} style={{
              background: plan.highlighted ? t.primary : t.bgCard,
              border: `2px solid ${plan.highlighted ? t.primary : t.border}`,
              borderRadius: 24, padding: 32, textAlign: "center",
              boxShadow: plan.highlighted ? `0 12px 48px ${t.primary}50` : t.dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
              position: "relative", overflow: "hidden",
              transform: plan.highlighted ? "scale(1.04)" : "scale(1)",
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
    <section id="testimonials" style={{ padding: "96px 24px", background: t.bgMid }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="section-title" style={{ textAlign: "center", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 56 }}>
          {s.title ?? "Müşteri Yorumları"}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {s.items.map((item, i) => (
            <div key={i} className="reveal-card" data-delay={String(i * 100)} style={{
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 24, padding: 32,
              boxShadow: t.dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
              position: "relative",
            }}>
              <div style={{ color: "#f59e0b", fontSize: 20, marginBottom: 16, letterSpacing: 2 }}>{stars(item.rating)}</div>
              <p style={{ color: t.text, lineHeight: 1.8, fontSize: 15, fontStyle: "italic", margin: "0 0 20px" }}>
                &ldquo;{item.text}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.primary}, ${t.accent ?? t.primary})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 16,
                }}>{item.author.charAt(0)}</div>
                <div style={{ color: t.dark ? "#fff" : "#0f172a", fontWeight: 700, fontSize: 14 }}>{item.author}</div>
              </div>
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
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(firm.address + " " + firm.city)}&output=embed&hl=tr&z=16`
  return (
    <section id="contact" style={{ padding: "96px 24px 0", background: t.dark ? "#0a1020" : "#f1f5f9" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="section-title" style={{ textAlign: "center", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 56 }}>
          Bize Ulaşın
        </h2>

        {/* Two-column: info + map */}
        <div className="contact-grid" style={{ display: "flex", gap: 24, alignItems: "stretch", marginBottom: 0 }}>

          {/* Info card */}
          <div className="reveal" style={{
            flex: "0 0 340px",
            background: t.bgCard, border: `1px solid ${t.border}`,
            borderRadius: 24, padding: 36,
            boxShadow: t.dark ? "0 4px 32px rgba(0,0,0,0.4)" : "0 4px 32px rgba(0,0,0,0.08)",
            display: "flex", flexDirection: "column", gap: 24,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: `${t.primary}20`, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>📍</div>
              <div>
                <div style={{ fontWeight: 700, color: t.dark ? "#fff" : "#0f172a", marginBottom: 4, fontSize: 15 }}>Adres</div>
                <div style={{ color: t.textMuted, fontSize: 14, lineHeight: 1.6 }}>{firm.address}</div>
                <div style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>{firm.district}, {firm.city}</div>
              </div>
            </div>

            {firm.phone && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: `${t.primary}20`, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>📞</div>
                <div>
                  <div style={{ fontWeight: 700, color: t.dark ? "#fff" : "#0f172a", marginBottom: 4, fontSize: 15 }}>Telefon</div>
                  <a href={`tel:${firm.phone}`} style={{ color: t.primary, fontSize: 16, textDecoration: "none", fontWeight: 700 }}>{firm.phone}</a>
                </div>
              </div>
            )}

            {note && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: `${t.primary}20`, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>ℹ️</div>
                <div style={{ color: t.textMuted, fontSize: 14, lineHeight: 1.6 }}>{note}</div>
              </div>
            )}

            {firm.phone && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
                <a href={`tel:${firm.phone}`} style={{
                  background: t.primary, color: "#fff",
                  padding: "14px 20px", borderRadius: 12,
                  fontWeight: 800, fontSize: 15, textDecoration: "none",
                  textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: `0 4px 20px ${t.primary}50`,
                }}>📞 Hemen Ara</a>
                <a href={`https://wa.me/${firm.phone.replace(/\D/g, "")}`} style={{
                  background: "#25D366", color: "#fff",
                  padding: "14px 20px", borderRadius: 12,
                  fontWeight: 800, fontSize: 15, textDecoration: "none",
                  textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>💬 WhatsApp ile Yaz</a>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="reveal map-container" data-delay="150" style={{
            flex: 1, minHeight: 420, borderRadius: 24, overflow: "hidden",
            border: `1px solid ${t.border}`,
            boxShadow: t.dark ? "0 4px 32px rgba(0,0,0,0.4)" : "0 4px 32px rgba(0,0,0,0.08)",
          }}>
            <iframe
              className="map-iframe"
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Konum"
              style={{ filter: t.dark ? "invert(90%) hue-rotate(180deg)" : "none" }}
            />
          </div>
        </div>
      </div>

      {/* Bottom wave into footer */}
      <div style={{ marginTop: 80 }}>
        <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }} preserveAspectRatio="none">
          <path d={`M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z`} fill={t.dark ? "#080f1a" : "#e8edf5"} />
        </svg>
      </div>
    </section>
  )
}

function GallerySec({ s, t, sector }: { s: GallerySection; t: ThemeVars; sector: string }) {
  const base = (s.keywords.length > 0 ? s.keywords : [sector]).slice(0, 6)
  const images = base.map((kw, i) =>
    `https://images.unsplash.com/photo-${GALLERY_SEEDS[sector.toLowerCase()]?.[i] ?? GALLERY_SEEDS.default[i % GALLERY_SEEDS.default.length]}?w=800&q=75&auto=format&fit=crop`
  )
  return (
    <section id="gallery" style={{ padding: "96px 24px", background: t.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="section-title" style={{ textAlign: "center", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 48 }}>
          {s.title ?? "Galerimiz"}
        </h2>
        <Gallery images={images} primary={t.primary} />
      </div>
    </section>
  )
}

const GALLERY_SEEDS: Record<string, string[]> = {
  gym: ["1534438327429-1f3cb61d6a35","1571902943202-507ec2618e8f","1581009146145-b5ef050c2e1e","1549060279-7e168fcee0c2","1517836357463-d25dfeac3438","1546519638-68e109498ffc"],
  spor: ["1534438327429-1f3cb61d6a35","1571902943202-507ec2618e8f","1581009146145-b5ef050c2e1e","1549060279-7e168fcee0c2","1517836357463-d25dfeac3438","1546519638-68e109498ffc"],
  restaurant: ["1414235077428-338989a2e8c0","1555396273-367ea4eb4db5","1466637574441-749b8f19452f","1544025162-d76694265947","1482049016688-2d3e1ae5817","1504674900247-0877df9cc836"],
  restoran: ["1414235077428-338989a2e8c0","1555396273-367ea4eb4db5","1466637574441-749b8f19452f","1544025162-d76694265947","1482049016688-2d3e1ae5817","1504674900247-0877df9cc836"],
  barber: ["1503951914875-452162b0f3f1","1521590832167-7bcbfaa6381f","1599351431613-18ef1fdd27e1","1605497788044-5a32c7078486","1503951914875-452162b0f3f1","1521590832167-7bcbfaa6381f"],
  kuafor: ["1560066984-138dadb4c035","1522337360788-8b13dee7a37e","1599351431613-18ef1fdd27e1","1521590832167-7bcbfaa6381f","1560066984-138dadb4c035","1522337360788-8b13dee7a37e"],
  default: ["1486406913551-ed72e35db2c2","1497366216548-37526070297c","1560179707-f14e90ef3623","1504384308-abb1890a8ded","1432888498266-38ffec3eaf0a","1497366754035-f200968a2fc5"],
}

function VideoSec({ s, t }: { s: VideoSection; t: ThemeVars }) {
  const thumb = `https://images.unsplash.com/photo-${GALLERY_SEEDS.default[0]}?w=1280&q=80&auto=format&fit=crop`
  return (
    <section id="video" style={{ padding: "96px 24px", background: t.bgMid }}>
      <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <h2 className="section-title" style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 16 }}>
          {s.title ?? "Bizi Tanıyın"}
        </h2>
        {s.subtitle && (
          <p className="section-title" data-delay="100" style={{ color: t.textMuted, fontSize: 16, marginBottom: 40 }}>{s.subtitle}</p>
        )}
        <div className="reveal" style={{
          borderRadius: 24, overflow: "hidden", position: "relative",
          aspectRatio: "16/9", background: "#000",
          boxShadow: "0 16px 64px rgba(0,0,0,0.4)",
        }}>
          {s.youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${s.youtubeId}?rel=0`}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <>
              <img src={thumb} alt="Video" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6 }} />
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28,
                }}>▶️</div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function ComparisonSec({ s, t }: { s: ComparisonSection; t: ThemeVars }) {
  return (
    <section id="comparison" style={{ padding: "96px 24px", background: t.bg }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 className="section-title" style={{ textAlign: "center", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, color: t.dark ? "#fff" : "#0f172a", marginBottom: 56 }}>
          {s.title ?? "Neden Bizi Seçmelisiniz?"}
        </h2>
        <div className="reveal" style={{
          background: t.bgCard, border: `1px solid ${t.border}`,
          borderRadius: 24, overflow: "hidden",
          boxShadow: t.dark ? "0 4px 32px rgba(0,0,0,0.4)" : "0 4px 32px rgba(0,0,0,0.08)",
        }}>
          {/* Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 120px 120px",
            background: t.bgMid, padding: "16px 24px",
            borderBottom: `1px solid ${t.border}`,
          }}>
            <div style={{ color: t.textMuted, fontSize: 13, fontWeight: 600 }}>Özellik</div>
            <div style={{ textAlign: "center", color: t.primary, fontWeight: 800, fontSize: 14 }}>{s.us}</div>
            <div style={{ textAlign: "center", color: t.textMuted, fontWeight: 600, fontSize: 13 }}>{s.them}</div>
          </div>
          {s.features.map((f, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 120px 120px",
              padding: "14px 24px",
              borderBottom: i < s.features.length - 1 ? `1px solid ${t.border}` : "none",
              background: i % 2 === 0 ? "transparent" : t.dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            }}>
              <div style={{ color: t.dark ? "#e2e8f0" : "#1e293b", fontSize: 14, fontWeight: 500 }}>{f.label}</div>
              <div style={{ textAlign: "center" }}>
                {f.us === true ? <span style={{ color: t.primary, fontWeight: 700 }}>✓</span>
                  : f.us === false ? <span style={{ color: "#ef4444" }}>✗</span>
                    : <span style={{ color: t.primary, fontSize: 12, fontWeight: 600 }}>{f.us}</span>}
              </div>
              <div style={{ textAlign: "center" }}>
                {f.them === true ? <span style={{ color: "#10b981" }}>✓</span>
                  : f.them === false ? <span style={{ color: "#94a3b8" }}>✗</span>
                    : <span style={{ color: t.textMuted, fontSize: 12 }}>{f.them}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LogosSec({ s, t }: { s: LogosSection; t: ThemeVars }) {
  return (
    <section id="logos" style={{ padding: "64px 24px", background: t.bgMid, borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}` }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <p className="section-title" style={{ textAlign: "center", color: t.textMuted, fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 32 }}>
          {s.title ?? "Sertifikalar & Üyelikler"}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center", alignItems: "center" }}>
          {s.items.map((item, i) => (
            <div key={i} className="reveal-card" data-delay={String(i * 80)} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderRadius: 12, padding: "12px 20px",
              boxShadow: t.dark ? "none" : "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 14, color: t.dark ? "#e2e8f0" : "#0f172a" }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WaveDivider({ from, to, flip = false }: { from: string; to: string; flip?: boolean }) {
  const path = flip
    ? "M0,0 C360,60 1080,0 1440,0 L1440,0 L0,0 Z"
    : "M0,60 C360,0 1080,60 1440,0 L1440,60 L0,60 Z"
  return (
    <div style={{ background: from, lineHeight: 0, marginBottom: -1 }}>
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", width: "100%" }} preserveAspectRatio="none">
        <path d={path} fill={to} />
      </svg>
    </div>
  )
}

function CTABanner({ t, firm }: { t: ThemeVars; firm: FirmRow }) {
  return (
    <>
      <WaveDivider from={t.bg} to={t.primary} />
      <section style={{
        background: `linear-gradient(135deg, ${t.primary} 0%, ${t.accent ?? t.primary}cc 100%)`,
        padding: "80px 24px", textAlign: "center",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div className="section-title" style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.15)", color: "#fff",
            padding: "6px 20px", borderRadius: 999,
            fontSize: 13, fontWeight: 600, marginBottom: 24, letterSpacing: "0.05em",
          }}>✦ Hemen Harekete Geçin</div>
          <h2 className="section-title" data-delay="100" style={{
            fontSize: "clamp(28px,4.5vw,48px)", fontWeight: 900, color: "#fff",
            marginBottom: 16, lineHeight: 1.12, letterSpacing: "-0.02em",
          }}>
            Bugün Başlayın, Farkı Hissedin
          </h2>
          <p className="section-title" data-delay="150" style={{
            fontSize: 18, color: "rgba(255,255,255,0.85)",
            marginBottom: 40, lineHeight: 1.7,
          }}>
            Profesyonel hizmet ve kaliteli deneyim için bizi arayın. İlk görüşme ücretsiz.
          </p>
          {firm.phone && (
            <div className="reveal" data-delay="200" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={`tel:${firm.phone}`} style={{
                background: "#fff", color: t.primary,
                padding: "16px 40px", borderRadius: 14,
                fontWeight: 800, fontSize: 16, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 10,
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}>📞 {firm.phone}</a>
              <a href={`https://wa.me/${firm.phone.replace(/\D/g, "")}`} style={{
                background: "#25D366", color: "#fff",
                padding: "16px 40px", borderRadius: 14,
                fontWeight: 800, fontSize: 16, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 10,
                boxShadow: "0 8px 24px rgba(37,211,102,0.4)",
              }}>💬 WhatsApp</a>
            </div>
          )}
        </div>
      </section>
      <WaveDivider from={t.primary} to={t.dark ? "#0a1020" : "#f1f5f9"} flip />
    </>
  )
}

function renderSection(section: PageSection, t: ThemeVars, firm: FirmRow, sector = "") {
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
    case "contact":     return <Contact key="contact" firm={firm} t={t} note={(section as any).note} />
    case "gallery":     return <GallerySec key="gallery" s={section as GallerySection} t={t} sector={sector} />
    case "video":       return <VideoSec key="video" s={section as VideoSection} t={t} />
    case "comparison":  return <ComparisonSec key="comparison" s={section as ComparisonSection} t={t} />
    case "logos":       return <LogosSec key="logos" s={section as LogosSection} t={t} />
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

  const heroSection = blueprint.sections.find(s => s.type === "hero") as HeroSection | undefined
  const scheduleSection = blueprint.sections.find(s => s.type === "schedule") as import("@/lib/services/ai").ScheduleSection | undefined
  const nonHeroSections = blueprint.sections.filter(s => s.type !== "hero")
  const sliderImages = getSectorImages(firm.category, firm.photoUrl)
  const navLinks = getNavLinks(blueprint)

  // Open/closed badge
  let openBadge: string | undefined
  if (scheduleSection) {
    const now = new Date()
    const days = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"]
    const today = days[now.getDay()]
    const todayRow = scheduleSection.days.find(d => d.day === today)
    if (todayRow && todayRow.hours !== "Kapalı" && todayRow.hours.includes("-")) {
      const [startStr, endStr] = todayRow.hours.split("-").map(s => s.trim())
      const toMin = (hhmm: string) => { const [h,m] = hhmm.split(":").map(Number); return (h||0)*60+(m||0) }
      const cur = now.getHours()*60+now.getMinutes()
      openBadge = cur >= toMin(startStr) && cur < toMin(endStr) ? "🟢 Şu An Açık" : "🔴 Şu An Kapalı"
    } else if (todayRow?.hours === "Kapalı") {
      openBadge = "🔴 Bugün Kapalı"
    }
  }

  // Fake customer counter (based on firm name hash for consistency)
  const fakeCount = 1200 + (firm.name.split("").reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % 800)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: firmRow.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: firmRow.address,
      addressLocality: firmRow.district,
      addressRegion: firmRow.city,
      addressCountry: "TR",
    },
    ...(firmRow.phone ? { telephone: firmRow.phone } : {}),
    ...(firmRow.photoUrl ? { image: firmRow.photoUrl } : {}),
    description: blueprint.meta.description,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        html { scroll-behavior: smooth; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        @media (min-width: 640px) { .nav-link { display: block !important; } }
        details summary::-webkit-details-marker { display: none; }
        details[open] summary span:last-child { transform: rotate(45deg); display: inline-block; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .reveal { opacity: 0; }
        .reveal.visible { animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards; }
        .reveal-card { opacity: 0; }
        .reveal-card.visible { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
        .section-title { opacity: 0; }
        .section-title.visible { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer-card::after {
          content: '';
          position: absolute; inset: 0; border-radius: inherit;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          background-size: 400px 100%;
          animation: shimmer 2.5s infinite linear;
          pointer-events: none;
        }
        .phone-fab {
          position: fixed; bottom: 96px; right: 20px; z-index: 150;
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; text-decoration: none; color: #fff;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .phone-fab:hover { transform: scale(1.12); }
        .map-iframe { border: 0; width: 100%; height: 100%; }
        @media (max-width: 768px) {
          .contact-grid { flex-direction: column !important; }
          .map-container { height: 240px !important; }
        }
      `}</style>

      {/* Intersection Observer script */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          var io = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) {
              if (e.isIntersecting) {
                var el = e.target;
                var delay = el.dataset.delay || 0;
                setTimeout(function() { el.classList.add('visible'); }, delay);
                io.unobserve(el);
              }
            });
          }, { threshold: 0.12 });
          function observe() {
            document.querySelectorAll('.reveal,.reveal-card,.section-title').forEach(function(el) { io.observe(el); });
          }
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', observe);
          } else {
            observe();
          }
        })();
      ` }} />

      <div style={{ background: t.bg, color: t.text, minHeight: "100vh" }}>
        <NavBarClient
          firmName={firmRow.name}
          phone={firmRow.phone}
          primary={t.primary}
          dark={t.dark}
          border={t.border}
          textMuted={t.textMuted}
          navLinks={navLinks}
        />

        {/* Full-screen hero slider */}
        <HeroSlider
          images={sliderImages}
          firmName={firmRow.name}
          district={firmRow.district}
          city={firmRow.city}
          phone={firmRow.phone}
          primary={t.primary}
          title={heroSection?.title ?? firmRow.name}
          subtitle={heroSection?.subtitle ?? ""}
          ctaText={heroSection?.ctaText ?? "Hemen Ara"}
          badge={heroSection?.badge}
        />

        {/* Open/closed badge + social links + fake customer counter */}
        <div style={{
          background: t.bgMid, borderBottom: `1px solid ${t.border}`,
          padding: "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexWrap: "wrap", gap: 16,
        }}>
          {openBadge && (
            <span style={{
              fontSize: 13, fontWeight: 700,
              color: openBadge.startsWith("🟢") ? "#10b981" : "#ef4444",
            }}>{openBadge}</span>
          )}
          {(heroSection as any)?.nearbyBadge && (
            <span style={{ fontSize: 13, color: t.textMuted, fontWeight: 600 }}>
              📍 {(heroSection as any).nearbyBadge}
            </span>
          )}
          <span style={{ fontSize: 13, color: t.textMuted }}>
            👥 <strong style={{ color: t.dark ? "#fff" : "#0f172a" }}>{fakeCount.toLocaleString("tr-TR")}+</strong> mutlu müşteri
          </span>
          {(heroSection as any)?.socialLinks && (heroSection as any).socialLinks.length > 0 && (
            <div style={{ display: "flex", gap: 10 }}>
              {((heroSection as any).socialLinks as { platform: string; url: string }[]).map((sl, i) => {
                const icons: Record<string, string> = { instagram: "📸", facebook: "👍", twitter: "🐦", youtube: "▶️", tiktok: "🎵" }
                return (
                  <a key={i} href={sl.url} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 18, textDecoration: "none",
                    opacity: 0.8, transition: "opacity 0.2s",
                  }}>{icons[sl.platform] ?? "🔗"}</a>
                )
              })}
            </div>
          )}
        </div>

        {/* Rest of sections (no hero, no contact) */}
        {nonHeroSections.filter(s => s.type !== "contact").map((section, i) => (
          <div key={i} className="reveal" data-delay={String(i * 60)}>
            {renderSection(section, t, firmRow, firm.category)}
          </div>
        ))}

        {/* Mid-page CTA banner */}
        <CTABanner t={t} firm={firmRow} />

        {/* Contact section with map + form */}
        {(() => {
          const contactSection = nonHeroSections.find(s => s.type === "contact")
          return contactSection ? renderSection(contactSection, t, firmRow, firm.category) : <Contact firm={firmRow} t={t} />
        })()}

        {/* Contact form */}
        <section style={{ padding: "0 24px 80px", background: t.dark ? "#0a1020" : "#f1f5f9" }}>
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <ContactForm
              firmId={firm.id}
              firmName={firmRow.name}
              primary={t.primary}
              bgCard={t.bgCard}
              border={t.border}
              textMuted={t.textMuted}
              dark={t.dark}
            />
          </div>
        </section>

        <footer style={{
          background: t.dark ? "#080f1a" : "#e8edf5",
          padding: "32px 24px", textAlign: "center",
        }}>
          <div style={{ color: t.dark ? "#fff" : "#0f172a", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{firmRow.name}</div>
          <div style={{ color: t.textMuted, fontSize: 13 }}>{blueprint.meta.description}</div>
          <div style={{ color: t.border, fontSize: 12, marginTop: 10 }}>Bu site demo amaçlıdır.</div>
        </footer>

        {/* Floating bottom CTA bar */}
        {firmRow.phone && (
          <FloatingCTA phone={firmRow.phone} primary={t.primary} firmName={firmRow.name} />
        )}

        {/* Sticky round phone button */}
        {firmRow.phone && (
          <a href={`tel:${firmRow.phone}`} className="phone-fab"
            style={{ background: t.primary, boxShadow: `0 4px 24px ${t.primary}60` }}>
            📞
          </a>
        )}

        {/* Exit intent popup */}
        {firmRow.phone && (
          <ExitIntent phone={firmRow.phone} firmName={firmRow.name} primary={t.primary} />
        )}

        {/* Demo badge */}
        <div style={{ position: "fixed", top: 80, right: 12, fontSize: 11, padding: "4px 10px", borderRadius: 999, background: t.bgCard, border: `1px solid ${t.border}`, color: t.textMuted, zIndex: 50, opacity: 0.8 }}>
          Demo
        </div>
      </div>
    </>
  )
}
