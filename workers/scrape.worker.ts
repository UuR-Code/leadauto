import { Worker } from "bullmq"
import Redis from "ioredis"
const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", { maxRetriesPerRequest: null })
import { prisma } from "@/lib/prisma"
import { searchPlacesWithoutWebsite } from "@/lib/services/places"
import { buildPageQueue, deployQueue, type ScrapeJobData } from "@/lib/queue/queues"

export const scrapeWorker = new Worker<ScrapeJobData>(
  "scrape",
  async (job) => {
    const { campaignId, sector, city, district, targetCount } = job.data

    await job.updateProgress(0)

    const places = await searchPlacesWithoutWebsite(sector, city, district, targetCount)

    let processed = 0
    for (const place of places) {
      const existing = await prisma.firm.findUnique({ where: { placeId: place.placeId } })
      if (existing) continue

      const slug = slugify(`${place.name}-${district}`)

      const firm = await prisma.firm.create({
        data: {
          campaignId,
          name: place.name,
          address: place.address,
          phone: place.phone,
          category: sector,
          city,
          district,
          lat: place.lat,
          lng: place.lng,
          placeId: place.placeId,
          photoUrl: place.photoUrl,
          demoSlug: slug,
          status: "SCRAPED",
        },
      })

      await buildPageQueue.add("build", { firmId: firm.id }, { attempts: 3 })

      processed++
      await job.updateProgress(Math.round((processed / places.length) * 100))

      // Emit SSE event via Redis pub/sub
      await redis.publish(
        "campaign:update",
        JSON.stringify({ campaignId, event: "firm_found", firmId: firm.id, firmName: firm.name }),
      )
    }

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: places.length < targetCount ? "COMPLETED" : "RUNNING" },
    })

    return { found: places.length, saved: processed }
  },
  { connection: { url: process.env.REDIS_URL ?? "redis://localhost:6379" }, concurrency: 1 },
)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
}
