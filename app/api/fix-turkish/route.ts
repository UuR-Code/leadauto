import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Reverse CP1252 → UTF-8 double-encoding using raw SQL REPLACE chains
// Each pair: (corrupted_utf8_hex, correct_char)
// Double-encoded Turkish chars via CP1252:
//   Ç  = C3 87 → 'Ã' (C3 83) + '‡' cp1252 (E2 80 A1)  → c383e280a1
//   ç  = C3 A7 → 'Ã' + '§'        (C2 A7)              → c383c2a7
//   İ  = C4 B0 → 'Ä' (C3 84) + '°'(C2 B0)              → c384c2b0
//   ı  = C4 B1 → 'Ä' + '±'        (C2 B1)              → c384c2b1
//   Ğ  = C4 9E → 'Ä' + 'ž' cp1252 (C5 BE)              → c384c5be
//   ğ  = C4 9F → 'Ä' + 'Ÿ' cp1252 (C5 B8... no, 0x9F cp1252 = U+0178 = C5 B8)
//   Ş  = C5 9E → 'Å' (C3 85) + 'ž' cp1252 (C5 BE)      → c385c5be
//   ş  = C5 9F → 'Å' + 'Ÿ' cp1252 (C5 B8)              → c385c5b8
//   Ö  = C3 96 → 'Ã' + '–' cp1252 (E2 80 93)           → c383e28093
//   ö  = C3 B6 → 'Ã' + '¶'        (C2 B6)              → c383c2b6
//   Ü  = C3 9C → 'Ã' + 'œ' cp1252 (C5 93)              → c383c593
//   ü  = C3 BC → 'Ã' + '¼'        (C2 BC)              → c383c2bc
//   I  = C4 B0 (İ) already done above

const REPLACEMENTS: [string, string][] = [
  ["\\xc3\\x83\\xe2\\x80\\xa1", "Ç"],  // Ã‡ → Ç
  ["\\xc3\\x83\\xc2\\xa7",     "ç"],   // Ã§ → ç
  ["\\xc3\\x84\\xc2\\xb0",     "İ"],   // Ä° → İ
  ["\\xc3\\x84\\xc2\\xb1",     "ı"],   // Ä± → ı
  ["\\xc3\\x84\\xc5\\xbe",     "Ğ"],   // Äž → Ğ
  ["\\xc3\\x84\\xc5\\xb8",     "ğ"],   // ÄŸ → ğ
  ["\\xc3\\x85\\xc5\\xbe",     "Ş"],   // Åž → Ş
  ["\\xc3\\x85\\xc5\\xb8",     "ş"],   // ÅŸ → ş
  ["\\xc3\\x83\\xe2\\x80\\x93","Ö"],   // Ã– → Ö
  ["\\xc3\\x83\\xc2\\xb6",     "ö"],   // Ã¶ → ö
  ["\\xc3\\x83\\xc5\\x93",     "Ü"],   // Ãœ → Ü (0x9C cp1252 = U+0153 = C5 93)
  ["\\xc3\\x83\\xc2\\xbc",     "ü"],   // Ã¼ → ü
]

function buildReplaceChain(col: string): string {
  let expr = col
  for (const [hex, correct] of REPLACEMENTS) {
    const bytes = hex.replace(/\\x/g, "").match(/.{2}/g)!.map(h => parseInt(h, 16))
    const byteLiteral = `'\\x${bytes.map(b => b.toString(16).padStart(2, "0")).join("\\x")}'::bytea`
    expr = `REPLACE(${expr}::bytea, ${byteLiteral}, '${correct}'::bytea)::text`
  }
  return expr
}

export async function POST() {
  const fields = ["name", "district", "city", "address", "category"] as const
  const campaignFields = ["name", "district", "city", "sector"] as const

  // Build and run raw SQL for firms
  const firmSetClauses = fields.map(f =>
    `"${f}" = (${buildReplaceChain(`"${f}"`)})`
  ).join(",\n  ")

  await prisma.$executeRawUnsafe(`
    UPDATE "Firm" SET
      ${firmSetClauses}
    WHERE 1=1
  `)

  const campSetClauses = campaignFields.map(f =>
    `"${f}" = (${buildReplaceChain(`"${f}"`)})`
  ).join(",\n  ")

  await prisma.$executeRawUnsafe(`
    UPDATE "Campaign" SET
      ${campSetClauses}
    WHERE 1=1
  `)

  // Verify
  const sample = await prisma.firm.findFirst({
    where: { demoSlug: "macfit-tunali-ankaya" },
    select: { name: true, district: true, city: true },
  })

  return NextResponse.json({ ok: true, sample })
}
