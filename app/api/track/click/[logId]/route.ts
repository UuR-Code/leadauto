import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ logId: string }> }) {
  const { logId } = await params

  const log = await prisma.emailLog.findUnique({
    where: { id: logId },
    include: { firm: { select: { demoUrl: true } } },
  })

  const fallbackUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin
  const redirectUrl = log?.firm.demoUrl ?? fallbackUrl

  if (log) {
    await prisma.emailLog.update({
      where: { id: logId },
      data: {
        status: "CLICKED",
        clickedAt: log.clickedAt ?? new Date(),
        openedAt: log.openedAt ?? new Date(),
      },
    }).catch(() => {})
  }

  return NextResponse.redirect(redirectUrl)
}
