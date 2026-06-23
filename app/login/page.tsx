"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push("/dashboard")
    } else {
      setError("Şifre yanlış")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f1117" }}>
      <div
        className="w-full max-w-sm p-8 rounded-2xl border text-center"
        style={{ background: "#161b2e", borderColor: "#1e2d45" }}
      >
        <div className="text-4xl mb-4">⚡</div>
        <h1 className="text-xl font-bold text-slate-100">LeadAuto</h1>
        <p className="text-sm mt-1 mb-8" style={{ color: "#64748b" }}>
          Otomatik Web Satış Sistemi
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "#0f1117", border: "1px solid #1e2d45", color: "#e2e8f0" }}
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ background: "#3b82f6", color: "white" }}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  )
}
