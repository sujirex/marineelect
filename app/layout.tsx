import type { Metadata } from "next"
import "./globals.css"
import { AppNav } from "../components/AppNav"

export const metadata: Metadata = {
  title: "MarineElect — Ship Electrical Intelligence",
  description: "Fleet-wide electrical load analysis, fault monitoring, and maintenance scheduling for marine vessels",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <AppNav />
        <main style={{ flex: 1, paddingTop: "var(--nav-h)" }}>
          {children}
        </main>
      </body>
    </html>
  )
}
