"use client"
import { useState } from "react"
import { useVessel } from "../../../../hooks/useVessel"
import { VesselSidebar } from "../../../../components/VesselSidebar"
import { Plus, Trash2, Settings2, Power } from "lucide-react"
import { Generator } from "../../../../lib/types"
import { v4 as uuid } from "uuid"

const PRIME_MOVERS = ["Diesel","HFO Diesel","Dual Fuel","Gas Turbine","Steam Turbine","Shore Power","Wind/Solar"]

function GenCard({ gen, onToggle, onUpdate, onDelete }: {
  gen: Generator
  onToggle: () => void
  onUpdate: (g: Generator) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(gen)

  function save() { onUpdate(form); setEditing(false) }

  const loadKW = gen.ratedKVA * gen.pf
  const sinceService = gen.lastServiceDate
    ? Math.round((Date.now() - new Date(gen.lastServiceDate).getTime()) / 86400000) + " days ago"
    : "Not recorded"

  return (
    <div className="card" style={{ border: `1px solid ${gen.running ? "rgba(0,130,200,.4)" : "var(--border)"}`, background: gen.running ? "rgba(0,130,200,.04)" : "var(--bg-card)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: gen.running ? "var(--brand-grad-135)" : "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Settings2 size={16} color={gen.running ? "#fff" : "var(--text-muted)"} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{gen.name}</div>
          <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{gen.primeMover} · {gen.engineMake || "—"}</div>
        </div>
        <span className={`badge ${gen.running ? "badge-success" : "badge-neutral"}`}>
          <Power size={10} style={{ marginRight: 4 }} />{gen.running ? "Running" : "Standby"}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Rated kVA", value: gen.ratedKVA.toLocaleString() },
          { label: "Rated kW", value: loadKW.toLocaleString() },
          { label: "Voltage", value: `${gen.voltage}V` },
          { label: "PF", value: gen.pf.toFixed(2) },
          { label: "Run Hours", value: gen.runHours.toLocaleString() },
          { label: "Last Service", value: sinceService },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: "8px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      {editing && (
        <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: 16, marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {[
              { label: "Name", key: "name", type: "text" },
              { label: "Engine Make", key: "engineMake", type: "text" },
              { label: "Rated kVA", key: "ratedKVA", type: "number" },
              { label: "Voltage (V)", key: "voltage", type: "number" },
              { label: "Power Factor", key: "pf", type: "number" },
              { label: "Run Hours", key: "runHours", type: "number" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</label>
                <input className="input" type={type} value={(form as Record<string, unknown>)[key] as string}
                  onChange={e => setForm(p => ({ ...p, [key]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Prime Mover</label>
              <select className="input select" value={form.primeMover} onChange={e => setForm(p => ({ ...p, primeMover: e.target.value }))}>
                {PRIME_MOVERS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Last Service Date</label>
              <input className="input" type="date" value={form.lastServiceDate || ""}
                onChange={e => setForm(p => ({ ...p, lastServiceDate: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>Save</button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button className={`btn ${gen.running ? "btn-secondary" : "btn-primary"}`} style={{ flex: 1 }} onClick={onToggle}>
          <Power size={13} />{gen.running ? "Take Offline" : "Bring Online"}
        </button>
        <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>Edit</button>
        <button className="btn btn-danger" onClick={() => { if (confirm("Delete this generator?")) onDelete() }}><Trash2 size={13} /></button>
      </div>
    </div>
  )
}

export default function GeneratorsPage({ params }: { params: { imo: string } }) {
  const { imo } = params
  const { data, loading, updateGenerator, addGenerator, deleteGenerator } = useVessel(imo)
  const [adding, setAdding] = useState(false)

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>Loading…</div>
  if (!data) return null

  const running = data.generators.filter(g => g.running)
  const totalKVA = running.reduce((t, g) => t + g.ratedKVA, 0)
  const totalActiveKW = data.switchboards.reduce((t, sb) => t + sb.loads.filter(l => l.running).reduce((s, l) => s + l.kW * l.qty, 0), 0)
  const loadPct = totalKVA > 0 ? Math.round((totalActiveKW / (totalKVA * 0.8)) * 100) : 0
  const pctColor = loadPct > 85 ? "var(--danger)" : loadPct > 70 ? "var(--warning)" : "var(--success)"

  function handleAdd() {
    const g: Generator = {
      id: uuid(), name: "New Generator", ratedKVA: 1000, voltage: 440, pf: 0.80,
      running: false, primeMover: "Diesel", engineMake: "", runHours: 0, lastServiceDate: "",
    }
    addGenerator(g)
    setAdding(false)
  }

  return (
    <div className="vessel-layout">
      <VesselSidebar imo={imo} vesselName={data.vessel.name} />
      <div className="vessel-content">

        <div className="section-header" style={{ marginBottom: 22 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Generator & Bus Bar Management</h1>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{running.length}/{data.generators.length} generators running · {totalKVA.toLocaleString()} kVA online</div>
          </div>
          <button className="btn btn-primary" onClick={handleAdd}><Plus size={14} /> Add Generator</button>
        </div>

        {/* Summary bar */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Bus Load Factor</span>
            <span style={{ fontWeight: 700, color: pctColor }}>{loadPct}%</span>
          </div>
          <div style={{ height: 8, background: "var(--bg-elevated)", borderRadius: 4 }}>
            <div style={{ width: `${Math.min(loadPct, 100)}%`, height: "100%", background: `linear-gradient(to right, var(--brand-from), ${pctColor})`, borderRadius: 4 }} />
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
            {[
              { label: "Active Demand", value: `${totalActiveKW.toLocaleString()} kW` },
              { label: "Available (PF 0.8)", value: `${(totalKVA * 0.8).toLocaleString()} kW` },
              { label: "Headroom", value: `${Math.max(0, totalKVA * 0.8 - totalActiveKW).toLocaleString()} kW` },
              { label: "Total Installed", value: `${data.generators.reduce((t, g) => t + g.ratedKVA, 0).toLocaleString()} kVA` },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</div>
                <div style={{ fontWeight: 600 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {data.generators.map(g => (
            <GenCard key={g.id} gen={g}
              onToggle={() => updateGenerator({ ...g, running: !g.running })}
              onUpdate={updateGenerator}
              onDelete={() => deleteGenerator(g.id)} />
          ))}
          {data.generators.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
              No generators. Click "Add Generator" to start.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
