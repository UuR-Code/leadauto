type Stats = { firms: number; sites: number; emails: number; replied: number }

export default function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Bulunan Firma", value: stats.firms, icon: "🏢", color: "#818cf8" },
    { label: "Demo Site", value: stats.sites, icon: "🌐", color: "#60a5fa" },
    { label: "Mail Gönderildi", value: stats.emails, icon: "📨", color: "#34d399" },
    { label: "Yanıt / Lead", value: stats.replied, icon: "💬", color: "#f97316" },
  ]

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl p-4 border"
          style={{ background: "#161b2e", borderColor: "#1e2d45" }}
        >
          <div className="flex items-start justify-between">
            <div className="text-xs" style={{ color: "#64748b" }}>{card.label}</div>
            <span className="text-xl opacity-40">{card.icon}</span>
          </div>
          <div className="text-3xl font-bold mt-2 leading-none" style={{ color: card.color }}>
            {card.value.toLocaleString("tr-TR")}
          </div>
        </div>
      ))}
    </div>
  )
}
