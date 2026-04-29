export type WorkoutType = 'A' | 'B' | 'C'
export type ExerciseCategory = 'kettlebell' | 'cardio' | 'bodyweight' | 'dips'
export type ExerciseUnit = 'weight_reps' | 'reps_only' | 'duration' | 'distance_duration'

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  unit: ExerciseUnit
  defaultWeight?: number   // kg
  defaultReps?: number
  defaultSets?: number
  defaultDuration?: number // seconds
  defaultDistance?: number // miles
  weightIncrement?: number // kg to add on success
  description?: string
}

export interface PlannedSet {
  reps?: number
  weight?: number    // kg
  duration?: number  // seconds
  distance?: number  // miles
  speed?: number     // mph
  resistance?: number
}

export interface PlannedExercise {
  exerciseId: string
  sets: number
  planned: PlannedSet
  notes?: string
}

export interface CompletedSet {
  setNumber: number
  reps?: number
  weight?: number
  duration?: number
  distance?: number
  speed?: number
  resistance?: number
  completed: boolean
  skipped?: boolean
}

export interface WorkoutExerciseLog {
  exerciseId: string
  planned: PlannedSet
  plannedSets: number
  sets: CompletedSet[]
  completed: boolean
  notes?: string
}

export interface WorkoutLog {
  id: string
  date: string          // ISO date string YYYY-MM-DD
  startTime: string     // ISO datetime
  endTime?: string
  templateType: WorkoutType
  templateName: string
  exercises: WorkoutExerciseLog[]
  notes?: string
}

export interface BodyWeightEntry {
  id: string
  date: string   // YYYY-MM-DD
  weight: number // lbs
}

export interface WorkoutTemplate {
  type: WorkoutType
  name: string
  description: string
  exercises: PlannedExercise[]
}

export interface ProgressionResult {
  weight?: number
  reps?: number
  duration?: number
  distance?: number
  speed?: number
  resistance?: number
  improved: boolean
  message: string
}
