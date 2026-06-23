import { prisma } from "@/lib/prisma"
import StatsCards from "@/components/dashboard/StatsCards"
import FirmsTable from "@/components/dashboard/FirmsTable"
import ActivityFeed from "@/components/dashboard/ActivityFeed"
import FunnelChart from "@/components/dashboard/FunnelChart"
import ActiveCampaignBanner from "@/components/dashboard/ActiveCampaignBanner"
import NewCampaignForm from "@/components/dashboard/NewCampaignForm"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [stats, activeCampaign, recentFirms, funnelData] = await Promise.all([
    getStats(),
    getActiveCampaign(),
    getRecentFirms(),
    getFunnelData(),
  ])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ background: "#161b2e", borderColor: "#1e2d45" }}
      >
        <h1 className="text-base font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <a
            href="/campaigns"
            className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
            style={{ background: "#1e2d45", borderColor: "#2d3f5a", color: "#94a3b8" }}
          >
            Tüm Kampanyalar
          </a>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {activeCampaign && <ActiveCampaignBanner campaign={activeCampaign} />}

        <StatsCards stats={stats} />

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
          <FirmsTable firms={recentFirms} />
          <ActivityFeed />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <FunnelChart data={funnelData} />
          <NewCampaignForm />
        </div>
      </div>
    </div>
  )
}

async function getStats() {
  const [firms, sites, emails, replied] = await Promise.all([
    prisma.firm.count(),
    prisma.firm.count({ where: { status: { in: ["DEPLOYED", "SENT", "REPLIED", "MEETING", "CLOSED"] } } }),
    prisma.emailLog.count({ where: { status: "SENT" } }),
    prisma.firm.count({ where: { status: { in: ["REPLIED", "MEETING", "CLOSED"] } } }),
  ])
  return { firms, sites, emails, replied }
}

async function getActiveCampaign() {
  return prisma.campaign.findFirst({
    where: { status: "RUNNING" },
    include: { _count: { select: { firms: true } } },
    orderBy: { createdAt: "desc" },
  })
}

async function getRecentFirms() {
  return prisma.firm.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { campaign: { select: { sector: true } } },
  })
}

async function getFunnelData() {
  const statuses = ["SCRAPED", "PAGE_READY", "DEPLOYED", "SENT", "REPLIED", "MEETING", "CLOSED"] as const
  const counts = await Promise.all(
    statuses.map((s) => prisma.firm.count({ where: { status: { in: [s, ...statuses.slice(statuses.indexOf(s) + 1)] } } }))
  )
  // counts[0] = total (all statuses including SCRAPED+), etc.
  // Simpler: just count each status independently for the funnel
  const raw = await Promise.all(
    ["SCRAPED","PAGE_READY","DEPLOYED","SENT","REPLIED","MEETING","CLOSED"].map(async (s) => ({
      status: s,
      count: await prisma.firm.count({ where: { status: s as never } }),
    }))
  )
  return raw
}
