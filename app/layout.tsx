import type { Metadata } from "next"
import "./globals.css"
import { AppNav } from "../components/AppNav"
import { ThemeProvider } from "../context/ThemeContext"

export const metadata: Metadata = {
  title: "MarineElect — Ship Electrical Intelligence",
  description: "Fleet-wide electrical load analysis, fault monitoring, and maintenance scheduling for marine vessels",
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
        </ThemeProvider>
      </body>
    </html>
  )
}
