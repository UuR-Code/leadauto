import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import LoginButton from "./LoginButton"

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/")

  return (
    <div className="min-h-full flex items-center justify-center">
      <div
        className="w-full max-w-sm p-8 rounded-2xl border text-center"
        style={{ background: "#161b2e", borderColor: "#1e2d45" }}
      >
        <div className="text-4xl mb-4">⚡</div>
        <h1 className="text-xl font-bold text-slate-100">LeadAuto</h1>
        <p className="text-sm mt-1 mb-8" style={{ color: "#64748b" }}>
          Otomatik Web Satış Sistemi
        </p>
        <LoginButton />
      </div>
    </div>
  )
}
