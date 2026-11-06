"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { LayoutDashboard, Menu, X, BarChart3, Sun, Moon } from "lucide-react"
import { useTheme } from "../context/ThemeContext"

export function AppNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  const links = [
    { href: "/", label: "Fleet", icon: LayoutDashboard },
    { href: "/fleet", label: "Compare", icon: BarChart3 },
  ]
  const norm = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p)
  const active = (href: string) => norm(pathname) === href

  return (
    <>
      <nav className="app-nav">
        <Link href="/" className="app-brand" aria-label="MarineElect home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ss-emblem.svg" alt="" width={36} height={36} />
          <span>
            <b>MarineElect</b>
            <small>Ship electrical intelligence</small>
          </span>
        </Link>

        <div className="nav-desktop">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link${active(href) ? " active" : ""}`}>
              <Icon size={14} /> {label}
            </Link>
          ))}
        </div>

        <button onClick={toggle} className="icon-btn" aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"} style={{ marginLeft: 6 }}>
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button onClick={() => setOpen(o => !o)} className="icon-btn nav-mobile-btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {open && (
        <div className="nav-menu">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-link${active(href) ? " active" : ""}`}>
              <Icon size={15} /> {label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
