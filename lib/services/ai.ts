import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type LandingPageContent = {
  heroTitle: string
  heroSub: string
  services: { name: string; description: string }[]
  aboutText: string
  ctaText: string
  colorPrimary: string
}

const SECTOR_CONTEXT: Record<string, string> = {
  restaurant:   "restoran / yemek yeri",
  barber:       "kuaför / berber salonu",
  auto_service: "oto servis / tamirhane",
  dentist:      "diş hekimi / diş kliniği",
  gym:          "spor salonu / fitness merkezi",
  hotel:        "otel / pansiyon",
  cafe:         "kafe / kahve dükkanı",
  pharmacy:     "eczane",
}

const SECTOR_COLORS: Record<string, string> = {
  restaurant:   "#dc2626",
  barber:       "#7c3aed",
  auto_service: "#0284c7",
  dentist:      "#0891b2",
  gym:          "#16a34a",
  hotel:        "#b45309",
  cafe:         "#92400e",
  pharmacy:     "#047857",
}

export async function generateLandingPageContent(
  firmName: string,
  sector: string,
  address: string,
  phone?: string,
): Promise<LandingPageContent> {
  const sectorLabel = SECTOR_CONTEXT[sector] ?? sector

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `"${firmName}" adlı ${sectorLabel} için kısa ve etkileyici bir landing page içeriği oluştur.
Adres: ${address}${phone ? `\nTelefon: ${phone}` : ""}

JSON formatında yanıt ver (başka hiçbir şey yazma):
{
  "heroTitle": "Kısa ve çarpıcı başlık (max 8 kelime)",
  "heroSub": "2 cümlelik açıklama",
  "services": [
    {"name": "Hizmet adı", "description": "Kısa açıklama"},
    {"name": "Hizmet adı", "description": "Kısa açıklama"},
    {"name": "Hizmet adı", "description": "Kısa açıklama"}
  ],
  "aboutText": "İşletme hakkında 2-3 cümle",
  "ctaText": "Harekete geçirici buton metni (max 5 kelime)"
}`,
      },
    ],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("AI response parse failed")

  const content = JSON.parse(jsonMatch[0]) as Omit<LandingPageContent, "colorPrimary">

  return {
    ...content,
    colorPrimary: SECTOR_COLORS[sector] ?? "#2563eb",
  }
}
