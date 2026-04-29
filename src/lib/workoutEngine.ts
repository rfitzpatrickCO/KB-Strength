import { WorkoutLog, WorkoutTemplate, WorkoutType, PlannedSet, ProgressionResult } from '../types'
import { exerciseMap } from './exercises'

// ── Workout templates (A / B / C rotation) ───────────────────

const TEMPLATES: WorkoutTemplate[] = [
  {
    type: 'A',
    name: 'Kettlebell Strength',
    description: 'Heavy KB moves + dips. Focus on power and fat burn.',
    exercises: [
      { exerciseId: 'kb_swing',          sets: 4, planned: { reps: 15, weight: 16 } },
      { exerciseId: 'kb_goblet_squat',   sets: 3, planned: { reps: 12, weight: 16 } },
      { exerciseId: 'kb_clean_press_l',  sets: 3, planned: { reps: 8,  weight: 12 } },
      { exerciseId: 'kb_clean_press_r',  sets: 3, planned: { reps: 8,  weight: 12 } },
      { exerciseId: 'dips',              sets: 3, planned: { reps: 10 } },
      { exerciseId: 'plank',             sets: 3, planned: { duration: 45 } },
    ],
  },
  {
    type: 'B',
    name: 'Cardio + Bodyweight',
    description: 'Cardio intervals + bodyweight circuit for maximum calorie burn.',
    exercises: [
      { exerciseId: 'treadmill',         sets: 1, planned: { duration: 1500, distance: 1.5 } },
      { exerciseId: 'pushups',           sets: 3, planned: { reps: 15 } },
      { exerciseId: 'bw_squat',          sets: 3, planned: { reps: 20 } },
      { exerciseId: 'walking_lunges',    sets: 3, planned: { reps: 12 } },
      { exerciseId: 'mountain_climbers', sets: 3, planned: { duration: 30 } },
      { exerciseId: 'elliptical',        sets: 1, planned: { duration: 900, resistance: 8 } },
    ],
  },
  {
    type: 'C',
    name: 'KB Full-Body Circuit',
    description: 'Compound KB pulls + burpees. Builds strength and burns fat.',
    exercises: [
      { exerciseId: 'kb_deadlift',           sets: 4, planned: { reps: 10, weight: 24 } },
      { exerciseId: 'kb_row_l',              sets: 3, planned: { reps: 10, weight: 16 } },
      { exerciseId: 'kb_row_r',             sets: 3, planned: { reps: 10, weight: 16 } },
      { exerciseId: 'kb_shoulder_press_l',   sets: 3, planned: { reps: 8,  weight: 12 } },
      { exerciseId: 'kb_shoulder_press_r',   sets: 3, planned: { reps: 8,  weight: 12 } },
      { exerciseId: 'burpees',               sets: 3, planned: { reps: 10 } },
      { exerciseId: 'kb_russian_twist',      sets: 3, planned: { reps: 20, weight: 12 } },
    ],
  },
]

export function getTemplate(type: WorkoutType): WorkoutTemplate {
  return TEMPLATES.find(t => t.type === type)!
}

export function getAllTemplates(): WorkoutTemplate[] {
  return TEMPLATES
}

// ── Progression logic ─────────────────────────────────────────

function exerciseCompletedSuccessfully(log: WorkoutLog, exerciseId: string): boolean {
  const ex = log.exercises.find(e => e.exerciseId === exerciseId)
  if (!ex) return false
  const completedSets = ex.sets.filter(s => s.completed && !s.skipped)
  return completedSets.length >= ex.plannedSets
}

