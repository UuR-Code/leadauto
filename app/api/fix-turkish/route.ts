import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Fix corrupted Turkish chars stored as '?' in DB
// Pattern: specific known Turkish city/district names
const DISTRICT_MAP: Record<string, string> = {
  "?ankaya": "Çankaya", "cankaya": "Çankaya",
  "?stanbul": "İstanbul",
  "kad?k?y": "Kadıköy", "kad?köy": "Kadıköy",
  "be?ikta?": "Beşiktaş",
  "ba?ak?ehir": "Başakşehir",
  "?i?li": "Şişli", "si?li": "Şişli",
  "?sk?dar": "Üsküdar",
  "bey?lu": "Beyoğlu",
  "g?ng?ren": "Güngören",
  "k???kçekmece": "Küçükçekmece",
  "ba?c?lar": "Bağcılar",
  "g?ztepe": "Göztepe",
  "?lçe": "İlçe",
  "mamak": "Mamak",
  "ankara": "Ankara",
  "istanbul": "İstanbul",
}

function fixField(val: string): string {
  const lower = val.toLowerCase()
  return DISTRICT_MAP[lower] ?? DISTRICT_MAP[val] ?? val
}

const REPL = "�"  // Unicode replacement character (stored when encoding fails)
const Q = "\\?"

// Generic: replace U+FFFD or '?' with correct Turkish chars using context
function fixGeneric(val: string): string {
  return val
    // U+FFFD variants
    .replace(new RegExp(`${REPL}ankaya`, "gi"), "Çankaya")
    .replace(new RegExp(`${REPL}stanbul`, "gi"), "İstanbul")
    .replace(new RegExp(`Kad${REPL}k${REPL}y`, "gi"), "Kadıköy")
    .replace(new RegExp(`Kad${REPL}köy`, "gi"), "Kadıköy")
    .replace(new RegExp(`Be${REPL}ikta${REPL}`, "gi"), "Beşiktaş")
    .replace(new RegExp(`Ba${REPL}ak${REPL}ehir`, "gi"), "Başakşehir")
    .replace(new RegExp(`${REPL}i${REPL}li`, "gi"), "Şişli")
    .replace(new RegExp(`${REPL}sk${REPL}dar`, "gi"), "Üsküdar")
    .replace(new RegExp(`Bey${REPL}lu`, "gi"), "Beyoğlu")
    .replace(new RegExp(`G${REPL}ng${REPL}ren`, "gi"), "Güngören")
    .replace(new RegExp(`K${REPL}${REPL}${REPL}kçekmece`, "gi"), "Küçükçekmece")
    .replace(new RegExp(`Ba${REPL}c${REPL}lar`, "gi"), "Bağcılar")
    .replace(new RegExp(`G${REPL}ztepe`, "gi"), "Göztepe")
    .replace(new RegExp(`${REPL}zmir`, "gi"), "İzmir")
    .replace(new RegExp(`Bursa`, "gi"), "Bursa")
    // literal '?' variants
    .replace(/\?ankaya/gi, "Çankaya")
    .replace(/\?stanbul/gi, "İstanbul")
    .replace(/Kad\?k\?y/gi, "Kadıköy")
}

export async function POST() {
  const firms = await prisma.firm.findMany({
    select: { id: true, district: true, city: true, name: true, address: true },
  })

  let fixed = 0
  for (const f of firms) {
    const d = fixField(f.district) !== f.district ? fixField(f.district) : fixGeneric(f.district)
    const c = fixField(f.city) !== f.city ? fixField(f.city) : fixGeneric(f.city)
    const n = fixGeneric(f.name)
    const a = fixGeneric(f.address)

    if (d !== f.district || c !== f.city || n !== f.name || a !== f.address) {
      await prisma.firm.update({
        where: { id: f.id },
        data: { district: d, city: c, name: n, address: a },
      })
      fixed++
    }
  }

  // Also fix campaigns
  const campaigns = await prisma.campaign.findMany({
    select: { id: true, district: true, city: true },
  })
  let cfixed = 0
  for (const c of campaigns) {
    const d = fixField(c.district) !== c.district ? fixField(c.district) : fixGeneric(c.district)
    const ci = fixField(c.city) !== c.city ? fixField(c.city) : fixGeneric(c.city)
    if (d !== c.district || ci !== c.city) {
      await prisma.campaign.update({ where: { id: c.id }, data: { district: d, city: ci } })
      cfixed++
    }
  }

  return NextResponse.json({ firms: { fixed, total: firms.length }, campaigns: { fixed: cfixed, total: campaigns.length } })
}
