import { WorkoutLog, BodyWeightEntry } from '../types'

const KEYS = {
  workouts: 'kb_tracker_workouts',
  bodyWeight: 'kb_tracker_bodyweight',
} as const

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data))
}

// ── Workout logs ──────────────────────────────────────────────

export function getWorkoutLogs(): WorkoutLog[] {
  return load<WorkoutLog[]>(KEYS.workouts, [])
}

export function saveWorkoutLog(log: WorkoutLog): void {
  const all = getWorkoutLogs()
  const idx = all.findIndex(w => w.id === log.id)
  if (idx >= 0) {
    all[idx] = log
  } else {
    all.push(log)
  }
  save(KEYS.workouts, all)
}

export function deleteWorkoutLog(id: string): void {
  const all = getWorkoutLogs().filter(w => w.id !== id)
  save(KEYS.workouts, all)
}

// ── Body weight ───────────────────────────────────────────────

export function getBodyWeightEntries(): BodyWeightEntry[] {
  return load<BodyWeightEntry[]>(KEYS.bodyWeight, [])
}

export function saveBodyWeightEntry(entry: BodyWeightEntry): void {
  const all = getBodyWeightEntries()
  const idx = all.findIndex(e => e.date === entry.date)
  if (idx >= 0) {
    all[idx] = entry
  } else {
    all.push(entry)
  }
  all.sort((a, b) => a.date.localeCompare(b.date))
  save(KEYS.bodyWeight, all)
}

export function deleteBodyWeightEntry(id: string): void {
  const all = getBodyWeightEntries().filter(e => e.id !== id)
  save(KEYS.bodyWeight, all)
}

// ── Helpers ───────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
