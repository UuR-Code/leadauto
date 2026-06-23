import { Worker } from "bullmq"
import Redis from "ioredis"
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null })
import { prisma } from "@/lib/prisma"
import { generateLandingPageContent } from "@/lib/services/ai"
import { deployQueue, type BuildPageJobData } from "@/lib/queue/queues"

export const buildPageWorker = new Worker<BuildPageJobData>(
  "build-page",
  async (job) => {
    const { firmId } = job.data

    const firm = await prisma.firm.findUniqueOrThrow({ where: { id: firmId } })

    const content = await generateLandingPageContent(
      firm.name,
      firm.category,
      firm.address,
      firm.phone ?? undefined,
    )

    await prisma.landingPage.create({
      data: {
        firmId: firm.id,
        heroTitle: content.heroTitle,
        heroSub: content.heroSub,
        services: content.services,
        aboutText: content.aboutText,
        ctaText: content.ctaText,
        colorPrimary: content.colorPrimary,
      },
    })

    await prisma.firm.update({
      where: { id: firmId },
      data: { status: "PAGE_READY" },
    })

    await deployQueue.add("deploy", { firmId }, { attempts: 3 })

    await redis.publish(
      "campaign:update",
      JSON.stringify({
        campaignId: firm.campaignId,
        event: "page_ready",
        firmId: firm.id,
        firmName: firm.name,
      }),
    )

    return { firmId, slug: firm.demoSlug }
  },
  { connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" }, concurrency: 3 },
)