export function getProgression(
  exerciseId: string,
  history: WorkoutLog[],
): ProgressionResult | null {
  const ex = exerciseMap[exerciseId]
  if (!ex) return null

  // Find last workout that included this exercise
  for (let i = history.length - 1; i >= 0; i--) {
    const log = history[i]
    const exLog = log.exercises.find(e => e.exerciseId === exerciseId)
    if (!exLog) continue

    const succeeded = exerciseCompletedSuccessfully(log, exerciseId)

    if (ex.unit === 'weight_reps') {
      const lastWeight = exLog.planned.weight ?? ex.defaultWeight ?? 16
      const lastReps = exLog.planned.reps ?? ex.defaultReps ?? 10
      if (succeeded) {
        const newWeight = lastWeight + (ex.weightIncrement ?? 2)
        return { weight: newWeight, reps: lastReps, improved: true, message: `↑ +${ex.weightIncrement ?? 2}kg from last session` }
      } else {
        return { weight: lastWeight, reps: lastReps, improved: false, message: 'Same weight — finish all sets to progress' }
      }
    }

    if (ex.unit === 'reps_only') {
      const lastReps = exLog.planned.reps ?? ex.defaultReps ?? 10
      if (succeeded) {
        return { reps: lastReps + 1, improved: true, message: `↑ +1 rep from last session` }
      } else {
        return { reps: lastReps, improved: false, message: 'Same reps — complete all sets to progress' }
      }
    }

    if (ex.unit === 'duration') {
      const lastDuration = exLog.planned.duration ?? ex.defaultDuration ?? 30
      if (succeeded) {
        return { duration: lastDuration + 5, improved: true, message: `↑ +5s from last session` }
      } else {
        return { duration: lastDuration, improved: false, message: 'Same duration' }
      }
    }

    if (ex.unit === 'distance_duration') {
      const lastDuration = exLog.planned.duration ?? ex.defaultDuration ?? 1500
      const lastDistance = exLog.planned.distance ?? ex.defaultDistance
      if (succeeded) {
        const newDuration = lastDuration + 120 // +2 min
        return { duration: newDuration, distance: lastDistance, improved: true, message: `↑ +2 min from last session` }
      } else {
        return { duration: lastDuration, distance: lastDistance, improved: false, message: 'Same duration' }
      }
    }

    return null
  }
  return null
}

// ── Next workout generator ────────────────────────────────────

export function getNextWorkoutType(history: WorkoutLog[]): WorkoutType {
  if (history.length === 0) return 'A'
  const last = history[history.length - 1].templateType
  return last === 'A' ? 'B' : last === 'B' ? 'C' : 'A'
}

export function buildNextWorkout(history: WorkoutLog[]): WorkoutTemplate {
  const type = getNextWorkoutType(history)
  const template = getTemplate(type)

  // Apply progression to each exercise
  const exercises = template.exercises.map(pe => {
    const prog = getProgression(pe.exerciseId, history)
    if (!prog) return pe

    const planned: PlannedSet = { ...pe.planned }
    if (prog.weight !== undefined) planned.weight = prog.weight
    if (prog.reps !== undefined) planned.reps = prog.reps
    if (prog.duration !== undefined) planned.duration = prog.duration
    if (prog.distance !== undefined) planned.distance = prog.distance
    if (prog.resistance !== undefined) planned.resistance = prog.resistance

    return { ...pe, planned, notes: prog.message }
  })

  return { ...template, exercises }
}

// ── Formatting helpers ────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m} min` : `${m}:${String(s).padStart(2, '0')}`
}

export function formatPlanned(planned: PlannedSet, unit: string): string {
  if (unit === 'weight_reps') return `${planned.weight ?? '?'}kg × ${planned.reps ?? '?'} reps`
  if (unit === 'reps_only') return `${planned.reps ?? '?'} reps`
  if (unit === 'duration') return formatDuration(planned.duration ?? 0)
  if (unit === 'distance_duration') {
    const dist = planned.distance ? `${planned.distance} mi · ` : ''
    return `${dist}${formatDuration(planned.duration ?? 0)}`
  }
  return ''
}

export function workoutDuration(log: WorkoutLog): string {
  if (!log.endTime) return '—'
  const ms = new Date(log.endTime).getTime() - new Date(log.startTime).getTime()
  return formatDuration(Math.round(ms / 1000))
}
