"use client"
import { useState } from "react"
import { useVessel } from "../../../../hooks/useVessel"
import { VesselSidebar } from "../../../../components/VesselSidebar"
import { Plus, Trash2, Cable } from "lucide-react"
import { Cable as CableType } from "../../../../lib/types"
import { v4 as uuid } from "uuid"

const FAULT_CONDITIONS = ["Normal","Earth Fault","Insulation Low","Overheating","Mechanical Damage","Open Circuit","Short Circuit"]
const CONDUCTORS = ["Cu","Al"]
const INSULATIONS = ["XLPE","PVC","EPR","LSOH","Mineral"]
const CROSS_SECTIONS = [1.5,2.5,4,6,10,16,25,35,50,70,95,120,150,185,240,300,400]

// Cu resistivity = 0.0172 Ω·mm²/m
function calcVoltageDrop(cable: CableType, voltage = 440) {
  const loadKW = cable.currentActual * Math.sqrt(3) * voltage / 1000
  const R = (0.0172 * 2 * cable.lengthM) / cable.crossSectionMm2
  const vdV = cable.currentActual * R
  const vdPct = (vdV / voltage) * 100
  return { vdV: vdV.toFixed(2), vdPct: vdPct.toFixed(2), ok: vdPct < 3 }
}
function utilisation(cable: CableType) {
  if (cable.currentRating === 0) return 0
  return Math.round((cable.currentActual / cable.currentRating) * 100)
}

export default function CablesPage({ params }: { params: { imo: string } }) {
  const { imo } = params
  const { data, loading, addCable, updateCable, deleteCable } = useVessel(imo)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<CableType>>({})

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>Loading…</div>
  if (!data) return null

  const cables = data.cables
  const faults = cables.filter(c => c.faultCondition !== "Normal")
  const overloaded = cables.filter(c => utilisation(c) > 100)
  const voltage = data.vessel.voltageSystem.includes("6.6") ? 6600 : 440

  function openAdd() {
    setForm({ tag: "", from: "", to: "", route: "", lengthM: 10, conductor: "Cu", crossSectionMm2: 35, cores: 3, currentRating: 110, currentActual: 0, insulation: "XLPE", faultCondition: "Normal", notes: "" })
    setShowAdd(true); setEditId(null)
  }
  function openEdit(c: CableType) { setForm(c); setEditId(c.id); setShowAdd(true) }

  function save() {
    if (!form.tag) return
    if (editId) updateCable({ ...form, id: editId } as CableType)
    else addCable({ ...form, id: uuid() } as CableType)
    setShowAdd(false); setForm({})
  }

  function faultColor(fc: string) {
    if (fc === "Normal") return "badge-success"
    if (fc === "Insulation Low") return "badge-warning"
    return "badge-danger"
  }

  return (
    <div className="vessel-layout">
      <VesselSidebar imo={imo} vesselName={data.vessel.name} />
      <div className="vessel-content">

        <div className="section-header">
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Cable Database</h1>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{cables.length} cables · {faults.length} fault{faults.length !== 1 ? "s" : ""} · {overloaded.length} overloaded</div>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Cable</button>
        </div>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Cables", value: cables.length, color: "var(--accent)" },
            { label: "Faults", value: faults.length, color: faults.length > 0 ? "var(--danger)" : "var(--success)" },
            { label: "Overloaded", value: overloaded.length, color: overloaded.length > 0 ? "var(--danger)" : "var(--success)" },
            { label: "VD > 3%", value: cables.filter(c => parseFloat(calcVoltageDrop(c, voltage).vdPct) > 3).length, color: "var(--warning)" },
          ].map(k => (
            <div key={k.label} className="stat-card">
              <div className="stat-label">{k.label}</div>
              <div className="stat-value" style={{ fontSize: 26, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Add/Edit form */}
        {showAdd && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 14 }}>{editId ? "Edit Cable" : "Add Cable"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Cable Tag", key: "tag" },
                { label: "From", key: "from" },
                { label: "To", key: "to" },
                { label: "Route", key: "route" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</label>
                  <input className="input" value={(form as Record<string,unknown>)[key] as string || ""}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              {[
                { label: "Length (m)", key: "lengthM" },
                { label: "Current Rating (A)", key: "currentRating" },
                { label: "Actual Current (A)", key: "currentActual" },
                { label: "Cores", key: "cores" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</label>
                  <input className="input" type="number" value={(form as Record<string,unknown>)[key] as number || 0}
                    onChange={e => setForm(p => ({ ...p, [key]: parseFloat(e.target.value) || 0 }))} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Cross Section (mm²)</label>
                <select className="input select" value={form.crossSectionMm2 || 35} onChange={e => setForm(p => ({ ...p, crossSectionMm2: parseFloat(e.target.value) }))}>
                  {CROSS_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Conductor</label>
                <select className="input select" value={form.conductor || "Cu"} onChange={e => setForm(p => ({ ...p, conductor: e.target.value }))}>
                  {CONDUCTORS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Insulation</label>
                <select className="input select" value={form.insulation || "XLPE"} onChange={e => setForm(p => ({ ...p, insulation: e.target.value }))}>
                  {INSULATIONS.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Fault Condition</label>
                <select className="input select" value={form.faultCondition || "Normal"} onChange={e => setForm(p => ({ ...p, faultCondition: e.target.value }))}>
                  {FAULT_CONDITIONS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Notes</label>
                <input className="input" value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tag</th><th>From → To</th><th>Route</th>
                  <th>Size</th><th>Length</th>
                  <th>Load (A)</th><th>Utilisation</th>
                  <th>VD (V)</th><th>VD %</th>
                  <th>Condition</th><th>Notes</th><th></th>
                </tr>
              </thead>
              <tbody>
                {cables.map(c => {
                  const util = utilisation(c)
                  const vd = calcVoltageDrop(c, voltage)
                  const utilColor = util > 100 ? "var(--danger)" : util > 80 ? "var(--warning)" : "var(--success)"
                  const vdColor = parseFloat(vd.vdPct) > 3 ? "var(--danger)" : parseFloat(vd.vdPct) > 2 ? "var(--warning)" : "var(--text-primary)"
                  return (
                    <tr key={c.id}>
                      <td className="mono" style={{ fontWeight: 600, color: "var(--accent)" }}>{c.tag}</td>
                      <td style={{ fontSize: 12 }}>
                        <div>{c.from}</div>
                        <div style={{ color: "var(--text-muted)" }}>→ {c.to}</div>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--text-secondary)" }}>{c.route}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{c.conductor} {c.crossSectionMm2}mm² {c.cores}C</td>
                      <td style={{ fontSize: 12 }}>{c.lengthM}m</td>
                      <td className="mono">{c.currentActual}A / {c.currentRating}A</td>
                      <td><span style={{ fontWeight: 600, color: utilColor }}>{util}%</span></td>
                      <td className="mono" style={{ color: vdColor }}>{vd.vdV}V</td>
                      <td className="mono" style={{ color: vdColor }}>{vd.vdPct}%</td>
                      <td><span className={`badge ${faultColor(c.faultCondition)}`}>{c.faultCondition}</span></td>
                      <td style={{ fontSize: 11, color: "var(--text-muted)", maxWidth: 140 }}>{c.notes}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button className="btn btn-ghost" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => openEdit(c)}>Edit</button>
                          <button onClick={() => deleteCable(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
