"use client"
import { useFleet } from "../../hooks/useFleet"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"
import { Ship, Zap, AlertTriangle, Wrench, TrendingUp } from "lucide-react"

function activeKW(v: import("../../lib/types").VesselData) {
  return v.switchboards.reduce((t, sb) => t + sb.loads.filter(l => l.running).reduce((s, l) => s + l.kW * l.qty, 0), 0)
}
function genKVA(v: import("../../lib/types").VesselData) {
  return v.generators.filter(g => g.running).reduce((t, g) => t + g.ratedKVA, 0)
}
function loadPct(v: import("../../lib/types").VesselData) {
  const kva = genKVA(v)
  return kva > 0 ? Math.round((activeKW(v) / (kva * 0.8)) * 100) : 0
}
function openFaults(v: import("../../lib/types").VesselData) {
  return v.faultLogs.filter(f => !f.acknowledged).length
}
function overdueItems(v: import("../../lib/types").VesselData) {
  const today = new Date().toISOString().split("T")[0]
  return v.maintenanceItems.filter(m => m.nextDue < today).length
}
function cableFaults(v: import("../../lib/types").VesselData) {
  return v.cables.filter(c => c.faultCondition !== "Normal").length
}

const tooltipStyle = {
  contentStyle: { background: "#1a2235", border: "1px solid rgba(102,125,182,.3)", borderRadius: 8, fontSize: 12 },
}

const COLORS = ["#667db6","#0082c8","#22c55e","#f59e0b","#ef4444","#a78bfa"]

export default function FleetComparePage() {
  const { vessels, loading } = useFleet()

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>Loading…</div>

  if (vessels.length < 2) return (
    <div style={{ maxWidth: 600, margin: "80px auto", padding: 24, textAlign: "center" }}>
      <Ship size={48} style={{ opacity: .3, marginBottom: 16 }} />
      <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Add at least 2 vessels to compare</h2>
      <p style={{ color: "var(--text-muted)" }}>Go to the Fleet Dashboard and add more vessels to unlock cross-fleet comparison.</p>
    </div>
  )

  const barLoad = vessels.map(v => ({ name: v.vessel.name, "Load kW": activeKW(v), "Gen kVA": genKVA(v) * 0.8 }))
  const barFaults = vessels.map(v => ({ name: v.vessel.name, "Open Faults": openFaults(v), "Overdue": overdueItems(v), "Cable Issues": cableFaults(v) }))
  const barPct = vessels.map(v => ({ name: v.vessel.name, "Load %": loadPct(v) }))

  const radarData = [
    { subject: "Load Factor", ...Object.fromEntries(vessels.map(v => [v.vessel.name, Math.min(loadPct(v), 100)])) },
    { subject: "Fault Score", ...Object.fromEntries(vessels.map(v => [v.vessel.name, Math.min(openFaults(v) * 20, 100)])) },
    { subject: "Maintenance", ...Object.fromEntries(vessels.map(v => [v.vessel.name, Math.min(overdueItems(v) * 25, 100)])) },
    { subject: "Cable Health", ...Object.fromEntries(vessels.map(v => {
      const tot = v.cables.length || 1
      return [v.vessel.name, Math.round((cableFaults(v) / tot) * 100)]
    })) },
    { subject: "Gen Redundancy", ...Object.fromEntries(vessels.map(v => {
      const standby = v.generators.filter(g => !g.running).length
      return [v.vessel.name, Math.min(standby * 33, 100)]
    })) },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, background: "var(--brand-grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Cross-Fleet Comparison
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>{vessels.length} vessels · electrical performance overview</p>
      </div>

      {/* Summary table */}
      <div className="card" style={{ marginBottom: 24, padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Vessel</th><th>Type</th><th>Flag</th>
                <th>Active kW</th><th>Gen kVA</th><th>Load %</th>
                <th>Open Faults</th><th>Overdue</th><th>Cable Issues</th>
              </tr>
            </thead>
            <tbody>
              {vessels.map((v, i) => {
                const pct = loadPct(v)
                const pctColor = pct > 85 ? "var(--danger)" : pct > 70 ? "var(--warning)" : "var(--success)"
                const faults = openFaults(v)
                const over = overdueItems(v)
                return (
                  <tr key={v.vessel.imo}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontWeight: 600 }}>{v.vessel.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{v.vessel.type}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>{v.vessel.flag}</td>
                    <td style={{ fontWeight: 600 }}>{activeKW(v).toLocaleString()}</td>
                    <td>{(genKVA(v) * 0.8).toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: pctColor }}>{pct}%</td>
                    <td><span style={{ fontWeight: 600, color: faults > 0 ? "var(--danger)" : "var(--success)" }}>{faults}</span></td>
                    <td><span style={{ fontWeight: 600, color: over > 0 ? "var(--warning)" : "var(--success)" }}>{over}</span></td>
                    <td><span style={{ fontWeight: 600, color: cableFaults(v) > 0 ? "var(--warning)" : "var(--success)" }}>{cableFaults(v)}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px,1fr))", gap: 16 }}>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Electrical Load vs Generator Capacity (kW)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barLoad} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Load kW" fill="#667db6" radius={[3,3,0,0]} />
              <Bar dataKey="Gen kVA" fill="rgba(0,130,200,.4)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Generator Load Factor (%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barPct} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, "Load %"]} />
              {vessels.map((v, i) => <Bar key={i} dataKey="Load %" fill={COLORS[i % COLORS.length]} radius={[3,3,0,0]} />)}
              <Bar dataKey="Load %" fill="#0082c8" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Faults & Maintenance Status</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barFaults} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Open Faults" fill="#ef4444" radius={[3,3,0,0]} />
              <Bar dataKey="Overdue" fill="#f59e0b" radius={[3,3,0,0]} />
              <Bar dataKey="Cable Issues" fill="#a78bfa" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Fleet Health Radar (lower = better)</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <PolarGrid stroke="rgba(102,125,182,.2)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} />
              {vessels.map((v, i) => (
                <Radar key={v.vessel.imo} name={v.vessel.name} dataKey={v.vessel.name}
                  stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.1} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
