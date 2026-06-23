import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { password } = await req.json()
  const adminPassword = process.env.ADMIN_PASSWORD || "123"
  const secret = process.env.NEXTAUTH_SECRET || "lead-auto-auth"

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Şifre yanlış" }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set("admin_auth", secret, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })
  return res
}
