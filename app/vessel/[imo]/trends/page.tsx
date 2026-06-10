"use client"
import React from "react"
import { useVessel } from "../../../../hooks/useVessel"
import { VesselSidebar } from "../../../../components/VesselSidebar"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

function trend(data: number[]): "up" | "down" | "stable" {
  if (data.length < 7) return "stable"
  const recent = data.slice(-7).reduce((a, b) => a + b, 0) / 7
  const prior = data.slice(-14, -7).reduce((a, b) => a + b, 0) / 7
  if (recent > prior * 1.05) return "up"
  if (recent < prior * 0.95) return "down"
  return "stable"
}
function TrendIcon({ dir }: { dir: "up"|"down"|"stable" }) {
  if (dir === "up") return <TrendingUp size={16} color="var(--danger)" />
  if (dir === "down") return <TrendingDown size={16} color="var(--success)" />
  return <Minus size={16} color="var(--text-muted)" />
}

const tooltipStyle = {
  contentStyle: { background: "#1a2235", border: "1px solid rgba(102,125,182,.3)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "#8a9bbf" },
}

export default function TrendsPage({ params }: { params: { imo: string } }) {
  const { imo } = params
  const { data, loading } = useVessel(imo)

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--text-muted)" }}>Loading…</div>
  if (!data) return null

  const td = data.trendData
  // Aggregate to weekly for cleaner charts
  const weekly: typeof td = []
  for (let i = 0; i < td.length; i += 7) {
    const slice = td.slice(i, i + 7)
    if (!slice.length) continue
    weekly.push({
      date: slice[0].date,
      totalLoadKW: Math.round(slice.reduce((t, d) => t + d.totalLoadKW, 0) / slice.length),
      generatorLoadPct: Math.round(slice.reduce((t, d) => t + d.generatorLoadPct, 0) / slice.length),
      avgPF: Math.round((slice.reduce((t, d) => t + d.avgPF, 0) / slice.length) * 1000) / 1000,
      faultCount: slice.reduce((t, d) => t + d.faultCount, 0),
    })
  }

  const loadValues = td.map(d => d.totalLoadKW)
  const pfValues = td.map(d => d.avgPF)
  const loadTrend = trend(loadValues)
  const pfTrend = trend(pfValues)

  const avgLoad = Math.round(loadValues.reduce((a, b) => a + b, 0) / loadValues.length)
  const maxLoad = Math.max(...loadValues)
  const minLoad = Math.min(...loadValues)
  const totalFaults = td.reduce((t, d) => t + d.faultCount, 0)
  const avgPF = Math.round((pfValues.reduce((a, b) => a + b, 0) / pfValues.length) * 1000) / 1000

  const charts = [
    {
      title: "Total Active Load (kW)",
      sub: `Avg ${avgLoad.toLocaleString()} kW · Peak ${maxLoad.toLocaleString()} kW`,
      trendDir: loadTrend,
      el: (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weekly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} width={50} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="totalLoadKW" stroke="#667db6" strokeWidth={2} dot={false} name="kW" />
          </LineChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Generator Load Factor (%)",
      sub: "Average across running generators",
      trendDir: loadTrend,
      el: (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weekly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" width={42} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => [`${v}%`, "Load Factor"]} />
            <Line type="monotone" dataKey="generatorLoadPct" stroke="#0082c8" strokeWidth={2} dot={false} name="Load %" />
          </LineChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Average Power Factor",
      sub: `90-day avg PF: ${avgPF}`,
      trendDir: pfTrend,
      el: (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={weekly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} domain={[0.7, 1.0]} width={42} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="avgPF" stroke="#22c55e" strokeWidth={2} dot={false} name="PF" />
          </LineChart>
        </ResponsiveContainer>
      )
    },
    {
      title: "Weekly Fault Count",
      sub: `${totalFaults} total faults in 90 days`,
      trendDir: "stable" as const,
      el: (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weekly} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} width={30} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="faultCount" fill="#ef4444" radius={[3,3,0,0]} name="Faults" />
          </BarChart>
        </ResponsiveContainer>
      )
    },
  ]

  return (
    <div className="vessel-layout">
      <VesselSidebar imo={imo} vesselName={data.vessel.name} />
      <div className="vessel-content">

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>90-Day Trend Analysis</h1>
          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Historical electrical performance · {td.length} data points</div>
        </div>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Avg Load", value: `${avgLoad.toLocaleString()} kW` },
            { label: "Peak Load", value: `${maxLoad.toLocaleString()} kW` },
            { label: "Min Load", value: `${minLoad.toLocaleString()} kW` },
            { label: "Avg PF", value: avgPF },
            { label: "Total Faults", value: totalFaults },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: 16 }}>
          {charts.map(c => (
            <div key={c.title} className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{c.title}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{c.sub}</div>
                </div>
                <TrendIcon dir={c.trendDir} />
              </div>
              {c.el}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
