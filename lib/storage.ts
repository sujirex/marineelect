"use client"
import { Fleet, VesselData } from "./types"

const KEY = "marineelect-v1"

export function loadFleet(): Fleet {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function saveFleet(fleet: Fleet): void {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(fleet))
}

export function getVessel(imo: string): VesselData | null {
  const fleet = loadFleet()
  return fleet[imo] ?? null
}

export function saveVessel(data: VesselData): void {
  const fleet = loadFleet()
  fleet[data.vessel.imo] = { ...data, vessel: { ...data.vessel, updatedAt: new Date().toISOString() } }
  saveFleet(fleet)
}

export function deleteVessel(imo: string): void {
  const fleet = loadFleet()
  delete fleet[imo]
  saveFleet(fleet)
}

export function fleetLoaded(): boolean {
  return Object.keys(loadFleet()).length > 0
}
