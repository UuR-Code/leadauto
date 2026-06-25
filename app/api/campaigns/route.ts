import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { scrapeQueue } from "@/lib/queue/queues"
import { z } from "zod"

const CreateCampaignSchema = z.object({
  name: z.string().min(1),
  sector: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  channel: z.enum(["email", "whatsapp", "both"]).default("email"),
  targetCount: z.number().int().min(1).max(500).default(100),
})

export async function POST(req: Request) {
  if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = CreateCampaignSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { name, sector, city, district, channel, targetCount } = parsed.data

  const campaign = await prisma.campaign.create({
    data: { name, sector, city, district, channel, targetCount, status: "RUNNING" },
  })

  await scrapeQueue.add(
    "scrape",
    { campaignId: campaign.id, sector, city, district, targetCount },
    { attempts: 2 },
  )

  return NextResponse.json(campaign, { status: 201 })
}

export async function GET() {
  if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { firms: true } } },
    })
    return NextResponse.json(campaigns)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}
