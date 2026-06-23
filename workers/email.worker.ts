import { Worker } from "bullmq"
import Redis from "ioredis"
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null })
import { prisma } from "@/lib/prisma"
import { sendDemoEmail } from "@/lib/services/email"
import type { EmailJobData } from "@/lib/queue/queues"

export const emailWorker = new Worker<EmailJobData>(
  "email",
  async (job) => {
    const { firmId } = job.data

    const firm = await prisma.firm.findUniqueOrThrow({ where: { id: firmId } })

    if (!firm.email || !firm.demoUrl) {
      throw new Error(`Firm ${firmId} missing email or demoUrl`)
    }

    const log = await prisma.emailLog.create({
      data: {
        firmId: firm.id,
        to: firm.email,
        subject: `${firm.name} — Web siteniz hazır, ücretsiz inceleyin`,
        status: "PENDING",
      },
    })

    try {
      const messageId = await sendDemoEmail({
        to: firm.email,
        firmName: firm.name,
        demoUrl: firm.demoUrl,
      })

      await Promise.all([
        prisma.emailLog.update({
          where: { id: log.id },
          data: { status: "SENT", messageId, sentAt: new Date() },
        }),
        prisma.firm.update({
          where: { id: firmId },
          data: { status: "SENT", emailSentAt: new Date() },
        }),
      ])

      await redis.publish(
        "campaign:update",
        JSON.stringify({
          campaignId: firm.campaignId,
          event: "email_sent",
          firmId: firm.id,
          firmName: firm.name,
        }),
      )

      return { firmId, messageId }
    } catch (err) {
      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: "FAILED", error: String(err) },
      })
      throw err
    }
  },
  { connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" }, concurrency: 2 },
)
