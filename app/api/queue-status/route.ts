import { NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { getScrapeQueue, getBuildPageQueue, getDeployQueue, getEmailQueue } from "@/lib/queue/queues"

export const dynamic = "force-dynamic"

async function queueStats(q: ReturnType<typeof getScrapeQueue>) {
  const counts = await q.getJobCounts("waiting", "active", "completed", "failed", "delayed")
  const failed = await q.getFailed(0, 3)
  return {
    counts,
    recentErrors: failed.map((j: any) => ({ id: j.id, failedReason: j.failedReason, data: j.data })),
  }
}

export async function GET() {
  if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const [scrape, buildPage, deploy, email] = await Promise.all([
      queueStats(getScrapeQueue()),
      queueStats(getBuildPageQueue()),
      queueStats(getDeployQueue()),
      queueStats(getEmailQueue()),
    ])

    return NextResponse.json({ scrape, buildPage, deploy, email })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 })
  }
}
