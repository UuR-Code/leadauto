"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/campaigns", label: "Kampanyalar", icon: "🚀" },
  { href: "/firms", label: "Firmalar", icon: "🏢" },
  { href: "/sites", label: "Demo Siteler", icon: "🌐" },
  { href: "/leads", label: "Yanıt Verenler", icon: "💬", badge: true },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r"
      style={{ background: "#161b2e", borderColor: "#1e2d45" }}>
      {/* Logo */}
      <div className="px-4 py-5 border-b" style={{ borderColor: "#1e2d45" }}>
        <div className="text-blue-400 font-bold text-base tracking-tight">⚡ LeadAuto</div>
        <div className="text-xs mt-0.5" style={{ color: "#4a5568" }}>Otomatik Web Satış</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5">
        <div className="text-[10px] uppercase tracking-widest px-2 py-2" style={{ color: "#4a5568" }}>
          Ana Menü
        </div>
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: active ? "#1e3a5f" : "transparent",
                color: active ? "#60a5fa" : "#94a3b8",
              }}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: "#1e2d45" }}>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: "#94a3b8" }}
        >
          ⚙️ Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
