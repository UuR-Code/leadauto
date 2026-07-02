import { Worker } from "bullmq"
import Redis from "ioredis"
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null })
import { prisma } from "@/lib/prisma"
import { sendDemoEmail, sendFollowupEmail } from "@/lib/services/email"
import { emailQueue, type EmailJobData } from "@/lib/queue/queues"

const FOLLOWUP_DELAY_MS = 3 * 24 * 60 * 60 * 1000

export const emailWorker = new Worker<EmailJobData>(
  "email",
  async (job) => {
    const { firmId } = job.data
    const isFollowup = job.name === "followup"

    const firm = await prisma.firm.findUniqueOrThrow({ where: { id: firmId } })

    if (!firm.email || !firm.demoUrl) {
      throw new Error(`Firm ${firmId} missing email or demoUrl`)
    }

    if (isFollowup && firm.status !== "SENT") {
      // Firm already replied, moved on, or was re-sent — skip stale follow-up.
      return { firmId, skipped: "not_pending" }
    }

    const suppressed = await prisma.suppression.findUnique({ where: { email: firm.email } })
    if (suppressed) {
      return { firmId, skipped: "suppressed" }
    }

    const log = await prisma.emailLog.create({
      data: {
        firmId: firm.id,
        to: firm.email,
        subject: isFollowup
          ? `${firm.name} — Demo web siteniz hâlâ hazır bekliyor`
          : `${firm.name} — Web siteniz hazır, ücretsiz inceleyin`,
        status: "PENDING",
      },
    })

    try {
      const sendFn = isFollowup ? sendFollowupEmail : sendDemoEmail
      const messageId = await sendFn({
        to: firm.email,
        firmName: firm.name,
        demoUrl: firm.demoUrl,
        logId: log.id,
      })

      await Promise.all([
        prisma.emailLog.update({
          where: { id: log.id },
          data: { status: "SENT", messageId, sentAt: new Date() },
        }),
        prisma.firm.update({
          where: { id: firmId },
          data: isFollowup
            ? { followupSentAt: new Date() }
            : { status: "SENT", emailSentAt: new Date() },
        }),
      ])

      if (!isFollowup) {
        await emailQueue.add("followup", { firmId }, { delay: FOLLOWUP_DELAY_MS, attempts: 3 })
      }

      await redis.publish(
        "campaign:update",
        JSON.stringify({
          campaignId: firm.campaignId,
          event: isFollowup ? "followup_sent" : "email_sent",
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
