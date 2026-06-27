import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PostgreSQL convert_to/convert_from to reverse CP1252 mojibake
// "Ã‡ankaya" (U+00C3 U+2021 stored as UTF-8) → encode as WIN1252 bytes → decode as UTF-8 → "Çankaya"

export async function GET() {
  // Debug: show current bytes for MACFit
  const firm = await prisma.firm.findFirst({
    where: { demoSlug: "macfit-tunali-ankaya" },
    select: { name: true, district: true, city: true },
  })
  if (!firm) return NextResponse.json({ error: "firm not found" })

  // Get hex representation of stored bytes via SQL
  const hexResult = await prisma.$queryRaw<{ d: string; n: string }[]>`
    SELECT encode("district"::bytea, 'hex') as d, encode("name"::bytea, 'hex') as n
    FROM "Firm" WHERE "demoSlug" = 'macfit-tunali-ankaya'
    LIMIT 1
  `

  return NextResponse.json({
    name: firm.name,
    district: firm.district,
    hex: hexResult[0],
  })
}

export async function POST() {
  try {
    // Use PostgreSQL's convert functions to reverse mojibake:
    // The stored text has UTF-8 bytes but was double-encoded through WIN1252
    // Reversing: encode the unicode chars back to WIN1252 bytes, then decode as UTF-8

    const fields = ["name", "district", "city", "address", "category"]
    for (const field of fields) {
      await prisma.$executeRawUnsafe(`
        UPDATE "Firm"
        SET "${field}" = convert_from(
          convert_to("${field}", 'WIN1252'),
          'UTF8'
        )
        WHERE "${field}" ~ '[\\xC3\\xC4\\xC5]'
      `)
    }

    const campFields = ["name", "district", "city", "sector"]
    for (const field of campFields) {
      await prisma.$executeRawUnsafe(`
        UPDATE "Campaign"
        SET "${field}" = convert_from(
          convert_to("${field}", 'WIN1252'),
          'UTF8'
        )
        WHERE "${field}" ~ '[\\xC3\\xC4\\xC5]'
      `)
    }

    const sample = await prisma.firm.findFirst({
      where: { demoSlug: "macfit-tunali-ankaya" },
      select: { name: true, district: true, city: true },
    })

    return NextResponse.json({ ok: true, sample })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 })
  }
}
