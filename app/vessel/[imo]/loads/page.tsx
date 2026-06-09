"use client"
import { use, useState } from "react"
import { useVessel } from "../../../../hooks/useVessel"
import { VesselSidebar } from "../../../../components/VesselSidebar"
import { Plus, Trash2, Zap, ChevronDown, ChevronRight } from "lucide-react"
import { Switchboard, LoadItem } from "../../../../lib/types"
import { v4 as uuid } from "uuid"

function switchboardKW(sb: Switchboard) {
  return sb.loads.reduce((t, l) => t + l.kW * l.qty, 0)
}
function activeKW(sb: Switchboard) {
  return sb.loads.filter(l => l.running).reduce((t, l) => t + l.kW * l.qty, 0)
}
function runningKVA(sb: Switchboard) {
  const loads = sb.loads.filter(l => l.running)
  const kw = loads.reduce((t, l) => t + l.kW * l.qty, 0)
  const kvar = loads.reduce((t, l) => {
    const pf = Math.max(0.01, Math.min(1, l.pf))
    return t + l.kW * l.qty * Math.sqrt(1 - pf * pf) / pf
  }, 0)
  return Math.sqrt(kw * kw + kvar * kvar)
}
function avgPF(sb: Switchboard) {
  const loads = sb.loads.filter(l => l.running)
  const kw = loads.reduce((t, l) => t + l.kW * l.qty, 0)
  const kva = runningKVA(sb)
  return kva > 0 ? (kw / kva).toFixed(3) : "—"
}
function voltageDrop(kw: number, pf: number, lengthM: number, voltV = 440, sqmm = 70) {
  // R = ρL/A  (Cu ρ = 0.0172 Ω·mm²/m)  one-way → ×2 for loop
  const R = (0.0172 * 2 * lengthM) / sqmm
  const I = kw * 1000 / (Math.sqrt(3) * voltV * pf)
  const vd = I * R
  return { vd: vd.toFixed(1), pct: ((vd / voltV) * 100).toFixed(2) }
}

const CATEGORIES = ["Propulsion","Deck","Cargo","Safety","Navigation","Accommodation","Manufacturer","Other"]

