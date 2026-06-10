"use client"
import React from "react"
import { useVessel } from "../../../hooks/useVessel"
import { VesselSidebar } from "../../../components/VesselSidebar"
import { Ship, Zap, Settings2, AlertTriangle, Wrench, TrendingUp, Cable } from "lucide-react"
import Link from "next/link"

function severityBadge(count: number, label: string, cls: string, icon: React.ReactNode) {
  return count > 0 ? <span className={`badge ${cls}`}>{icon}{count} {label}</span> : null
}

export default function VesselOverview({ params }: { params: { imo: string } }) {
  const { imo } = params
  const { data, loading } = useVessel(imo)

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>Loading…</div>
  if (!data) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>Vessel IMO {imo} not found.</div>

  const { vessel, switchboards, generators, cables, faultLogs, maintenanceItems } = data

  const totalActiveKW = switchboards.reduce((t, sb) => t + sb.loads.filter(l => l.running).reduce((s, l) => s + l.kW * l.qty, 0), 0)
  const totalGenKVA = generators.filter(g => g.running).reduce((t, g) => t + g.ratedKVA, 0)
  const loadPct = totalGenKVA > 0 ? Math.round((totalActiveKW / (totalGenKVA * 0.8)) * 100) : 0
  const pctColor = loadPct > 85 ? "var(--danger)" : loadPct > 70 ? "var(--warning)" : "var(--success)"

  const openFaults = faultLogs.filter(f => !f.acknowledged)
  const today = new Date().toISOString().split("T")[0]
  const overdue = maintenanceItems.filter(m => m.nextDue < today)
  const dueSoon = maintenanceItems.filter(m => m.nextDue >= today && m.nextDue <= new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0])
  const cableFaults = cables.filter(c => c.faultCondition !== "Normal")

  const quickNav = [
    { href: `/vessel/${imo}/loads`,       label: "Load Schedule",  icon: <Zap size={16} />,          color: "#667db6", desc: `${switchboards.length} switchboard${switchboards.length !== 1 ? "s" : ""}` },
    { href: `/vessel/${imo}/generators`,  label: "Generators",     icon: <Settings2 size={16} />,    color: "#0082c8", desc: `${generators.length} units` },
    { href: `/vessel/${imo}/cables`,      label: "Cable Database", icon: <Cable size={16} />,        color: "#667db6", desc: `${cables.length} cables` },
    { href: `/vessel/${imo}/faults`,      label: "Fault Logs",     icon: <AlertTriangle size={16} />,color: cableFaults.length + openFaults.length > 0 ? "var(--danger)" : "var(--success)", desc: `${openFaults.length} open` },
    { href: `/vessel/${imo}/maintenance`, label: "Maintenance",    icon: <Wrench size={16} />,       color: overdue.length > 0 ? "var(--warning)" : "var(--success)", desc: `${overdue.length} overdue` },
    { href: `/vessel/${imo}/trends`,      label: "90-Day Trends",  icon: <TrendingUp size={16} />,   color: "#0082c8", desc: "Load & fault history" },
  ]

  return (
    <div className="vessel-layout">
      <VesselSidebar imo={imo} vesselName={vessel.name} />
      <div className="vessel-content">

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <Ship size={20} color="var(--accent)" />
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{vessel.name}</h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[`IMO ${vessel.imo}`, vessel.type, vessel.flag, `${vessel.grt.toLocaleString()} GRT`, `Built ${vessel.builtYear}`, vessel.voltageSystem].map(tag => (
              <span key={tag} className="badge badge-neutral">{tag}</span>
            ))}
          </div>
        </div>

        {/* Status alerts */}
        {(openFaults.length > 0 || overdue.length > 0 || cableFaults.length > 0) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
            {openFaults.filter(f => f.severity === "Critical").length > 0 && (
              <div style={{ background: "rgba(220,38,38,.1)", border: "1px solid rgba(220,38,38,.35)", borderRadius: "var(--radius-sm)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={15} color="var(--critical)" />
                <span style={{ fontSize: 13, color: "#fca5a5" }}>CRITICAL: {openFaults.filter(f => f.severity === "Critical")[0]?.description}</span>
              </div>
            )}
            {overdue.length > 0 && (
              <div style={{ background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.3)", borderRadius: "var(--radius-sm)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <Wrench size={15} color="var(--warning)" />
                <span style={{ fontSize: 13, color: "#fde68a" }}>{overdue.length} maintenance item{overdue.length > 1 ? "s" : ""} overdue — immediate attention required</span>
              </div>
            )}
          </div>
        )}

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Active Load", value: `${totalActiveKW.toLocaleString()} kW`, color: "var(--accent)" },
            { label: "Gen Capacity", value: `${totalGenKVA.toLocaleString()} kVA`, color: "var(--brand-from)" },
            { label: "Load Factor", value: `${loadPct}%`, color: pctColor },
            { label: "Open Faults", value: openFaults.length, color: openFaults.length > 0 ? "var(--danger)" : "var(--success)" },
            { label: "Due This Month", value: dueSoon.length, color: dueSoon.length > 0 ? "var(--warning)" : "var(--success)" },
            { label: "Cable Issues", value: cableFaults.length, color: cableFaults.length > 0 ? "var(--warning)" : "var(--success)" },
          ].map(k => (
            <div key={k.label} className="stat-card">
              <div className="stat-label">{k.label}</div>
              <div className="stat-value" style={{ fontSize: 26, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Load bar */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Generator Load</span>
            <span style={{ fontWeight: 700, color: pctColor }}>{loadPct}% of rated capacity</span>
          </div>
          <div style={{ height: 10, background: "var(--bg-elevated)", borderRadius: 5 }}>
            <div style={{ width: `${Math.min(loadPct, 100)}%`, height: "100%", background: `linear-gradient(to right, var(--brand-from), ${pctColor})`, borderRadius: 5, transition: "width .4s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
            <span>{totalActiveKW.toLocaleString()} kW active</span>
            <span>{(totalGenKVA * 0.8).toLocaleString()} kW available at PF 0.8</span>
          </div>
        </div>

        {/* Quick nav grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
          {quickNav.map(n => (
            <Link key={n.href} href={n.href} style={{ textDecoration: "none" }}>
              <div className="card" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: n.color, flexShrink: 0 }}>
                  {n.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{n.label}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{n.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
