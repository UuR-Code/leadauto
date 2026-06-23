export type { Campaign, Firm, LandingPage, EmailLog } from "@prisma/client"
export type { CampaignStatus, FirmStatus, EmailStatus } from "@prisma/client"

export const SECTORS = [
  { value: "restaurant", label: "Restoran", emoji: "🍽️" },
  { value: "barber", label: "Kuaför / Berber", emoji: "💈" },
  { value: "auto_service", label: "Oto Servis", emoji: "🔧" },
  { value: "dentist", label: "Diş Hekimi", emoji: "🦷" },
  { value: "gym", label: "Spor Salonu", emoji: "💪" },
  { value: "hotel", label: "Otel / Pansiyon", emoji: "🏨" },
  { value: "cafe", label: "Kafe", emoji: "☕" },
  { value: "pharmacy", label: "Eczane", emoji: "💊" },
] as const

export const CITIES = [
  {
    value: "istanbul",
    label: "İstanbul",
    districts: [
      "Bakırköy", "Kadıköy", "Beşiktaş", "Şişli", "Üsküdar",
      "Maltepe", "Ataşehir", "Fatih", "Beyoğlu", "Sarıyer",
      "Pendik", "Kartal", "Bağcılar", "Bahçelievler", "Zeytinburnu",
    ],
  },
  {
    value: "ankara",
    label: "Ankara",
    districts: ["Çankaya", "Keçiören", "Mamak", "Yenimahalle", "Altındağ", "Etimesgut"],
  },
  {
    value: "izmir",
    label: "İzmir",
    districts: ["Konak", "Karşıyaka", "Bornova", "Buca", "Çiğli", "Bayraklı"],
  },
  {
    value: "bursa",
    label: "Bursa",
    districts: ["Osmangazi", "Nilüfer", "Yıldırım", "Görükle"],
  },
  {
    value: "antalya",
    label: "Antalya",
    districts: ["Muratpaşa", "Kepez", "Konyaaltı", "Lara"],
  },
] as const

export const FIRM_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  SCRAPED:   { label: "Bulundu",    color: "purple" },
  PAGE_READY:{ label: "Site Hazır", color: "yellow" },
  DEPLOYED:  { label: "Deploy OK",  color: "blue"   },
  SENT:      { label: "Gönderildi", color: "cyan"   },
  REPLIED:   { label: "Yanıt Verdi",color: "green"  },
  MEETING:   { label: "Görüşme",    color: "orange" },
  CLOSED:    { label: "Kapandı",    color: "emerald"},
  SKIPPED:   { label: "Atlandı",    color: "gray"   },
}
