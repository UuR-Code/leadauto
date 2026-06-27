import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const MOJIBAKE: [string, string][] = [
  ["Ã‡", "Ç"],  // Ã‡ → Ç
  ["Ã§", "ç"],  // Ã§ → ç
  ["Ä°", "İ"],  // Ä° → İ
  ["Ä±", "ı"],  // Ä± → ı
  ["Äž", "Ğ"],  // Äž → Ğ
  ["ÄŸ", "ğ"],  // ÄŸ → ğ
  ["Åž", "Ş"],  // Åž → Ş
  ["ÅŸ", "ş"],  // ÅŸ → ş
  ["Ã–", "Ö"],  // Ã– → Ö
  ["Ã¶", "ö"],  // Ã¶ → ö
  ["Ãœ", "Ü"],  // Ãœ → Ü
  ["Ã¼", "ü"],  // Ã¼ → ü
]

function fixMojibake(s: string): string {
  let r = s
  for (const [bad, good] of MOJIBAKE) {
    r = r.split(bad).join(good)
  }
  return r
}

export async function POST() {
  const firms = await prisma.firm.findMany({
    select: { id: true, name: true, district: true, city: true, address: true, category: true },
  })

  let firmFixed = 0
  for (const f of firms) {
    const name = fixMojibake(f.name)
    const district = fixMojibake(f.district)
    const city = fixMojibake(f.city)
    const address = fixMojibake(f.address)
    const category = fixMojibake(f.category)
    if (name !== f.name || district !== f.district || city !== f.city || address !== f.address || category !== f.category) {
      await prisma.firm.update({ where: { id: f.id }, data: { name, district, city, address, category } })
      firmFixed++
    }
  }

  const campaigns = await prisma.campaign.findMany({
    select: { id: true, name: true, district: true, city: true, sector: true },
  })

  let campFixed = 0
  for (const c of campaigns) {
    const name = fixMojibake(c.name)
    const district = fixMojibake(c.district)
    const city = fixMojibake(c.city)
    const sector = fixMojibake(c.sector)
    if (name !== c.name || district !== c.district || city !== c.city || sector !== c.sector) {
      await prisma.campaign.update({ where: { id: c.id }, data: { name, district, city, sector } })
      campFixed++
    }
  }

  return NextResponse.json({
    firms: { fixed: firmFixed, total: firms.length },
    campaigns: { fixed: campFixed, total: campaigns.length },
  })
}
