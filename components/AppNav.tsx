"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LayoutDashboard, Menu, X, BarChart3, Zap, Sun, Moon } from "lucide-react"
import { useTheme } from "../context/ThemeContext"

export function AppNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  const links = [
    { href: "/", label: "Fleet", icon: LayoutDashboard },
    { href: "/fleet", label: "Compare", icon: BarChart3 },
  ]

  const active = (href: string) => pathname === href

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, height: "var(--nav-h)",
      background: "color-mix(in srgb, var(--bg) 92%, transparent)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)", zIndex: 100,
      display: "flex", alignItems: "center", padding: "0 20px", gap: 0,
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", marginRight: "auto" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--brand-grad-135)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Zap size={16} color="#fff" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, background: "var(--brand-grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          MarineElect
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: 12, display: "none" }} className="nav-sub">Ship Electrical Intelligence</span>
      </Link>

      {/* Desktop links */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="nav-desktop">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: "var(--radius-sm)", textDecoration: "none",
            fontSize: 13, fontWeight: 500,
            color: active(href) ? "var(--text-primary)" : "var(--text-secondary)",
            background: active(href) ? "var(--bg-elevated)" : "transparent",
            border: active(href) ? "1px solid var(--border)" : "1px solid transparent",
            transition: "all .15s",
          }}>
            <Icon size={14} />
            {label}
          </Link>
        ))}
      </div>

      {/* Theme toggle */}
      <button onClick={toggle} aria-label="Toggle theme" style={{
        background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)",
        padding: 6, marginLeft: 8, display: "flex", alignItems: "center",
      }}>
        {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
      </button>

      {/* Mobile toggle */}
      <button onClick={() => setOpen(o => !o)} className="nav-mobile-btn" style={{
        background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", padding: 6,
      }}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: "fixed", top: "var(--nav-h)", left: 0, right: 0,
          background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
          padding: "12px 20px", display: "flex", flexDirection: "column", gap: 4, zIndex: 99,
        }}>
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
              borderRadius: "var(--radius-sm)", textDecoration: "none",
              color: active(href) ? "var(--text-primary)" : "var(--text-secondary)",
              background: active(href) ? "var(--bg-elevated)" : "transparent",
            }}>
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        @media (min-width: 641px) {
          .nav-mobile-btn { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
