"use client"
import { useState } from "react"
import { useVessel } from "../../../../hooks/useVessel"
import { VesselSidebar } from "../../../../components/VesselSidebar"
import { Plus, Wrench, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { MaintenanceItem } from "../../../../lib/types"
import { v4 as uuid } from "uuid"

const CATEGORIES = ["PMS","Class","Survey","Manufacturer","Flag","SOLAS","Other"]

function daysUntil(dateStr: string) {
  if (!dateStr) return 9999
  return Math.round((new Date(dateStr).getTime() - Date.now()) / 86400000)
}
function itemStatus(item: MaintenanceItem): "overdue" | "soon" | "ok" {
  const d = daysUntil(item.nextDue)
  if (d < 0) return "overdue"
  if (d <= 30) return "soon"
  return "ok"
}
function statusBadge(status: "overdue"|"soon"|"ok") {
  if (status === "overdue") return <span className="badge badge-danger"><AlertTriangle size={10} style={{ marginRight: 3 }}/>Overdue</span>
  if (status === "soon")    return <span className="badge badge-warning"><Clock size={10} style={{ marginRight: 3 }}/>Due Soon</span>
  return <span className="badge badge-success"><CheckCircle size={10} style={{ marginRight: 3 }}/>On Schedule</span>
}

export default function MaintenancePage({ params }: { params: { imo: string } }) {
  const { imo } = params
  const { data, loading, addMaintenance, updateMaintenance, deleteMaintenance } = useVessel(imo)
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<MaintenanceItem>>({})
  const [filter, setFilter] = useState<"all"|"overdue"|"soon"|"ok">("all")

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>Loading…</div>
  if (!data) return null

  const items = data.maintenanceItems
  const today = new Date().toISOString().split("T")[0]
  const overdue = items.filter(m => itemStatus(m) === "overdue")
  const soon = items.filter(m => itemStatus(m) === "soon")

  const displayed = filter === "all" ? items
    : filter === "overdue" ? overdue
    : filter === "soon" ? soon
    : items.filter(m => itemStatus(m) === "ok")

  const sorted = [...displayed].sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime())

  function openAdd() {
    setForm({ equipment: "", task: "", intervalDays: 90, lastDone: today, nextDue: "", category: "PMS", notes: "" })
    setEditId(null); setShowAdd(true)
  }
  function openEdit(item: MaintenanceItem) { setForm(item); setEditId(item.id); setShowAdd(true) }
  function save() {
    if (!form.equipment || !form.task) return
    if (editId) updateMaintenance({ ...form, id: editId } as MaintenanceItem)
    else addMaintenance({ ...form, id: uuid() } as MaintenanceItem)
    setShowAdd(false); setForm({})
  }
  function markDone(item: MaintenanceItem) {
    const newLastDone = today
    const nextDue = new Date(Date.now() + item.intervalDays * 86400000).toISOString().split("T")[0]
    updateMaintenance({ ...item, lastDone: newLastDone, nextDue })
  }

  return (
    <div style={{ display: "flex" }}>
      <VesselSidebar imo={imo} vesselName={data.vessel.name} />
      <div style={{ flex: 1, padding: "28px 24px", minWidth: 0 }}>

        <div className="section-header">
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Maintenance Scheduler</h1>
            <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
              {overdue.length} overdue · {soon.length} due within 30 days
            </div>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={14} /> Add Task</button>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Tasks", value: items.length, color: "var(--accent)" },
            { label: "Overdue", value: overdue.length, color: overdue.length > 0 ? "var(--danger)" : "var(--success)" },
            { label: "Due < 30d", value: soon.length, color: soon.length > 0 ? "var(--warning)" : "var(--success)" },
            { label: "Class Items", value: items.filter(m => m.category === "Class" || m.category === "Survey").length, color: "var(--brand-from)" },
          ].map(k => (
            <div key={k.label} className="stat-card">
              <div className="stat-label">{k.label}</div>
              <div className="stat-value" style={{ fontSize: 26, color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          {(["all","overdue","soon","ok"] as const).map(f => (
            <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-secondary"}`}
              style={{ fontSize: 12, padding: "5px 14px" }} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "ok" ? "On Schedule" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Add/Edit form */}
        {showAdd && (
          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 14 }}>{editId ? "Edit Task" : "Add Maintenance Task"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Equipment", key: "equipment" },
                { label: "Task Description", key: "task" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</label>
                  <input className="input" value={(form as Record<string,unknown>)[key] as string || ""}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Interval (days)</label>
                <input className="input" type="number" value={form.intervalDays || 90}
                  onChange={e => setForm(p => ({ ...p, intervalDays: parseInt(e.target.value) || 90 }))} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Category</label>
                <select className="input select" value={form.category || "PMS"} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Last Done</label>
                <input className="input" type="date" value={form.lastDone || ""}
                  onChange={e => {
                    const last = e.target.value
                    const next = new Date(new Date(last).getTime() + (form.intervalDays || 90) * 86400000).toISOString().split("T")[0]
                    setForm(p => ({ ...p, lastDone: last, nextDue: next }))
                  }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>Next Due</label>
                <input className="input" type="date" value={form.nextDue || ""}
                  onChange={e => setForm(p => ({ ...p, nextDue: e.target.value }))} />
              </div>
              <div>
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

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map(item => {
            const status = itemStatus(item)
            const days = daysUntil(item.nextDue)
            return (
              <div key={item.id} className="card" style={{
                borderLeft: `3px solid ${status === "overdue" ? "var(--danger)" : status === "soon" ? "var(--warning)" : "rgba(34,197,94,.4)"}`,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <Wrench size={13} color="var(--accent)" />
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{item.equipment}</span>
                      <span className="badge badge-info">{item.category}</span>
                      {statusBadge(status)}
                    </div>
                    <div style={{ fontSize: 13, marginBottom: 6 }}>{item.task}</div>
                    <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--text-muted)", flexWrap: "wrap" }}>
                      <span>Interval: {item.intervalDays}d</span>
                      <span>Last: {item.lastDone || "—"}</span>
                      <span style={{ fontWeight: 600, color: status === "overdue" ? "var(--danger)" : status === "soon" ? "var(--warning)" : "var(--success)" }}>
                        Due: {item.nextDue} ({days < 0 ? `${Math.abs(days)}d overdue` : `${days}d`})
                      </span>
                    </div>
                    {item.notes && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>{item.notes}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => openEdit(item)}>Edit</button>
                    <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => markDone(item)}><CheckCircle size={12} />Done</button>
                    <button className="btn btn-danger" style={{ fontSize: 12, padding: "6px 10px" }} onClick={() => deleteMaintenance(item.id)}>✕</button>
                  </div>
                </div>
              </div>
            )
          })}
          {sorted.length === 0 && (
            <div style={{ textAlign: "center", padding: "50px 20px", color: "var(--text-muted)" }}>No tasks in this filter</div>
          )}
        </div>
      </div>
    </div>
  )
}
