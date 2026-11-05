import type { Metadata } from "next"
import "./globals.css"
import { AppNav } from "../components/AppNav"
import { ThemeProvider } from "../context/ThemeContext"

export const metadata: Metadata = {
  title: "MarineElect — Ship Electrical Intelligence",
  description: "Fleet-wide electrical load analysis, fault monitoring, and maintenance scheduling for marine vessels",
  authors: [{ name: "Suji Kumar C", url: "https://sujikumar.com" }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <ThemeProvider>
          <AppNav />
          <main style={{ flex: 1, paddingTop: "var(--nav-h)" }}>
            {children}
          </main>
        <div style={{ display: "flex", justifyContent: "center", padding: "16px 12px 20px" }}>
          <a
            href="https://sujikumar.com/"
            rel="author"
            title="Built by Suji Kumar C — Digital Maritime Engineer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 5px", borderRadius: 999, color: "inherit", opacity: 0.78, textDecoration: "none", border: "1px solid rgba(148,163,184,.35)", font: '500 12px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ss-emblem.svg" alt="" width={20} height={20} style={{ borderRadius: 5, display: "block" }} />
            <span>Built by <b>Suji Kumar C</b> · sujikumar.com</span>
          </a>
        </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