export default function LoadsPage({ params }: { params: Promise<{ imo: string }> }) {
  const { imo } = use(params)
  const { data, loading, updateSwitchboard, addSwitchboard, deleteSwitchboard } = useVessel(imo)
  const [expandedSB, setExpandedSB] = useState<Record<string, boolean>>({})
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({})
  const [addingSB, setAddingSB] = useState(false)
  const [newSBName, setNewSBName] = useState("")

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>Loading…</div>
  if (!data) return null

  function toggleSB(id: string) { setExpandedSB(p => ({ ...p, [id]: !p[id] })) }

  function handleCellChange(sbId: string, li: number, field: string, raw: string) {
    setRawInputs(p => ({ ...p, [`${sbId}-${li}-${field}`]: raw }))
  }
  function handleCellBlur(sb: Switchboard, li: number, field: string) {
    const key = `${sb.id}-${li}-${field}`
    const raw = rawInputs[key]
    if (raw === undefined) return
    const updated = sb.loads.map((l, i) => {
      if (i !== li) return l
      if (field === "name") return { ...l, name: raw }
      if (field === "category") return { ...l, category: raw }
      if (field === "kW") { const v = parseFloat(raw); return { ...l, kW: isNaN(v) ? l.kW : Math.max(0, v) } }
      if (field === "pf") { const v = parseFloat(raw); return { ...l, pf: isNaN(v) ? l.pf : Math.max(0.01, Math.min(1, v)) } }
      if (field === "qty") { const v = parseInt(raw); return { ...l, qty: isNaN(v) ? l.qty : Math.max(1, v) } }
      return l
    })
    updateSwitchboard({ ...sb, loads: updated })
    setRawInputs(p => { const n = { ...p }; delete n[key]; return n })
  }
  function toggleRunning(sb: Switchboard, li: number) {
    const loads = sb.loads.map((l, i) => i === li ? { ...l, running: !l.running } : l)
    updateSwitchboard({ ...sb, loads })
  }
  function addLoad(sb: Switchboard) {
    const newLoad: LoadItem = { id: uuid(), name: "New Load", kW: 10, pf: 0.85, qty: 1, running: false, category: "Other" }
    updateSwitchboard({ ...sb, loads: [...sb.loads, newLoad] })
  }
  function deleteLoad(sb: Switchboard, li: number) {
    updateSwitchboard({ ...sb, loads: sb.loads.filter((_, i) => i !== li) })
  }
  function createSwitchboard() {
    if (!newSBName.trim()) return
    addSwitchboard({ id: uuid(), name: newSBName.trim(), voltage: data.vessel.voltageSystem === "6.6kV" ? 6600 : 440, loads: [] })
    setNewSBName(""); setAddingSB(false)
  }

  const totalActiveKW = data.switchboards.reduce((t, sb) => t + activeKW(sb), 0)
  const totalKW = data.switchboards.reduce((t, sb) => t + switchboardKW(sb), 0)

  return (
    <div style={{ display: "flex" }}>
      <VesselSidebar imo={imo} vesselName={data.vessel.name} />
      <div style={{ flex: 1, padding: "28px 24px", minWidth: 0 }}>

        <div className="section-header">
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Load Schedule Analysis</h1>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              Total: <b style={{ color: "var(--text-primary)" }}>{totalActiveKW.toLocaleString()} kW</b> running / {totalKW.toLocaleString()} kW installed
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setAddingSB(true)}><Plus size={14} /> Add Switchboard</button>
        </div>

        {addingSB && (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <input className="input" style={{ flex: 1 }} placeholder="Switchboard name" value={newSBName} onChange={e => setNewSBName(e.target.value)} onKeyDown={e => e.key === "Enter" && createSwitchboard()} />
            <button className="btn btn-primary" onClick={createSwitchboard}>Add</button>
            <button className="btn btn-secondary" onClick={() => setAddingSB(false)}>Cancel</button>
          </div>
        )}

        {data.switchboards.map(sb => {
          const isOpen = expandedSB[sb.id] !== false
          const akw = activeKW(sb)
          const tkw = switchboardKW(sb)
          const kva = runningKVA(sb)
          const pf = avgPF(sb)
          return (
            <div key={sb.id} className="card" style={{ marginBottom: 16 }}>
              {/* SB header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", marginBottom: isOpen ? 16 : 0 }} onClick={() => toggleSB(sb.id)}>
                {isOpen ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
                <Zap size={15} color="var(--accent)" />
                <span style={{ fontWeight: 600, fontSize: 15, flex: 1 }}>{sb.name}</span>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{sb.voltage}V</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { label: "Running", value: `${akw.toLocaleString()} kW` },
                    { label: "kVA", value: kva.toFixed(0) },
                    { label: "PF", value: pf },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center", background: "var(--bg-elevated)", borderRadius: "var(--radius-sm)", padding: "4px 10px", minWidth: 70 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <button onClick={e => { e.stopPropagation(); if (confirm("Delete this switchboard?")) deleteSwitchboard(sb.id) }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                  <Trash2 size={13} />
                </button>
              </div>

              {isOpen && (
                <>
                  <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>On</th><th>Load Name</th><th>Category</th>
                          <th>kW</th><th>PF</th><th>Qty</th>
                          <th>Total kW</th><th>Total kVA</th><th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {sb.loads.map((l, li) => {
                          const tot_kw = l.kW * l.qty
                          const tot_kva = (l.kW * l.qty / Math.max(0.01, l.pf)).toFixed(1)
                          function cellVal(field: string, fallback: string | number) {
                            const k = `${sb.id}-${li}-${field}`
                            return rawInputs[k] !== undefined ? rawInputs[k] : String(fallback)
                          }
                          return (
                            <tr key={l.id} style={{ opacity: l.running ? 1 : 0.55 }}>
                              <td>
                                <input type="checkbox" checked={l.running} onChange={() => toggleRunning(sb, li)}
                                  style={{ accentColor: "var(--accent)", width: 16, height: 16, cursor: "pointer" }} />
                              </td>
                              <td>
                                <input className="input" style={{ minWidth: 160, padding: "4px 8px", fontSize: 12 }}
                                  value={cellVal("name", l.name)}
                                  onChange={e => handleCellChange(sb.id, li, "name", e.target.value)}
                                  onBlur={() => handleCellBlur(sb, li, "name")} />
                              </td>
                              <td>
                                <select className="input select" style={{ padding: "4px 24px 4px 8px", fontSize: 12 }}
                                  value={cellVal("category", l.category)}
                                  onChange={e => { handleCellChange(sb.id, li, "category", e.target.value); handleCellBlur({ ...sb, loads: sb.loads.map((x, i) => i === li ? { ...x, category: e.target.value } : x) }, li, "category") }}>
                                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                              </td>
                              {[["kW", l.kW], ["pf", l.pf], ["qty", l.qty]].map(([field, fallback]) => (
                                <td key={field as string}>
                                  <input className="input mono" style={{ width: 70, padding: "4px 6px", fontSize: 12 }}
                                    inputMode={field === "qty" ? "numeric" : "decimal"}
                                    value={cellVal(field as string, fallback as number)}
                                    onChange={e => handleCellChange(sb.id, li, field as string, e.target.value)}
                                    onBlur={() => handleCellBlur(sb, li, field as string)} />
                                </td>
                              ))}
                              <td style={{ fontWeight: 600, color: l.running ? "var(--accent)" : "var(--text-muted)" }}>{tot_kw.toLocaleString()}</td>
                              <td style={{ color: "var(--text-secondary)" }}>{tot_kva}</td>
                              <td>
                                <button onClick={() => deleteLoad(sb, li)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => addLoad(sb)}><Plus size={13} /> Add Load</button>
                    <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
                      {sb.loads.filter(l => l.running).length}/{sb.loads.length} running · {akw.toLocaleString()}/{tkw.toLocaleString()} kW
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
