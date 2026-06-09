"use client"
import { useState, useEffect, useCallback } from "react"
import { VesselData, Switchboard, Generator, Cable, FaultLog, MaintenanceItem } from "../lib/types"
import { getVessel, saveVessel } from "../lib/storage"
import { DEMO_DATA } from "../lib/demoData"

export function useVessel(imo: string) {
  const [data, setData] = useState<VesselData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!imo) return
    let v = getVessel(imo)
    if (!v && (DEMO_DATA as Record<string, VesselData>)[imo]) {
      v = (DEMO_DATA as Record<string, VesselData>)[imo]
    }
    setData(v ?? null)
    setLoading(false)
  }, [imo])

  const persist = useCallback((updated: VesselData) => {
    setData(updated)
    saveVessel(imo, updated)
  }, [imo])

  const updateSwitchboard = useCallback((sb: Switchboard) => {
    if (!data) return
    const switchboards = data.switchboards.map(s => s.id === sb.id ? sb : s)
    persist({ ...data, switchboards })
  }, [data, persist])

  const addSwitchboard = useCallback((sb: Switchboard) => {
    if (!data) return
    persist({ ...data, switchboards: [...data.switchboards, sb] })
  }, [data, persist])

  const deleteSwitchboard = useCallback((id: string) => {
    if (!data) return
    persist({ ...data, switchboards: data.switchboards.filter(s => s.id !== id) })
  }, [data, persist])

  const updateGenerator = useCallback((gen: Generator) => {
    if (!data) return
    const generators = data.generators.map(g => g.id === gen.id ? gen : g)
    persist({ ...data, generators })
  }, [data, persist])

  const addGenerator = useCallback((gen: Generator) => {
    if (!data) return
    persist({ ...data, generators: [...data.generators, gen] })
  }, [data, persist])

  const deleteGenerator = useCallback((id: string) => {
    if (!data) return
    persist({ ...data, generators: data.generators.filter(g => g.id !== id) })
  }, [data, persist])

  const updateCable = useCallback((cable: Cable) => {
    if (!data) return
    const cables = data.cables.map(c => c.id === cable.id ? cable : c)
    persist({ ...data, cables })
  }, [data, persist])

  const addCable = useCallback((cable: Cable) => {
    if (!data) return
    persist({ ...data, cables: [...data.cables, cable] })
  }, [data, persist])

  const deleteCable = useCallback((id: string) => {
    if (!data) return
    persist({ ...data, cables: data.cables.filter(c => c.id !== id) })
  }, [data, persist])

  const addFaultLog = useCallback((fault: FaultLog) => {
    if (!data) return
    persist({ ...data, faultLogs: [fault, ...data.faultLogs] })
  }, [data, persist])

  const updateFaultLog = useCallback((fault: FaultLog) => {
    if (!data) return
    const faultLogs = data.faultLogs.map(f => f.id === fault.id ? fault : f)
    persist({ ...data, faultLogs })
  }, [data, persist])

  const updateMaintenance = useCallback((item: MaintenanceItem) => {
    if (!data) return
    const maintenanceItems = data.maintenanceItems.map(m => m.id === item.id ? item : m)
    persist({ ...data, maintenanceItems })
  }, [data, persist])

  const addMaintenance = useCallback((item: MaintenanceItem) => {
    if (!data) return
    persist({ ...data, maintenanceItems: [...data.maintenanceItems, item] })
  }, [data, persist])

  const deleteMaintenance = useCallback((id: string) => {
    if (!data) return
    persist({ ...data, maintenanceItems: data.maintenanceItems.filter(m => m.id !== id) })
  }, [data, persist])

  return {
    data, loading,
    updateSwitchboard, addSwitchboard, deleteSwitchboard,
    updateGenerator, addGenerator, deleteGenerator,
    updateCable, addCable, deleteCable,
    addFaultLog, updateFaultLog,
    updateMaintenance, addMaintenance, deleteMaintenance,
  }
}
