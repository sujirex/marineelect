"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Zap, Settings2, Cable, AlertTriangle, Wrench, TrendingUp, ChevronLeft } from "lucide-react"

interface Props { imo: string; vesselName: string }

export function VesselSidebar({ imo, vesselName }: Props) {
  const pathname = usePathname()

  const sections = [
    { href: `/vessel/${imo}`,             label: "Overview",       icon: LayoutDashboard },
    { href: `/vessel/${imo}/loads`,        label: "Load Schedule",  icon: Zap },
    { href: `/vessel/${imo}/generators`,   label: "Generators",     icon: Settings2 },
    { href: `/vessel/${imo}/cables`,       label: "Cable Database", icon: Cable },
    { href: `/vessel/${imo}/faults`,       label: "Fault Logs",     icon: AlertTriangle },
    { href: `/vessel/${imo}/maintenance`,  label: "Maintenance",    icon: Wrench },
    { href: `/vessel/${imo}/trends`,       label: "90-Day Trends",  icon: TrendingUp },
  ]

  const active = (href: string) => pathname === href

  return (
    <aside style={{
      width: "var(--sidebar-w)", flexShrink: 0,
      background: "linear-gradient(180deg, #0e1629 0%, #0a0f1e 100%)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      position: "sticky", top: "var(--nav-h)", height: "calc(100vh - var(--nav-h))",
      overflowY: "auto",
    }}>
      {/* Vessel header */}
      <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 12, textDecoration: "none", marginBottom: 10 }}>
          <ChevronLeft size={13} /> Fleet
        </Link>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>{vesselName}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>IMO {imo}</div>
      </div>

      {/* Nav links */}
      <nav style={{ padding: "10px 10px", flex: 1 }}>
        {sections.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "9px 10px", borderRadius: "var(--radius-sm)",
            textDecoration: "none", fontSize: 13, fontWeight: 500,
            marginBottom: 2,
            color: active(href) ? "var(--text-primary)" : "var(--text-secondary)",
            background: active(href) ? "rgba(0,130,200,0.12)" : "transparent",
            borderLeft: active(href) ? "2px solid var(--accent)" : "2px solid transparent",
            transition: "all .12s",
          }}>
            <Icon size={15} style={{ color: active(href) ? "var(--accent)" : "inherit" }} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
