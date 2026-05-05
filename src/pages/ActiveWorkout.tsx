import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Clock, X, Check, SkipForward, Info } from 'lucide-react'
import { WorkoutLog, WorkoutExerciseLog, CompletedSet, PlannedSet, WorkoutTemplate } from '../types'
import { formatPlanned, formatDuration } from '../lib/workoutEngine'
import { exerciseMap } from '../lib/exercises'
import { generateId } from '../lib/storage'

interface Props {
  template: WorkoutTemplate
  existingLog?: WorkoutLog
  onSave: (log: WorkoutLog) => void
  onDiscard: () => void
}

function initLog(template: WorkoutTemplate, existing?: WorkoutLog): WorkoutLog {
  if (existing) return existing
  return {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    startTime: '', // empty until user explicitly taps Start
    templateType: template.type,
    templateName: template.name,
    exercises: template.exercises.map((pe) => ({
      exerciseId: pe.exerciseId,
      planned: pe.planned,
      plannedSets: pe.sets,
      sets: [],
      completed: false,
      notes: pe.notes,
    })),
  }
}

function SetInput({
  setNum,
  planned,
  unit,
  existing,
  onComplete,
  onSkip,
}: {
  setNum: number
  planned: PlannedSet
  unit: string
  existing?: CompletedSet
  onComplete: (set: CompletedSet) => void
  onSkip: (setNum: number) => void
}) {
  const [reps, setReps] = useState(String(existing?.reps ?? planned.reps ?? ''))
  const [weight, setWeight] = useState(String(existing?.weight ?? planned.weight ?? ''))
  const [duration, setDuration] = useState(String(existing?.duration ?? planned.duration ?? ''))
  const [distance, setDistance] = useState(String(existing?.distance ?? planned.distance ?? ''))

  const done = existing?.completed || existing?.skipped

  if (done) {
    return (
      <div className={`flex items-center gap-2 py-2 px-3 rounded-lg ${existing?.skipped ? 'bg-brand-input/40' : 'bg-brand-gold/10'}`}>
        {existing?.skipped
          ? <SkipForward className="w-4 h-4 text-brand-gray/70 shrink-0" />
          : <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />}
        <span className="text-sm text-brand-gray">
          Set {setNum}
          {existing?.completed && (
            <>
              {unit === 'weight_reps' && ` · ${existing.weight}kg × ${existing.reps}`}
              {unit === 'reps_only' && ` · ${existing.reps} reps`}
              {unit === 'duration' && ` · ${formatDuration(existing.duration ?? 0)}`}
              {unit === 'distance_duration' && ` · ${existing.distance} mi · ${formatDuration(existing.duration ?? 0)}`}
            </>
          )}
          {existing?.skipped && ' · Skipped'}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-brand-input/50 rounded-lg p-3 space-y-2">
      <div className="text-xs text-brand-gray font-medium">Set {setNum} · Target: {formatPlanned(planned, unit)}</div>
      <div className="flex gap-2 flex-wrap">
        {(unit === 'weight_reps') && (
          <>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-brand-gray/70">kg</label>
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                className="w-16 bg-brand-input text-brand-smoke rounded-lg px-2 py-2 text-sm text-center"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-brand-gray/70">Reps</label>
              <input
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={e => setReps(e.target.value)}
                className="w-16 bg-brand-input text-brand-smoke rounded-lg px-2 py-2 text-sm text-center"
              />
            </div>
          </>
        )}
        {unit === 'reps_only' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brand-gray/70">Reps</label>
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={e => setReps(e.target.value)}
              className="w-16 bg-brand-input text-brand-smoke rounded-lg px-2 py-2 text-sm text-center"
            />
          </div>
        )}
        {(unit === 'duration' || unit === 'distance_duration') && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brand-gray/70">Seconds</label>
            <input
              type="number"
              inputMode="numeric"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-20 bg-brand-input text-brand-smoke rounded-lg px-2 py-2 text-sm text-center"
            />
          </div>
        )}
        {unit === 'distance_duration' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-brand-gray/70">Miles</label>
            <input
              type="number"
              inputMode="decimal"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              className="w-16 bg-brand-input text-brand-smoke rounded-lg px-2 py-2 text-sm text-center"
            />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            onComplete({
              setNumber: setNum,
              reps: reps ? Number(reps) : undefined,
              weight: weight ? Number(weight) : undefined,
              duration: duration ? Number(duration) : undefined,
              distance: distance ? Number(distance) : undefined,
              completed: true,
            })
          }}
          className="flex-1 bg-brand-gold hover:bg-brand-gold-hi active:bg-brand-gold-lo text-brand-black rounded-lg py-2 text-sm font-semibold flex items-center justify-center gap-1 transition-colors"
        >
          <Check className="w-4 h-4" /> Done
        </button>
        <button
          onClick={() => onSkip(setNum)}
          className="bg-brand-input hover:bg-brand-border text-brand-smoke rounded-lg px-3 py-2 text-sm transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

