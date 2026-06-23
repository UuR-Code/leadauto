import { cookies } from "next/headers"

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_auth")?.value
  const secret = process.env.NEXTAUTH_SECRET || "lead-auto-auth"
  return token === secret
}
