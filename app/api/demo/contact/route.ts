import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import { z } from "zod"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

const REPLIED_ELIGIBLE_STATUSES = ["SCRAPED", "PAGE_READY", "DEPLOYED", "SENT"]

const Schema = z.object({
  firmId: z.string().min(1),
  firmName: z.string().min(1),
  name: z.string().min(1),
  phone: z.string().min(6),
  message: z.string().optional(),
})

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const allowed = await rateLimit(`ratelimit:contact:${ip}`, 5, 60)
  if (!allowed) return NextResponse.json({ error: "Çok fazla istek. Lütfen biraz sonra tekrar deneyin." }, { status: 429 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 })

  const { firmId, firmName, name, phone, message } = parsed.data

  // Get firm email for notification
  const firm = await prisma.firm.findUnique({ where: { id: firmId }, select: { email: true, demoUrl: true, status: true } })
  if (!firm) return NextResponse.json({ error: "Firma bulunamadı" }, { status: 404 })

  await prisma.lead.create({ data: { firmId, name, phone, message } })

  if (REPLIED_ELIGIBLE_STATUSES.includes(firm.status)) {
    await prisma.firm.update({
      where: { id: firmId },
      data: {
        status: "REPLIED",
        repliedAt: new Date(),
        replyText: message ?? `Randevu formu: ${name} (${phone})`,
      },
    })
  }

  // Send email notification if Gmail is configured
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
      })

      await transporter.sendMail({
        from: `"LeadAuto" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER, // notify admin
        subject: `Yeni Randevu Talebi — ${firmName}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:12px">
            <h2 style="color:#60a5fa;margin-bottom:16px">Yeni Talep: ${esc(firmName)}</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#94a3b8;width:120px">Ad Soyad</td><td style="font-weight:600">${esc(name)}</td></tr>
              <tr><td style="padding:8px 0;color:#94a3b8">Telefon</td><td><a href="tel:${esc(phone)}" style="color:#60a5fa">${esc(phone)}</a></td></tr>
              ${message ? `<tr><td style="padding:8px 0;color:#94a3b8;vertical-align:top">Mesaj</td><td>${esc(message)}</td></tr>` : ""}
              <tr><td style="padding:8px 0;color:#94a3b8">Demo Site</td><td><a href="${firm?.demoUrl ?? ""}" style="color:#60a5fa">${firm?.demoUrl ?? ""}</a></td></tr>
            </table>
          </div>
        `,
      })
    } catch (e) {
      console.error("Contact form email error:", e)
    }
  }

  return NextResponse.json({ ok: true })
}
