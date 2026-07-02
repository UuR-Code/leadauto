import { Worker } from "bullmq"
import Redis from "ioredis"
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null })
import { prisma } from "@/lib/prisma"
import { sendWhatsappTemplate } from "@/lib/services/whatsapp"
import type { WhatsappJobData } from "@/lib/queue/queues"

export const whatsappWorker = new Worker<WhatsappJobData>(
  "whatsapp",
  async (job) => {
    const { firmId } = job.data

    const firm = await prisma.firm.findUniqueOrThrow({ where: { id: firmId } })

    if (!firm.phone || !firm.demoUrl) {
      throw new Error(`Firm ${firmId} missing phone or demoUrl`)
    }

    if (!process.env.WHATSAPP_ACCESS_TOKEN) {
      console.warn(`[whatsapp] not configured, skipping firm ${firmId}`)
      return { firmId, skipped: "not_configured" }
    }

    const messageId = await sendWhatsappTemplate({
      to: firm.phone,
      firmName: firm.name,
      demoUrl: firm.demoUrl,
    })

    await prisma.firm.update({
      where: { id: firmId },
      data: { status: "SENT" },
    })

    await redis.publish(
      "campaign:update",
      JSON.stringify({
        campaignId: firm.campaignId,
        event: "whatsapp_sent",
        firmId: firm.id,
        firmName: firm.name,
      }),
    )

    return { firmId, messageId }
  },
  { connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" }, concurrency: 2 },
)
