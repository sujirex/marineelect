"use client"
import { useEffect, useState } from "react"
import { useTheme } from "../context/ThemeContext"

/** Resolved brand colours for chart libraries that need literal values. Refreshes on theme change. */
const NAMES = ["ink", "muted", "faint", "line", "surface", "inset", "g1", "g2", "g3", "g4", "ok", "t-warn", "t-danger", "action", "signal", "spark"] as const
type Name = typeof NAMES[number]
export type BrandColors = Record<Name, string>

const LIGHT: BrandColors = { ink: "#0A0B12", muted: "#4B5263", faint: "#6B7280", line: "#E5E7EF", surface: "#FFFFFF", inset: "#F3F4F8", g1: "#0891B2", g2: "#2563EB", g3: "#7C3AED", g4: "#DB2777", ok: "#15803D", "t-warn": "#B45309", "t-danger": "#B91C1C", action: "#6D28D9", signal: "#0E7490", spark: "#EA580C" }

export function useBrandColors(): BrandColors {
  const { theme } = useTheme()
  const [c, setC] = useState<BrandColors>(LIGHT)
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement)
    const next = { ...LIGHT }
    NAMES.forEach(n => { const v = cs.getPropertyValue("--" + n).trim(); if (v) next[n] = v })
    setC(next)
  }, [theme])
  return c
}
