"use client"
import { useState, useEffect, useCallback } from "react"
import { Fleet, VesselData } from "../lib/types"
import { loadFleet, saveFleet, deleteVessel, fleetLoaded } from "../lib/storage"
import { DEMO_DATA } from "../lib/demoData"

export function useFleet() {
  const [fleet, setFleet] = useState<Fleet>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!fleetLoaded()) {
      saveFleet(DEMO_DATA as Fleet)
    }
    setFleet(loadFleet())
    setLoading(false)
  }, [])

  const addVessel = useCallback((data: VesselData) => {
    setFleet(prev => {
      const updated = { ...prev, [data.vessel.imo]: data }
      saveFleet(updated)
      return updated
    })
  }, [])

  const removeVessel = useCallback((imo: string) => {
    setFleet(prev => {
      const updated = { ...prev }
      delete updated[imo]
      deleteVessel(imo)
      return updated
    })
  }, [])

  const vessels = Object.values(fleet)

  return { fleet, vessels, loading, addVessel, removeVessel }
}
