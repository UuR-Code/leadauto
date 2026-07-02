import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7",
  "base64",
)

export async function GET(_req: Request, { params }: { params: Promise<{ logId: string }> }) {
  const { logId } = await params

  try {
    await prisma.emailLog.updateMany({
      where: { id: logId, openedAt: null },
      data: { status: "OPENED", openedAt: new Date() },
    })
  } catch {
    // ignore — tracking must never break email rendering
  }

  return new NextResponse(PIXEL, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  })
}
