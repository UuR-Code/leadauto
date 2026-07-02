"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"

function UnsubscribeCard() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") ?? ""
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")

  async function handleUnsubscribe() {
    setStatus("loading")
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? "done" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div
      className="w-full max-w-sm p-8 rounded-2xl border text-center"
      style={{ background: "#161b2e", borderColor: "#1e2d45" }}
    >
      <div className="text-4xl mb-4">✉️</div>
      <h1 className="text-xl font-bold text-slate-100">E-posta Listesinden Çık</h1>

      {!email ? (
        <p className="text-sm mt-4" style={{ color: "#f87171" }}>Geçersiz bağlantı — e-posta adresi bulunamadı.</p>
      ) : status === "done" ? (
        <p className="text-sm mt-4" style={{ color: "#4ade80" }}>
          <strong>{email}</strong> adresi listeden çıkarıldı. Bir daha e-posta almayacaksınız.
        </p>
      ) : (
        <>
          <p className="text-sm mt-2 mb-8" style={{ color: "#64748b" }}>
            <strong>{email}</strong> adresini bir daha e-posta almayacak şekilde işaretlemek istiyor musunuz?
          </p>
          {status === "error" && <p className="text-red-400 text-sm mb-4">Bir hata oluştu, tekrar deneyin.</p>}
          <button
            onClick={handleUnsubscribe}
            disabled={status === "loading"}
            className="w-full py-3 px-4 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ background: "#ef4444", color: "white" }}
          >
            {status === "loading" ? "İşleniyor..." : "Beni Listeden Çıkar"}
          </button>
        </>
      )}
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f1117" }}>
      <Suspense fallback={null}>
        <UnsubscribeCard />
      </Suspense>
    </div>
  )
}
