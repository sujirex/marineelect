"use client"
import { use, useState } from "react"
import { useVessel } from "../../../../hooks/useVessel"
import { VesselSidebar } from "../../../../components/VesselSidebar"
import { Plus, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { FaultLog } from "../../../../lib/types"
import { v4 as uuid } from "uuid"

const SEVERITIES = ["Minor","Major","Critical"]

function severityClass(s: string) {
  if (s === "Critical") return "badge-critical"
  if (s === "Major") return "badge-danger"
  return "badge-warning"
}

function formatTS(ts: string) {
  const d = new Date(ts)
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

// Detect recurring pattern: same equipment+faultCode appearing 2+ times
function recurringFaults(logs: FaultLog[]) {
  const map: Record<string, number> = {}
  logs.forEach(f => { const k = `${f.equipment}|${f.faultCode}`; map[k] = (map[k] || 0) + 1 })
  return Object.entries(map).filter(([, c]) => c >= 2).map(([k]) => k)
}

export default function FaultsPage({ params }: { params: Promise<{ imo: string }> }) {
  const { imo } = use(params)
  const { data, loading, addFaultLog, updateFaultLog } = useVessel(imo)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState<"all"|"open"|"resolved">("all")
  const [form, setForm] = useState<Partial<FaultLog>>({})

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>Loading…</div>
  if (!data) return null

  const logs = data.faultLogs
  const recurring = recurringFaults(logs)
  const open = logs.filter(f => !f.acknowledged)
  const resolved = logs.filter(f => f.acknowledged)

  const displayed = filter === "open" ? open : filter === "resolved" ? resolved : logs

  function acknowledge(f: FaultLog) {
    updateFaultLog({ ...f, acknowledged: true, resolvedAt: f.resolvedAt || new Date().toISOString() })
  }

  function logFault() {
    if (!form.equipment || !form.description) return
    const entry: FaultLog = {
      id: uuid(),
      timestamp: new Date().toISOString(),
      equipment: form.equipment || "",
      faultCode: form.faultCode || "MAN-001",
      description: form.description || "",
      severity: (form.severity as FaultLog["severity"]) || "Minor",
      acknowledged: false, resolvedAt: "", resolution: "",
    }
    addFaultLog(entry)
    setForm({}); setShowAdd(false)
  }

  return (
    <div style={{ display: "flex" }}>
      <VesselSidebar imo={imo} vesselName={data.vessel.name} />
      <div style={{ flex: 1, padding: "28px 24px", minWidth: 0 }}>

        <div className="section-header">
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Fault Logs</h1>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>{open.length} open · {recurring.length} recurring pattern{recurring.length !== 1 ? "s" : ""}</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={14} /> Log Fault</button>
        </div>

        {/* Recurring alert */}
        {recurring.length > 0 && (
          <div style={{ background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.3)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <AlertTriangle size={15} color="var(--warning)" />
              <span style={{ fontWeight: 600, fontSize: 13, color: "#fde68a" }}>Recurring Fault Patterns Detected</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {recurring.map(k => {
                const [eq, code] = k.split("|")
                return <span key={k} className="badge badge-warning">{eq} — {code}</span>
              })}
            </div>
          </div>
        )}

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Logged", value: logs.length, color: "var(--accent)" },
            { label: "Open", value: open.length, color: open.length > 0 ? "var(--danger)" : "var(--success)" },
            { label: "Critical Open", value: open.filter(f => f.severity === "Critical").length, color: "var(--critical)" },
            { label: "Recurring", value: recurring.length, color: recurring.length > 0 ? "var(--warning)" : "var(--success)" },
          ].map(k => (
            <div key={k.label} className="stat-card">
              <div className="stat-label">{k.label}</div>
              <div className="stat-value" style={{ fontSize: 26, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          {(["all","open","resolved"] as const).map(f => (
            <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: 12, padding: "5px 14px" }} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 14 }}>Log New Fault</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Equipment", key: "equipment" },
                { label: "Fault Code", key: "faultCode" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</label>
                  <input className="input" value={(form as Record<string,unknown>)[key] as string || ""}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Severity</label>
                <select className="input select" value={form.severity || "Minor"} onChange={e => setForm(p => ({ ...p, severity: e.target.value as FaultLog["severity"] }))}>
                  {SEVERITIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Description</label>
                <input className="input" value={form.description || ""} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={logFault}>Log Fault</button>
            </div>
          </div>
        )}

        {/* Fault list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {displayed.map(f => {
            const isRecurring = recurring.includes(`${f.equipment}|${f.faultCode}`)
            return (
              <div key={f.id} className="card" style={{
                borderLeft: `3px solid ${f.severity === "Critical" ? "var(--critical)" : f.severity === "Major" ? "var(--danger)" : "var(--warning)"}`,
                opacity: f.acknowledged ? 0.7 : 1,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{f.equipment}</span>
                      <span className="mono" style={{ fontSize: 11, color: "var(--accent)" }}>{f.faultCode}</span>
                      <span className={`badge ${severityClass(f.severity)}`}>{f.severity}</span>
                      {isRecurring && <span className="badge badge-warning">Recurring</span>}
                      {f.acknowledged && <span className="badge badge-success"><CheckCircle size={10} style={{ marginRight: 3 }} />Resolved</span>}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", marginBottom: 6 }}>{f.description}</div>
                    <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-muted)" }}>
                      <span><Clock size={10} style={{ marginRight: 3 }} />{formatTS(f.timestamp)}</span>
                      {f.resolvedAt && <span>Resolved: {formatTS(f.resolvedAt)}</span>}
                    </div>
                    {f.resolution && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>Resolution: {f.resolution}</div>}
                  </div>
                  {!f.acknowledged && (
                    <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => {
                      const res = prompt("Resolution details (optional):")
                      updateFaultLog({ ...f, acknowledged: true, resolvedAt: new Date().toISOString(), resolution: res || "" })
                    }}>
                      <CheckCircle size={13} /> Acknowledge
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {displayed.length === 0 && (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--text-muted)" }}>
              No fault logs{filter !== "all" ? ` in "${filter}" filter` : ""}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
