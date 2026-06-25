import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [campaigns, firms] = await Promise.all([
      prisma.campaign.count(),
      prisma.firm.groupBy({ by: ["status"], _count: { status: true } }),
    ])

    return NextResponse.json({
      campaigns,
      firms: Object.fromEntries(firms.map((f: any) => [f.status, f._count.status])),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
