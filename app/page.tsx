"use client"
import { useState } from "react"
import Link from "next/link"
import { useFleet } from "../hooks/useFleet"
import { Plus, Ship, AlertTriangle, Wrench, Zap, Anchor, Trash2 } from "lucide-react"
import { VesselData, Vessel } from "../lib/types"
import { v4 as uuid } from "uuid"
import { DEMO_VESSEL_1 } from "../lib/demoData"

function totalActiveKW(v: VesselData) {
  return v.switchboards.reduce((t, sb) =>
    t + sb.loads.filter(l => l.running).reduce((s, l) => s + l.kW * l.qty, 0), 0)
}
function totalGenKVA(v: VesselData) {
  return v.generators.filter(g => g.running).reduce((t, g) => t + g.ratedKVA, 0)
}
function openFaults(v: VesselData) {
  return v.faultLogs.filter(f => !f.acknowledged).length
}
function overdueItems(v: VesselData) {
  const today = new Date().toISOString().split("T")[0]
  return v.maintenanceItems.filter(m => m.nextDue < today).length
}
function loadPct(v: VesselData) {
  const kw = totalActiveKW(v)
  const kva = totalGenKVA(v)
  if (kva === 0) return 0
  return Math.round((kw / (kva * 0.8)) * 100)
}

const EMPTY_VESSEL: Vessel = {
  imo: "", name: "", type: "General Cargo", flag: "", grt: 0, builtYear: new Date().getFullYear(),
  voltageSystem: "440V", createdAt: "", updatedAt: "",
}

export default function FleetDashboard() {
  const { vessels, loading, addVessel, removeVessel } = useFleet()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<Vessel>(EMPTY_VESSEL)

  function handleAdd() {
    if (!form.imo || !form.name) return
    const now = new Date().toISOString()
    const newVessel: VesselData = {
      vessel: { ...form, createdAt: now, updatedAt: now },
      switchboards: [], generators: [], cables: [], faultLogs: [], maintenanceItems: [], trendData: [],
    }
    addVessel(newVessel)
    setForm(EMPTY_VESSEL)
    setShowAdd(false)
  }

  const criticalVessels = vessels.filter(v => openFaults(v) > 0 || overdueItems(v) > 0)

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>
      Loading fleet data…
    </div>
  )

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, background: "var(--brand-grad)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
            Fleet Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>{vessels.length} vessel{vessels.length !== 1 ? "s" : ""} in fleet</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Vessel
        </button>
      </div>

      {/* Fleet KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Vessels", value: vessels.length, icon: <Anchor size={18} />, color: "var(--accent)" },
          { label: "Open Faults", value: vessels.reduce((t, v) => t + openFaults(v), 0), icon: <AlertTriangle size={18} />, color: "var(--danger)" },
          { label: "Overdue Tasks", value: vessels.reduce((t, v) => t + overdueItems(v), 0), icon: <Wrench size={18} />, color: "var(--warning)" },
          { label: "Avg Load %", value: vessels.length > 0 ? Math.round(vessels.reduce((t, v) => t + loadPct(v), 0) / vessels.length) + "%" : "—", icon: <Zap size={18} />, color: "var(--brand-from)" },
        ].map(kpi => (
          <div key={kpi.label} className="stat-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ color: kpi.color }}>{kpi.icon}</span>
              <span className="stat-label" style={{ marginBottom: 0 }}>{kpi.label}</span>
            </div>
            <div className="stat-value" style={{ fontSize: 32, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Alert banner */}
      {criticalVessels.length > 0 && (
        <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.3)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={16} color="var(--danger)" />
          <span style={{ color: "#fca5a5", fontSize: 13 }}>
            {criticalVessels.length} vessel{criticalVessels.length > 1 ? "s" : ""} require attention — open faults or overdue maintenance
          </span>
        </div>
      )}

      {/* Vessel grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {vessels.map(vd => {
          const faults = openFaults(vd)
          const overdue = overdueItems(vd)
          const pct = loadPct(vd)
          const pctColor = pct > 85 ? "var(--danger)" : pct > 70 ? "var(--warning)" : "var(--success)"
          return (
            <div key={vd.vessel.imo} className="card" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <Ship size={14} color="var(--accent)" />
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{vd.vessel.name}</span>
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11 }}>IMO {vd.vessel.imo} · {vd.vessel.type} · {vd.vessel.flag}</div>
                </div>
                <button onClick={(e) => { e.preventDefault(); removeVessel(vd.vessel.imo) }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}
                  title="Remove vessel">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Load bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "var(--text-muted)", fontSize: 11 }}>Generator Load</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: pctColor }}>{pct}%</span>
                </div>
                <div style={{ height: 5, background: "var(--bg-elevated)", borderRadius: 3 }}>
                  <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: `linear-gradient(to right, var(--brand-from), ${pctColor})`, borderRadius: 3, transition: "width .3s" }} />
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { label: "Active kW", value: totalActiveKW(vd).toLocaleString() },
                  { label: "Gen kVA", value: totalGenKVA(vd).toLocaleString() },
                  { label: "Built", value: vd.vessel.builtYear },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: "8px 4px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{s.value}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: 10, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Fault / maintenance chips */}
              <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                {faults > 0 && <span className="badge badge-danger"><AlertTriangle size={10} style={{ marginRight: 3 }} />{faults} Fault{faults > 1 ? "s" : ""}</span>}
                {overdue > 0 && <span className="badge badge-warning"><Wrench size={10} style={{ marginRight: 3 }} />{overdue} Overdue</span>}
                {faults === 0 && overdue === 0 && <span className="badge badge-success">All Clear</span>}
              </div>

              <Link href={`/vessel/${vd.vessel.imo}`} className="btn btn-primary" style={{ textDecoration: "none", justifyContent: "center" }}>
                Open Workspace
              </Link>
            </div>
          )
        })}

        {/* Empty state */}
        {vessels.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
            <Anchor size={40} style={{ marginBottom: 12, opacity: .4 }} />
            <p style={{ fontSize: 15, marginBottom: 8 }}>No vessels in fleet</p>
            <p style={{ fontSize: 13 }}>Add your first vessel to get started</p>
          </div>
        )}
      </div>

      {/* Add vessel modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, width: "100%", maxWidth: 480 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Add New Vessel</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { label: "IMO Number", key: "imo", placeholder: "e.g. 9876543" },
                { label: "Vessel Name", key: "name", placeholder: "e.g. MV Atlantic Hope" },
                { label: "Flag State", key: "flag", placeholder: "e.g. Panama" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label style={{ display: "block", color: "var(--text-muted)", fontSize: 11, marginBottom: 5, fontWeight: 500 }}>{label}</label>
                  <input className="input" placeholder={placeholder} value={(form as Record<string, unknown>)[key] as string}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", color: "var(--text-muted)", fontSize: 11, marginBottom: 5, fontWeight: 500 }}>Vessel Type</label>
                  <select className="input select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {["General Cargo","Container","Bulk Carrier","Tanker","Chemical Tanker","LNG Carrier","RORO","Passenger","OPV","Offshore Vessel","Tug","Ferry"].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--text-muted)", fontSize: 11, marginBottom: 5, fontWeight: 500 }}>Voltage System</label>
                  <select className="input select" value={form.voltageSystem} onChange={e => setForm(p => ({ ...p, voltageSystem: e.target.value }))}>
                    {["440V","6.6kV","11kV","440V/6.6kV"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd} disabled={!form.imo || !form.name}>Add Vessel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
