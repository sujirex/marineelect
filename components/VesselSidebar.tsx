"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Zap, Settings2, Cable, AlertTriangle, Wrench, TrendingUp, ChevronLeft, Menu, X } from "lucide-react"

interface Props { imo: string; vesselName: string }

export function VesselSidebar({ imo, vesselName }: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const sections = [
    { href: `/vessel/${imo}`,             label: "Overview",       icon: LayoutDashboard },
    { href: `/vessel/${imo}/loads`,        label: "Load Schedule",  icon: Zap },
    { href: `/vessel/${imo}/generators`,   label: "Generators",     icon: Settings2 },
    { href: `/vessel/${imo}/cables`,       label: "Cable Database", icon: Cable },
    { href: `/vessel/${imo}/faults`,       label: "Fault Logs",     icon: AlertTriangle },
    { href: `/vessel/${imo}/maintenance`,  label: "Maintenance",    icon: Wrench },
    { href: `/vessel/${imo}/trends`,       label: "90-Day Trends",  icon: TrendingUp },
  ]

  const norm = (p: string) => (p.length > 1 ? p.replace(/\/$/, "") : p)
  const active = (href: string) => norm(pathname) === href

  const sidebarContent = (
    <>
      {/* Vessel header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" onClick={() => setOpen(false)} style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 12, textDecoration: "none", marginBottom: 10 }}>
          <ChevronLeft size={13} /> Fleet
        </Link>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>{vesselName}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>IMO {imo}</div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: "10px 10px", flex: 1 }}>
        {sections.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} onClick={() => setOpen(false)} className={`side-link${active(href) ? " active" : ""}`}>
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  )

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} className="mob-backdrop" />
      )}

      {/* Sidebar — sticky on desktop, fixed drawer on mobile */}
      <aside className={`vessel-aside${open ? " vessel-aside-open" : ""}`}>
        {sidebarContent}
      </aside>

      {/* Mobile FAB — hamburger/close button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="vessel-fab"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
    </>
  )
}
