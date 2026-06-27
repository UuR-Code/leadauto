import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const url = new URL(req.url)
  const campaignId = url.searchParams.get("campaignId")
  const status = url.searchParams.get("status")

  const firms = await prisma.firm.findMany({
    where: {
      ...(campaignId ? { campaignId } : {}),
      ...(status ? { status: status as any } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true, name: true, category: true, city: true, district: true,
      status: true, demoSlug: true, demoUrl: true, phone: true,
    },
  })

  return NextResponse.json(firms)
}
