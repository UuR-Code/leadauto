import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { getScrapeQueue } from "@/lib/queue/queues"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const q = getScrapeQueue()
    const counts = await q.getJobCounts("waiting", "active", "completed", "failed", "delayed")
    const failedJobs = await q.getFailed(0, 5)

    return NextResponse.json({
      scrapeQueue: counts,
      recentErrors: failedJobs.map((j: any) => ({
        id: j.id,
        data: j.data,
        failedReason: j.failedReason,
      })),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
