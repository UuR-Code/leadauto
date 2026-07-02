import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const Schema = z.object({ email: z.string().email() })

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz e-posta" }, { status: 400 })

  await prisma.suppression.upsert({
    where: { email: parsed.data.email },
    create: { email: parsed.data.email, reason: "user_unsubscribed" },
    update: {},
  })

  return NextResponse.json({ ok: true })
}
