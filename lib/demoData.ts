import { VesselData } from "./types"

function pastDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split("T")[0]
}

function futureDate(daysAhead: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().split("T")[0]
}

function trendData(days = 90) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (days - i))
    const load = 3200 + Math.sin(i / 7) * 400 + Math.random() * 200
    return {
      date: d.toISOString().split("T")[0],
      totalLoadKW: Math.round(load),
      generatorLoadPct: Math.round(65 + Math.sin(i / 5) * 10 + Math.random() * 5),
      avgPF: Math.round((0.84 + Math.sin(i / 10) * 0.03) * 100) / 100,
      faultCount: Math.random() > 0.85 ? Math.floor(Math.random() * 3) + 1 : 0,
    }
  })
}

export const DEMO_VESSEL_1: VesselData = {
  vessel: {
    imo: "9876543", name: "MV Pacific Star", type: "General Cargo", flag: "Panama",
    grt: 12450, builtYear: 2015, voltageSystem: "440V",
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  switchboards: [
    {
      id: "msb1", name: "Main Switchboard", voltage: 440,
      loads: [
        { id: "l1", name: "Main Propulsion Motor", kW: 3200, pf: 0.88, qty: 1, running: true, category: "Propulsion" },
        { id: "l2", name: "Bow Thruster", kW: 750, pf: 0.85, qty: 1, running: false, category: "Propulsion" },
        { id: "l3", name: "HVAC Compressors", kW: 280, pf: 0.82, qty: 2, running: true, category: "Accommodation" },
        { id: "l4", name: "Cargo Crane #1", kW: 450, pf: 0.87, qty: 1, running: false, category: "Deck" },
        { id: "l5", name: "Cargo Crane #2", kW: 450, pf: 0.87, qty: 1, running: false, category: "Deck" },
        { id: "l6", name: "Fire & GS Pump", kW: 75, pf: 0.83, qty: 2, running: true, category: "Safety" },
        { id: "l7", name: "Bilge Pump", kW: 22, pf: 0.82, qty: 2, running: false, category: "Safety" },
        { id: "l8", name: "Steering Gear", kW: 55, pf: 0.85, qty: 1, running: true, category: "Navigation" },
        { id: "l9", name: "Navigation Instruments", kW: 15, pf: 0.95, qty: 1, running: true, category: "Navigation" },
        { id: "l10", name: "Lighting Distribution", kW: 65, pf: 0.90, qty: 1, running: true, category: "Accommodation" },
      ],
    },
    {
      id: "esb1", name: "Emergency Switchboard", voltage: 440,
      loads: [
        { id: "e1", name: "Emergency Lighting", kW: 12, pf: 0.90, qty: 1, running: true, category: "Safety" },
        { id: "e2", name: "GMDSS Equipment", kW: 8, pf: 0.95, qty: 1, running: true, category: "Safety" },
        { id: "e3", name: "Fire Detection System", kW: 3, pf: 0.95, qty: 1, running: true, category: "Safety" },
        { id: "e4", name: "Emergency Fire Pump", kW: 45, pf: 0.83, qty: 1, running: false, category: "Safety" },
      ],
    },
  ],
  generators: [
    { id: "g1", name: "Main Gen #1 — MAN B&W", ratedKVA: 2750, voltage: 440, pf: 0.80, running: true, primeMover: "Diesel", engineMake: "MAN B&W", runHours: 14230, lastServiceDate: pastDate(45) },
    { id: "g2", name: "Main Gen #2 — MAN B&W", ratedKVA: 2750, voltage: 440, pf: 0.80, running: true, primeMover: "Diesel", engineMake: "MAN B&W", runHours: 12870, lastServiceDate: pastDate(30) },
    { id: "g3", name: "Emergency Gen — Caterpillar", ratedKVA: 350, voltage: 440, pf: 0.80, running: false, primeMover: "Diesel", engineMake: "Caterpillar", runHours: 820, lastServiceDate: pastDate(60) },
  ],
  cables: [
    { id: "c1", tag: "MSB-001", from: "Main Switchboard", to: "Main Propulsion Motor", route: "E/R Cable Tray A", lengthM: 45, conductor: "Cu", crossSectionMm2: 240, cores: 3, currentRating: 420, currentActual: 380, insulation: "XLPE", faultCondition: "Normal", notes: "" },
    { id: "c2", tag: "MSB-002", from: "Main Switchboard", to: "Bow Thruster Panel", route: "Forward Cable Tray", lengthM: 120, conductor: "Cu", crossSectionMm2: 95, cores: 3, currentRating: 230, currentActual: 0, insulation: "XLPE", faultCondition: "Normal", notes: "" },
    { id: "c3", tag: "MSB-010", from: "Main Switchboard", to: "HVAC Control Panel", route: "Accommodation Tray", lengthM: 68, conductor: "Cu", crossSectionMm2: 35, cores: 3, currentRating: 110, currentActual: 88, insulation: "PVC", faultCondition: "Insulation Low", notes: "Megger reading 2.1 MΩ — monitor" },
    { id: "c4", tag: "MSB-020", from: "Main Switchboard", to: "Cargo Crane DB #1", route: "Deck Cable Tray Port", lengthM: 85, conductor: "Cu", crossSectionMm2: 70, cores: 3, currentRating: 165, currentActual: 0, insulation: "XLPE", faultCondition: "Normal", notes: "" },
    { id: "c5", tag: "ESB-001", from: "Emergency Switchboard", to: "Emergency Lighting DB", route: "Emergency Route", lengthM: 32, conductor: "Cu", crossSectionMm2: 16, cores: 2, currentRating: 76, currentActual: 22, insulation: "XLPE", faultCondition: "Normal", notes: "" },
    { id: "c6", tag: "MSB-030", from: "Main Switchboard", to: "Steering Gear Panel", route: "Aft Cable Tray", lengthM: 95, conductor: "Cu", crossSectionMm2: 16, cores: 3, currentRating: 76, currentActual: 48, insulation: "XLPE", faultCondition: "Normal", notes: "" },
  ],
  faultLogs: [
    { id: "f1", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), equipment: "Main Gen #1", faultCode: "G1-HT-001", description: "High coolant temperature alarm — 88°C", severity: "Major", acknowledged: true, resolvedAt: new Date(Date.now() - 1.5 * 3600000).toISOString(), resolution: "Cleaned heat exchanger, temperature normalised to 72°C" },
    { id: "f2", timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), equipment: "HVAC Compressor #2", faultCode: "HVAC-LP-003", description: "Low pressure suction alarm", severity: "Minor", acknowledged: true, resolvedAt: new Date(Date.now() - 5 * 3600000).toISOString(), resolution: "Refrigerant top-up completed" },
    { id: "f3", timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), equipment: "Cable MSB-010", faultCode: "INS-LR-010", description: "Low insulation resistance detected — 2.1 MΩ", severity: "Major", acknowledged: false, resolvedAt: "", resolution: "" },
    { id: "f4", timestamp: new Date(Date.now() - 48 * 3600000).toISOString(), equipment: "Main Gen #1", faultCode: "G1-HT-001", description: "High coolant temperature alarm — 86°C", severity: "Major", acknowledged: true, resolvedAt: new Date(Date.now() - 47 * 3600000).toISOString(), resolution: "Temporary — full cleaning deferred" },
    { id: "f5", timestamp: new Date(Date.now() - 72 * 3600000).toISOString(), equipment: "Fire Detection Panel", faultCode: "FD-BT-002", description: "Battery backup low — 22V", severity: "Minor", acknowledged: true, resolvedAt: new Date(Date.now() - 70 * 3600000).toISOString(), resolution: "Battery replaced" },
  ],
  maintenanceItems: [
    { id: "m1", equipment: "Main Gen #1", task: "4000H service — filters, injectors, valve clearance", intervalDays: 180, lastDone: pastDate(165), nextDue: futureDate(15), category: "PMS", notes: "Parts ordered" },
    { id: "m2", equipment: "Main Gen #2", task: "4000H service", intervalDays: 180, lastDone: pastDate(120), nextDue: futureDate(60), category: "PMS", notes: "" },
    { id: "m3", equipment: "Emergency Generator", task: "Monthly test run — 30 min load test", intervalDays: 30, lastDone: pastDate(8), nextDue: futureDate(22), category: "Class", notes: "SOLAS requirement" },
    { id: "m4", equipment: "Lifeboat Release Mechanism", task: "Annual inspection & lubrication", intervalDays: 365, lastDone: pastDate(280), nextDue: futureDate(85), category: "Survey", notes: "Class surveyor attendance required" },
    { id: "m5", equipment: "Fire Detection System", task: "Detector head cleaning & calibration", intervalDays: 90, lastDone: pastDate(95), nextDue: futureDate(-5), category: "Manufacturer", notes: "OVERDUE — schedule immediately" },
    { id: "m6", equipment: "All Electrical Panels", task: "Infrared thermographic survey", intervalDays: 365, lastDone: pastDate(400), nextDue: futureDate(-35), category: "Class", notes: "OVERDUE — required for class renewal" },
    { id: "m7", equipment: "Steering Gear", task: "Hydraulic oil sample & analysis", intervalDays: 180, lastDone: pastDate(90), nextDue: futureDate(90), category: "PMS", notes: "" },
    { id: "m8", equipment: "Bilge High-Level Alarms", task: "Functional test all spaces", intervalDays: 30, lastDone: pastDate(25), nextDue: futureDate(5), category: "Class", notes: "" },
  ],
  trendData: trendData(90),
}

