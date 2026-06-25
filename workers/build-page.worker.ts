import { Worker } from "bullmq"
import Redis from "ioredis"
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null })
import { prisma } from "@/lib/prisma"
import { generatePageBlueprint } from "@/lib/services/ai"
import { deployQueue, type BuildPageJobData } from "@/lib/queue/queues"

export const buildPageWorker = new Worker<BuildPageJobData>(
  "build-page",
  async (job) => {
    const { firmId } = job.data

    const firm = await prisma.firm.findUniqueOrThrow({ where: { id: firmId } })

    const blueprint = await generatePageBlueprint({
      firmName: firm.name,
      sector: firm.category,
      city: firm.city,
      district: firm.district,
      address: firm.address,
      phone: firm.phone ?? undefined,
    })

    // Extract legacy fields from blueprint for backwards compat
    const heroSection = blueprint.sections.find((s) => s.type === "hero") as
      | { type: "hero"; title: string; subtitle: string; ctaText: string }
      | undefined
    const servicesSection = blueprint.sections.find((s) => s.type === "services") as
      | { type: "services"; items: { name: string; desc: string }[] }
      | undefined
    const aboutSection = blueprint.sections.find((s) => s.type === "about") as
      | { type: "about"; text: string }
      | undefined

    await prisma.landingPage.create({
      data: {
        firmId: firm.id,
        heroTitle: heroSection?.title ?? firm.name,
        heroSub: heroSection?.subtitle ?? "",
        services: servicesSection?.items ?? [],
        aboutText: aboutSection?.text ?? "",
        ctaText: heroSection?.ctaText ?? "Hemen Ara",
        colorPrimary: blueprint.theme.primaryColor,
        blueprint: blueprint as object,
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
