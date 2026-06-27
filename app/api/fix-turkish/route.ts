import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Reverse UTF-8 → CP1252 → UTF-8 double-encoding (mojibake)
// Each entry: [corrupted string in DB, correct Turkish char]
const MOJIBAKE: [string, string][] = [
  ["Ã‡", "Ç"],   // C3 87 double-encoded
  ["Ã§",     "ç"],   // C3 A7 double-encoded
  ["Ä°",     "İ"],   // C4 B0 double-encoded
  ["Ä±",     "ı"],   // C4 B1 double-encoded
  ["Äž",     "Ğ"],   // C4 9E double-encoded (0x9E cp1252 = U+017E ž)
  ["ÄŸ",     "ğ"],   // C4 9F double-encoded (0x9F cp1252 = U+0178 Ÿ)
  ["Åž", "Ş"],  // C5 9E double-encoded
  ["ÅŸ",     "ş"],   // C5 9F double-encoded
  ["Ã–", "Ö"],  // C3 96 double-encoded (0x96 cp1252 = U+2013 –)
  ["Ã¶",     "ö"],   // C3 B6 double-encoded
  ["Ãœ",     "Ü"],   // C3 9C double-encoded (0x9C cp1252 = U+0153 œ)
  ["Ã¼",     "ü"],   // C3 BC double-encoded
  ["Ã‚",     "Â"],   // generic fix
  ["Ã", "Â"],
  ["â", "\""], // curly quote
  ["â", "\""],
]

function fixMojibake(s: string): string {
  let r = s
  for (const [bad, good] of MOJIBAKE) {
    r = r.split(bad).join(good)
  }
  return r
}

async function fixTable(
  rows: { id: string; [k: string]: string }[],
  fields: string[],
  update: (id: string, data: Record<string, string>) => Promise<void>
) {
  let fixed = 0
  for (const row of rows) {
    const changes: Record<string, string> = {}
    for (const f of fields) {
      const v = row[f] ?? ""
      const fixed_v = fixMojibake(v)
      if (fixed_v !== v) changes[f] = fixed_v
    }
    if (Object.keys(changes).length > 0) {
      await update(row.id, changes)
      fixed++
    }
  }
  return fixed
}

export async function POST() {
  const firms = await prisma.firm.findMany({
    select: { id: true, name: true, district: true, city: true, address: true, category: true },
  }) as any[]

  const firmFixed = await fixTable(firms, ["name", "district", "city", "address", "category"], (id, data) =>
    prisma.firm.update({ where: { id }, data })
  )

  const campaigns = await prisma.campaign.findMany({
    select: { id: true, name: true, district: true, city: true, sector: true },
  }) as any[]

  const campFixed = await fixTable(campaigns, ["name", "district", "city", "sector"], (id, data) =>
    prisma.campaign.update({ where: { id }, data })
  )

  return NextResponse.json({
    firms: { fixed: firmFixed, total: firms.length },
    campaigns: { fixed: campFixed, total: campaigns.length },
  })
}