function ExerciseCard({
  exLog,
  onUpdate,
}: {
  exLog: WorkoutExerciseLog
  onUpdate: (updated: WorkoutExerciseLog) => void
}) {
  const [expanded, setExpanded] = useState(!exLog.completed)
  const [showInfo, setShowInfo] = useState(false)
  const ex = exerciseMap[exLog.exerciseId]
  if (!ex) return null

  const totalDone = exLog.sets.filter(s => s.completed || s.skipped).length

  const handleComplete = (set: CompletedSet) => {
    const newSets = [...exLog.sets.filter(s => s.setNumber !== set.setNumber), set]
    newSets.sort((a, b) => a.setNumber - b.setNumber)
    const allDone = newSets.length >= exLog.plannedSets
    const updated: WorkoutExerciseLog = { ...exLog, sets: newSets, completed: allDone }
    if (allDone) setExpanded(false)
    onUpdate(updated)
  }

  const handleSkip = (setNum: number) => {
    const set: CompletedSet = { setNumber: setNum, completed: false, skipped: true }
    const newSets = [...exLog.sets.filter(s => s.setNumber !== setNum), set]
    newSets.sort((a, b) => a.setNumber - b.setNumber)
    const allDone = newSets.length >= exLog.plannedSets
    const updated: WorkoutExerciseLog = { ...exLog, sets: newSets, completed: allDone }
    if (allDone) setExpanded(false)
    onUpdate(updated)
  }

  const categoryColor: Record<string, string> = {
    kettlebell: 'text-brand-red',
    cardio: 'text-brand-blue-hi',
    bodyweight: 'text-brand-gold',
    dips: 'text-brand-smoke',
  }

  return (
    <div className={`bg-brand-surface rounded-2xl overflow-hidden transition-all ${exLog.completed ? 'opacity-70' : ''}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4"
      >
        <div className="shrink-0">
          {exLog.completed
            ? <CheckCircle2 className="w-6 h-6 text-brand-gold" />
            : totalDone > 0
              ? <div className="w-6 h-6 rounded-full border-2 border-brand-red flex items-center justify-center text-[10px] font-bold text-brand-red">{totalDone}</div>
              : <Circle className="w-6 h-6 text-brand-gray/50" />
          }
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold text-brand-smoke text-sm">{ex.name}</div>
          <div className="text-xs text-brand-gray">
            <span className={categoryColor[ex.category] ?? 'text-brand-gray'}>
              {ex.category}
            </span>
            {' · '}
            {exLog.plannedSets} sets · {formatPlanned(exLog.planned, ex.unit)}
            {exLog.notes && <span className="text-brand-red ml-1">{exLog.notes}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setShowInfo(!showInfo) }}
            className="text-brand-gray/50 hover:text-brand-gray"
          >
            <Info className="w-4 h-4" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-brand-gray/70" /> : <ChevronDown className="w-4 h-4 text-brand-gray/70" />}
        </div>
      </button>

      {showInfo && ex.description && (
        <div className="px-4 pb-3 text-xs text-brand-gray italic border-t border-brand-border pt-2">
          {ex.description}
        </div>
      )}

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-brand-border pt-3">
          {Array.from({ length: exLog.plannedSets }, (_, i) => i + 1).map(setNum => (
            <SetInput
              key={setNum}
              setNum={setNum}
              planned={exLog.planned}
              unit={ex.unit}
              existing={exLog.sets.find(s => s.setNumber === setNum)}
              onComplete={handleComplete}
              onSkip={handleSkip}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ActiveWorkout({ template, existingLog, onSave, onDiscard }: Props) {
  const [log, setLog] = useState<WorkoutLog>(() => initLog(template, existingLog))
  const [elapsed, setElapsed] = useState(0)
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false)

  const hasStarted = !!log.startTime

  // Timer only runs once the user explicitly starts the workout
  useEffect(() => {
    if (!hasStarted) return
    const start = new Date(log.startTime).getTime()
    setElapsed(Math.floor((Date.now() - start) / 1000))
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(tick)
  }, [hasStarted, log.startTime])

  // Auto-save every 30s — only after the workout has started
  useEffect(() => {
    if (!hasStarted) return
    const t = setInterval(() => onSave(log), 30000)
    return () => clearInterval(t)
  }, [hasStarted, log, onSave])

  const startWorkout = () => {
    setLog(prev => ({ ...prev, startTime: new Date().toISOString() }))
  }

  const updateExercise = useCallback((updated: WorkoutExerciseLog) => {
    setLog(prev => {
      const exercises = prev.exercises.map(e =>
        e.exerciseId === updated.exerciseId ? updated : e
      )
      return { ...prev, exercises }
    })
  }, [])

  const completedCount = log.exercises.filter(e => e.completed).length
  const progress = log.exercises.length > 0 ? completedCount / log.exercises.length : 0

  const finish = () => {
    const finished: WorkoutLog = { ...log, endTime: new Date().toISOString() }
    onSave(finished)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-brand-red font-semibold uppercase tracking-wider">Workout {log.templateType}</div>
          <h2 className="text-lg font-bold text-brand-smoke">{log.templateName}</h2>
        </div>
        <div className="flex items-center gap-3">
          {hasStarted ? (
            <div className="flex items-center gap-1 text-brand-gray text-sm tabular-nums">
              <Clock className="w-4 h-4" />
              {formatDuration(elapsed)}
            </div>
          ) : (
            <div className="text-xs text-brand-gray/70 italic">Not started</div>
          )}
          <button onClick={() => setShowConfirmDiscard(true)} className="text-brand-gray/70 hover:text-brand-smoke">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Start CTA — only shown before the user begins */}
      {!hasStarted && (
        <button
          onClick={startWorkout}
          className="w-full bg-brand-red hover:bg-brand-red-hi active:bg-brand-red-lo text-brand-smoke font-bold py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
        >
          <Clock className="w-5 h-5" />
          Start Workout
        </button>
      )}

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-brand-gray/70 mb-1">
          <span>{completedCount} / {log.exercises.length} exercises</span>
          <span>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-2 bg-brand-input rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-red rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {log.exercises.map(exLog => (
          <ExerciseCard key={exLog.exerciseId} exLog={exLog} onUpdate={updateExercise} />
        ))}
      </div>

      {/* Finish button — only after workout has started */}
      {hasStarted && (
        <button
          onClick={finish}
          className="w-full bg-brand-red hover:bg-brand-red-hi active:bg-brand-red-lo text-brand-smoke font-bold py-4 rounded-2xl text-base transition-colors"
        >
          {progress >= 1 ? '🎉 Complete Workout' : 'Save & Finish Early'}
        </button>
      )}

      {/* Discard modal */}
      {showConfirmDiscard && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-brand-surface rounded-2xl p-6 space-y-4 w-full max-w-sm">
            <h3 className="text-brand-smoke font-bold text-lg">Discard workout?</h3>
            <p className="text-brand-gray text-sm">Your progress will not be saved.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDiscard(false)}
                className="flex-1 bg-brand-input text-brand-smoke rounded-xl py-3 font-semibold"
              >
                Keep going
              </button>
              <button
                onClick={onDiscard}
                className="flex-1 bg-brand-red/20 text-brand-red-hi border border-brand-red/30 rounded-xl py-3 font-semibold"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
