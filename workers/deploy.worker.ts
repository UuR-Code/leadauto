import { Worker } from "bullmq"
import Redis from "ioredis"
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null })
import { prisma } from "@/lib/prisma"
import { emailQueue, type DeployJobData } from "@/lib/queue/queues"

export const deployWorker = new Worker<DeployJobData>(
  "deploy",
  async (job) => {
    const { firmId } = job.data

    const firm = await prisma.firm.findUniqueOrThrow({
      where: { id: firmId },
      include: { landingPage: true },
    })

    // For path-based routing, the demo URL is just our app's route
    // No Vercel API call needed — pages are served at /demo/[slug]
    const demoUrl = `${process.env.NEXT_PUBLIC_APP_URL}/demo/${firm.demoSlug}`

    await prisma.firm.update({
      where: { id: firmId },
      data: {
        status: "DEPLOYED",
        demoUrl,
        deployedAt: new Date(),
      },
    })

    // Only queue email if firm has an email address
    if (firm.email) {
      await emailQueue.add("email", { firmId }, { attempts: 3, backoff: { type: "exponential", delay: 5000 } })
    }

    await redis.publish(
      "campaign:update",
      JSON.stringify({
        campaignId: firm.campaignId,
        event: "deployed",
        firmId: firm.id,
        firmName: firm.name,
        demoUrl,
      }),
    )

    return { firmId, demoUrl }
  },
  { connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" }, concurrency: 5 },
)
