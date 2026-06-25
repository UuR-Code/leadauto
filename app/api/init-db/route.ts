import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const statements = [
  `CREATE TYPE IF NOT EXISTS "CampaignStatus" AS ENUM ('RUNNING', 'PAUSED', 'COMPLETED')`,
  `CREATE TYPE IF NOT EXISTS "FirmStatus" AS ENUM ('SCRAPED', 'PAGE_READY', 'DEPLOYED', 'SENT', 'REPLIED', 'MEETING', 'CLOSED', 'SKIPPED')`,
  `CREATE TYPE IF NOT EXISTS "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'OPENED', 'CLICKED')`,
  `CREATE TABLE IF NOT EXISTS "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "targetCount" INTEGER NOT NULL DEFAULT 100,
    "status" "CampaignStatus" NOT NULL DEFAULT 'RUNNING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Firm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "campaignId" TEXT NOT NULL REFERENCES "Campaign"("id"),
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "category" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "placeId" TEXT UNIQUE,
    "photoUrl" TEXT,
    "status" "FirmStatus" NOT NULL DEFAULT 'SCRAPED',
    "demoUrl" TEXT,
    "demoSlug" TEXT UNIQUE,
    "deployedAt" TIMESTAMP(3),
    "emailSentAt" TIMESTAMP(3),
    "repliedAt" TIMESTAMP(3),
    "replyText" TEXT,
    "meetingAt" TIMESTAMP(3),
    "meetingNote" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "LandingPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firmId" TEXT NOT NULL UNIQUE REFERENCES "Firm"("id"),
    "heroTitle" TEXT NOT NULL,
    "heroSub" TEXT NOT NULL,
    "services" JSONB NOT NULL,
    "aboutText" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "colorPrimary" TEXT NOT NULL DEFAULT '#2563eb',
    "vercelProjectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "EmailLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firmId" TEXT NOT NULL REFERENCES "Firm"("id"),
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "messageId" TEXT,
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
]

export async function POST() {
  const results: string[] = []
  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql)
      results.push("ok")
    } catch (e: any) {
      results.push(`error: ${e?.message}`)
    }
  }
  return NextResponse.json({ results })
}
