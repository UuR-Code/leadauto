import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LeadAuto — Otomatik Web Satış Sistemi",
  description: "Websitesiz firmaları bul, demo site yap, lead topla",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <body className={`${inter.className} h-full bg-[#0f1117] text-slate-200 antialiased`}>
        {children}
      </body>
    </html>
  )
}
