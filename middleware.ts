import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_auth")?.value
  const secret = process.env.NEXTAUTH_SECRET || "lead-auto-auth"
  const isLoggedIn = token === secret

  const protectedPaths = ["/dashboard", "/campaigns", "/firms", "/leads", "/sites", "/suppressions"]
  const isProtected = protectedPaths.some(
    (p) => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(`${p}/`),
  )

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (request.nextUrl.pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next|demo|unsubscribe|favicon.ico).*)"],
}
