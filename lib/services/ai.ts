import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── Section types ────────────────────────────────────────────────────────────

export type HeroSection = {
  type: "hero"
  title: string
  subtitle: string
  badge?: string
  ctaText: string
  socialLinks?: { platform: "instagram" | "facebook" | "twitter" | "youtube" | "tiktok"; url: string }[]
  nearbyBadge?: string
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

export type GallerySection = {
  type: "gallery"
  title?: string
  keywords: string[]
}

export type VideoSection = {
  type: "video"
  title?: string
  subtitle?: string
  youtubeId?: string
  thumbnailKeyword: string
}

export type ComparisonSection = {
  type: "comparison"
  title?: string
  us: string
  them: string
  features: { label: string; us: boolean | string; them: boolean | string }[]
}

export type LogosSection = {
  type: "logos"
  title?: string
  items: { name: string; icon: string }[]
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
  | GallerySection
  | VideoSection
  | ComparisonSection
  | LogosSection

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
    keywords: string[]
  }
  sections: PageSection[]
}

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

"hero" — Zorunlu.
Schema: { "type": "hero", "title": "güçlü başlık (max 8 kelime)", "subtitle": "2 cümle", "badge": "rozet veya omit", "ctaText": "buton metni", "socialLinks": [{"platform": "instagram", "url": "https://instagram.com/[kullaniciadi]"}], "nearbyBadge": "${district}'nın En İyi [sektör ismi]" }

"stats" — Rakamlarla güven.
Schema: { "type": "stats", "items": [{ "value": "10+", "label": "Yıl Deneyim" }] }

"services" — Hizmet kartları, ikon emojisi ekle.
Schema: { "type": "services", "title": "...", "items": [{ "name": "...", "desc": "2 cümle", "icon": "🔧", "price": "veya omit" }] }

"menu" — Sadece yiyecek/içecek.
Schema: { "type": "menu", "title": "...", "categories": [{ "name": "kategori", "items": [{ "name": "ürün", "price": "₺XX", "desc": "veya omit" }] }] }

"pricing" — Paket/abonelik satan işletmeler.
Schema: { "type": "pricing", "title": "...", "plans": [{ "name": "...", "price": "₺XX", "period": "aylık", "features": ["özellik"], "highlighted": false }] }

"schedule" — Spor/kurs/klinik için program veya çalışma saatleri.
Schema: { "type": "schedule", "title": "...", "days": [{ "day": "Pazartesi", "hours": "09:00 - 20:00" }] }

"team" — Uzmanlık önemli sektörler için.
Schema: { "type": "team", "title": "...", "members": [{ "name": "Ad Soyad", "role": "Unvan", "highlight": "not" }] }

"testimonials" — 3 gerçekçi müşteri yorumu.
Schema: { "type": "testimonials", "title": "...", "items": [{ "text": "yorum", "author": "Ad S.", "rating": 5 }] }

"faq" — Sektöre gerçekten sorulan sorular.
Schema: { "type": "faq", "title": "...", "items": [{ "question": "...", "answer": "..." }] }

"about" — Kısa tanıtım.
Schema: { "type": "about", "title": "...", "text": "2-3 cümle", "highlights": ["Sertifikalı", "Güvenilir"] }

"gallery" — Fotoğraf galerisi. İngilizce arama anahtar kelimeleri gir (Unsplash için).
Schema: { "type": "gallery", "title": "Galeri", "keywords": ["gym interior", "workout equipment", "fitness class"] }

"video" — Tanıtım video bölümü.
Schema: { "type": "video", "title": "Bizi Tanıyın", "subtitle": "2 cümle", "thumbnailKeyword": "gym workout" }

"comparison" — Neden biz? Rakip karşılaştırma tablosu.
Schema: { "type": "comparison", "title": "Neden Bizi Seçmelisiniz?", "us": "${firmName}", "them": "Diğer Firmalar", "features": [{ "label": "Sertifikalı Uzman Kadro", "us": true, "them": false }, { "label": "7/24 Destek", "us": true, "them": "Sınırlı" }] }

"logos" — Referans markalar, sertifikalar, üyeolunan dernekler.
Schema: { "type": "logos", "title": "Sertifikalar & Üyelikler", "items": [{ "name": "ISO 9001", "icon": "🏆" }] }

"contact" — Zorunlu, en sona.
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
    "description": "meta açıklama (max 155 karakter)",
    "keywords": ["anahtar kelime1", "anahtar kelime2"]
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
