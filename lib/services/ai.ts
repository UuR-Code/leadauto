import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Section types ────────────────────────────────────────────────────────────

export type HeroSection = {
  type: "hero"
  title: string
  subtitle: string
  badge?: string
  ctaText: string
}

export type StatsSection = {
  type: "stats"
  items: { value: string; label: string }[]
}

export type ServicesSection = {
  type: "services"
  title?: string
  items: { name: string; desc: string; icon?: string; price?: string }[]
}

export type MenuSection = {
  type: "menu"
  title?: string
  categories: { name: string; items: { name: string; price?: string; desc?: string }[] }[]
}

export type PricingSection = {
  type: "pricing"
  title?: string
  plans: { name: string; price: string; period?: string; features: string[]; highlighted?: boolean }[]
}

export type ScheduleSection = {
  type: "schedule"
  title?: string
  days: { day: string; hours: string }[]
}

export type TeamSection = {
  type: "team"
  title?: string
  members: { name: string; role: string; highlight?: string }[]
}

export type TestimonialsSection = {
  type: "testimonials"
  title?: string
  items: { text: string; author: string; rating: number }[]
}

export type FaqSection = {
  type: "faq"
  title?: string
  items: { question: string; answer: string }[]
}

export type AboutSection = {
  type: "about"
  title?: string
  text: string
  highlights?: string[]
}

export type ContactSection = {
  type: "contact"
  note?: string
}

export type PageSection =
  | HeroSection
  | StatsSection
  | ServicesSection
  | MenuSection
  | PricingSection
  | ScheduleSection
  | TeamSection
  | TestimonialsSection
  | FaqSection
  | AboutSection
  | ContactSection

export type PageBlueprint = {
  theme: {
    primaryColor: string
    accentColor: string
    style: "modern" | "elegant" | "warm" | "clinical" | "energetic" | "professional"
    darkMode: boolean
  }
  meta: {
    title: string
    description: string
  }
  sections: PageSection[]
}

// ─── Legacy type kept for reference ──────────────────────────────────────────

export type LandingPageContent = {
  heroTitle: string
  heroSub: string
  services: { name: string; description: string }[]
  aboutText: string
  ctaText: string
  colorPrimary: string
}

// ─── Blueprint generator ──────────────────────────────────────────────────────

export async function generatePageBlueprint(params: {
  firmName: string
  sector: string
  city: string
  district: string
  address: string
  phone?: string
  rating?: number
  reviewCount?: number
}): Promise<PageBlueprint> {
  const { firmName, sector, city, district, address, phone, rating, reviewCount } = params

  const prompt = `Sen uzman bir Türk web tasarımcısısın. Yerel işletmeler için yüksek dönüşümlü landing page'ler oluşturuyorsun.

İŞLETME BİLGİLERİ:
- Ad: "${firmName}"
- Sektör: "${sector}"
- Konum: ${district}, ${city}
- Adres: ${address}${phone ? `\n- Telefon: ${phone}` : ""}${rating ? `\n- Google Puanı: ${rating}/5 (${reviewCount ?? 0} değerlendirme)` : ""}

GÖREVİN:
1. Bu sektörde müşterilerin ne aradığını, rakip sitelerin ne sunduğunu düşün
2. Bu işletme türü için en etkili sayfa yapısını belirle (gereksiz bölüm koyma)
3. Sektöre ve hedef kitleye uygun renk ve tasarım stili seç
4. Türkçe, özgün, spesifik ve ikna edici içerik yaz (genel kalıplardan kaçın)

KULLANILABİLECEK BÖLÜMLER (sadece uygun olanları seç):

"hero" — Zorunlu. Ana başlık ve çağrı.
Schema: { "type": "hero", "title": "güçlü başlık (max 8 kelime)", "subtitle": "2 cümle açıklama", "badge": "rozet (ör: '5 Yıldız Google Puanı', 'ISO Belgeli') veya omit", "ctaText": "buton metni" }

"stats" — Rakamlarla güven. Ör: yıl deneyim, müşteri sayısı, memnuniyet oranı.
Schema: { "type": "stats", "items": [{ "value": "10+", "label": "Yıl Deneyim" }] }

"services" — Hizmet/ürün kartları. Her karta ikon emojisi ekle.
Schema: { "type": "services", "title": "bölüm başlığı", "items": [{ "name": "...", "desc": "2 cümle", "icon": "🔧", "price": "fiyat veya omit" }] }

"menu" — Sadece yiyecek/içecek işletmeleri için. Gerçekçi fiyatlar yaz.
Schema: { "type": "menu", "title": "...", "categories": [{ "name": "kategori", "items": [{ "name": "ürün", "price": "₺XX", "desc": "kısa açıklama veya omit" }] }] }

"pricing" — Üyelik, paket, abonelik satan işletmeler için.
Schema: { "type": "pricing", "title": "...", "plans": [{ "name": "...", "price": "₺XX", "period": "aylık/yıllık/seans", "features": ["özellik1", "özellik2"], "highlighted": true/false }] }

"schedule" — Spor salonu, kurs, klinik için ders/seans programı VEYA çalışma saatleri.
Schema: { "type": "schedule", "title": "...", "days": [{ "day": "Pazartesi", "hours": "09:00 - 20:00" }] }

"team" — Uzmanlık önemli olan sektörler için (klinik, danışmanlık, hukuk, güzellik).
Schema: { "type": "team", "title": "...", "members": [{ "name": "Ad Soyad", "role": "Unvan", "highlight": "uzmanlık notu" }] }

"testimonials" — Müşteri yorumları (gerçekçi, sektöre özel, 3 adet).
Schema: { "type": "testimonials", "title": "...", "items": [{ "text": "yorum", "author": "Ad S.", "rating": 5 }] }

"faq" — Sık sorulan sorular (bu sektörde insanların gerçekten sorduğu şeyler).
Schema: { "type": "faq", "title": "...", "items": [{ "question": "...", "answer": "..." }] }

"about" — Kısa tanıtım ve öne çıkan özellikler.
Schema: { "type": "about", "title": "...", "text": "2-3 cümle", "highlights": ["Sertifikalı", "Güvenilir", "Hızlı Servis"] }

"contact" — Zorunlu, en sona koy.
Schema: { "type": "contact", "note": "ek bilgi veya omit" }

SADECE geçerli JSON döndür. Markdown, açıklama, kod bloğu yok:
{
  "theme": {
    "primaryColor": "#hex",
    "accentColor": "#hex",
    "style": "modern|elegant|warm|clinical|energetic|professional",
    "darkMode": true|false
  },
  "meta": {
    "title": "SEO başlık (max 60 karakter)",
    "description": "meta açıklama (max 155 karakter)"
  },
  "sections": [ ...bölümler... ]
}`

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`AI blueprint parse failed. Response: ${text.slice(0, 200)}`)

  const blueprint = JSON.parse(jsonMatch[0]) as PageBlueprint
  if (!blueprint.sections || !Array.isArray(blueprint.sections)) {
    throw new Error("Invalid blueprint: missing sections array")
  }

  return blueprint
}