export const DEMO_VESSEL_2: VesselData = {
  vessel: {
    imo: "9234567", name: "MV Atlantic Spirit", type: "Chemical Tanker", flag: "Marshall Islands",
    grt: 8920, builtYear: 2018, voltageSystem: "440V",
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  switchboards: [
    {
      id: "msb2", name: "Main Switchboard", voltage: 440,
      loads: [
        { id: "l20", name: "Cargo Pump #1", kW: 520, pf: 0.87, qty: 1, running: true, category: "Cargo" },
        { id: "l21", name: "Cargo Pump #2", kW: 520, pf: 0.87, qty: 1, running: true, category: "Cargo" },
        { id: "l22", name: "Cargo Pump #3", kW: 520, pf: 0.87, qty: 1, running: false, category: "Cargo" },
        { id: "l23", name: "Inert Gas Generator", kW: 185, pf: 0.84, qty: 1, running: true, category: "Cargo" },
        { id: "l24", name: "HVAC System", kW: 165, pf: 0.82, qty: 2, running: true, category: "Accommodation" },
        { id: "l25", name: "Ballast Pump", kW: 280, pf: 0.85, qty: 2, running: false, category: "Deck" },
        { id: "l26", name: "Navigation & Comms", kW: 18, pf: 0.95, qty: 1, running: true, category: "Navigation" },
        { id: "l27", name: "Galley Equipment", kW: 55, pf: 0.92, qty: 1, running: true, category: "Accommodation" },
      ],
    },
  ],
  generators: [
    { id: "g4", name: "Main Gen #1 — Wärtsilä", ratedKVA: 1850, voltage: 440, pf: 0.80, running: true, primeMover: "Diesel", engineMake: "Wärtsilä", runHours: 9450, lastServiceDate: pastDate(20) },
    { id: "g5", name: "Main Gen #2 — Wärtsilä", ratedKVA: 1850, voltage: 440, pf: 0.80, running: false, primeMover: "Diesel", engineMake: "Wärtsilä", runHours: 7230, lastServiceDate: pastDate(90) },
    { id: "g6", name: "Emergency Gen — Volvo Penta", ratedKVA: 250, voltage: 440, pf: 0.80, running: false, primeMover: "Diesel", engineMake: "Volvo Penta", runHours: 340, lastServiceDate: pastDate(15) },
  ],
  cables: [
    { id: "c10", tag: "MSB2-001", from: "Main Switchboard", to: "Cargo Pump DB", route: "Pump Room Cable Tray", lengthM: 38, conductor: "Cu", crossSectionMm2: 120, cores: 3, currentRating: 290, currentActual: 245, insulation: "XLPE", faultCondition: "Normal", notes: "" },
    { id: "c11", tag: "MSB2-002", from: "Main Switchboard", to: "Inert Gas Gen Panel", route: "Cargo Control Room", lengthM: 22, conductor: "Cu", crossSectionMm2: 35, cores: 3, currentRating: 110, currentActual: 78, insulation: "XLPE", faultCondition: "Normal", notes: "" },
    { id: "c12", tag: "MSB2-010", from: "Main Switchboard", to: "Ballast Pump #1", route: "Port Cable Tray", lengthM: 55, conductor: "Cu", crossSectionMm2: 50, cores: 3, currentRating: 130, currentActual: 0, insulation: "XLPE", faultCondition: "Earth Fault", notes: "Earth fault relay tripped — investigate pump room flooding" },
  ],
  faultLogs: [
    { id: "f10", timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), equipment: "Ballast Pump #1 Cable", faultCode: "EF-BP-001", description: "Earth fault relay trip on ballast pump #1 feeder", severity: "Critical", acknowledged: false, resolvedAt: "", resolution: "" },
    { id: "f11", timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), equipment: "Cargo Pump #2", faultCode: "CP-OL-002", description: "Overload relay trip — overcurrent 1.18×FLC", severity: "Major", acknowledged: true, resolvedAt: new Date(Date.now() - 11 * 3600000).toISOString(), resolution: "Relay reset, reduced pump speed" },
  ],
  maintenanceItems: [
    { id: "m10", equipment: "Main Gen #1", task: "2000H service", intervalDays: 90, lastDone: pastDate(85), nextDue: futureDate(5), category: "PMS", notes: "Schedule with port call" },
    { id: "m11", equipment: "Main Gen #2", task: "2000H service", intervalDays: 90, lastDone: pastDate(40), nextDue: futureDate(50), category: "PMS", notes: "" },
    { id: "m12", equipment: "Emergency Generator", task: "Monthly test run", intervalDays: 30, lastDone: pastDate(12), nextDue: futureDate(18), category: "Class", notes: "" },
    { id: "m13", equipment: "Cargo Pump Motors", task: "Insulation resistance test all motors", intervalDays: 180, lastDone: pastDate(185), nextDue: futureDate(-5), category: "Manufacturer", notes: "OVERDUE" },
  ],
  trendData: trendData(90),
}

export const DEMO_DATA = {
  [DEMO_VESSEL_1.vessel.imo]: DEMO_VESSEL_1,
  [DEMO_VESSEL_2.vessel.imo]: DEMO_VESSEL_2,
}
