"use client"

import { useEffect, useRef, useState } from "react"

type Activity = {
  id: string
  event: string
  firmName?: string
  demoUrl?: string
  time: Date
}

const EVENT_LABELS: Record<string, { icon: string; color: string; text: (a: Activity) => string }> = {
  firm_found: { icon: "●", color: "#818cf8", text: (a) => `${a.firmName} bulundu` },
  page_ready: { icon: "●", color: "#eab308", text: (a) => `${a.firmName} sitesi hazırlandı` },
  deployed:   { icon: "●", color: "#60a5fa", text: (a) => `${a.firmName} deploy edildi` },
  email_sent: { icon: "●", color: "#34d399", text: (a) => `${a.firmName}'e mail gönderildi` },
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const es = new EventSource("/api/sse")
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        setActivities((prev) => [
          { id: crypto.randomUUID(), ...data, time: new Date() },
          ...prev.slice(0, 19),
        ])
      } catch {}
    }

    return () => es.close()
  }, [])

  return (
    <div className="rounded-xl border flex flex-col" style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
      <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "#1e2d45" }}>
        <h2 className="text-sm font-semibold">Canlı Aktivite</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activities.length === 0 && (
          <div className="px-4 py-6 text-xs text-center" style={{ color: "#4a5568" }}>
            Aktivite bekleniyor…
          </div>
        )}
        {activities.map((a) => {
          const meta = EVENT_LABELS[a.event]
          if (!meta) return null
          return (
            <div key={a.id} className="flex gap-3 px-4 py-3 border-b" style={{ borderColor: "#0f1117" }}>
              <span className="text-[8px] mt-1.5 flex-shrink-0" style={{ color: meta.color }}>{meta.icon}</span>
              <div>
                <div className="text-xs text-slate-300">{meta.text(a)}</div>
                <div className="text-[10px] mt-0.5" style={{ color: "#4a5568" }}>
                  {a.time.toLocaleTimeString("tr-TR")}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
