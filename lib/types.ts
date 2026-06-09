// ===== CORE VESSEL =====
export interface Vessel {
  imo: string
  name: string
  type: string
  flag: string
  grt: number
  builtYear: number
  voltageSystem: string
  createdAt: string
  updatedAt: string
}

// ===== LOAD SCHEDULE =====
export interface Switchboard {
  id: string
  name: string
  voltage: number
  loads: LoadItem[]
}

export interface LoadItem {
  id: string
  name: string
  kW: number
  pf: number
  qty: number
  running: boolean
  category: string
}

// ===== GENERATORS =====
export interface Generator {
  id: string
  name: string
  ratedKVA: number
  voltage: number
  pf: number
  running: boolean
  primeMover: string
  engineMake: string
  runHours: number
  lastServiceDate: string
}

// ===== CABLES =====
export interface Cable {
  id: string
  tag: string
  from: string
  to: string
  route: string
  lengthM: number
  conductor: string
  crossSectionMm2: number
  cores: number
  currentRating: number
  currentActual: number
  insulation: string
  faultCondition: 'Normal' | 'Insulation Low' | 'Open Circuit' | 'Earth Fault'
  notes: string
}

// ===== FAULT LOGS =====
export interface FaultLog {
  id: string
  timestamp: string
  equipment: string
  faultCode: string
  description: string
  severity: 'Critical' | 'Major' | 'Minor' | 'Info'
  acknowledged: boolean
  resolvedAt: string
  resolution: string
}

// ===== MAINTENANCE =====
export interface MaintenanceItem {
  id: string
  equipment: string
  task: string
  intervalDays: number
  lastDone: string
  nextDue: string
  category: 'Class' | 'PMS' | 'Manufacturer' | 'Survey'
  notes: string
}

// ===== TRENDS =====
export interface TrendPoint {
  date: string
  totalLoadKW: number
  generatorLoadPct: number
  avgPF: number
  faultCount: number
}

// ===== VESSEL DATA (full workspace) =====
export interface VesselData {
  vessel: Vessel
  switchboards: Switchboard[]
  generators: Generator[]
  cables: Cable[]
  faultLogs: FaultLog[]
  maintenanceItems: MaintenanceItem[]
  trendData: TrendPoint[]
}

export type Fleet = Record<string, VesselData>
