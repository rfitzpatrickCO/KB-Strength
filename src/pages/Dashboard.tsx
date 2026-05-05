import { useMemo } from 'react'
import { Flame, Trophy, Calendar, ChevronRight, Scale } from 'lucide-react'
import { WorkoutLog, BodyWeightEntry } from '../types'
import { buildNextWorkout, formatPlanned, workoutDuration } from '../lib/workoutEngine'
import { exerciseMap } from '../lib/exercises'
import { Page } from '../components/BottomNav'

interface Props {
  logs: WorkoutLog[]
  bodyWeights: BodyWeightEntry[]
  onNavigate: (p: Page) => void
  onStartWorkout: () => void
}

export default function Dashboard({ logs, bodyWeights, onNavigate, onStartWorkout }: Props) {
  const next = useMemo(() => buildNextWorkout(logs), [logs])
  const lastLog = logs.length > 0 ? logs[logs.length - 1] : null
  const latestWeight = bodyWeights.length > 0 ? bodyWeights[bodyWeights.length - 1] : null

  // Simple streak counter
  const streak = useMemo(() => {
    if (logs.length === 0) return 0
    let count = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date))
    let expected = new Date(today)
    for (const log of sorted) {
      const d = new Date(log.date)
      d.setHours(0, 0, 0, 0)
      if (d.getTime() === expected.getTime() || d.getTime() === expected.getTime() - 86400000) {
        count++
        expected = new Date(d.getTime() - 86400000)
      } else {
        break
      }
    }
    return count
  }, [logs])

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-smoke">KB Tracker</h1>
          <p className="text-brand-gray text-sm">Let's get after it 💪</p>
        </div>
        <div className="flex gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full text-sm font-semibold">
              <Flame className="w-4 h-4" /> {streak}
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-brand-surface rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-brand-red">{logs.length}</div>
          <div className="text-xs text-brand-gray">Workouts</div>
        </div>
        <div className="bg-brand-surface rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-brand-red">{streak}</div>
          <div className="text-xs text-brand-gray">Day Streak</div>
        </div>
        <div
          className="bg-brand-surface rounded-xl p-3 text-center cursor-pointer hover:bg-brand-input transition-colors"
          onClick={() => onNavigate('weight')}
        >
          <div className="text-2xl font-bold text-brand-red">
            {latestWeight ? `${latestWeight.weight}` : '—'}
          </div>
          <div className="text-xs text-brand-gray">lbs</div>
        </div>
      </div>

      {/* Next Workout Card */}
      <div className="bg-gradient-to-br from-brand-red/20 to-brand-red-lo/10 border border-brand-red/30 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-brand-red uppercase tracking-wider">Next Up · Workout {next.type}</div>
            <h2 className="text-lg font-bold text-brand-smoke">{next.name}</h2>
            <p className="text-brand-gray text-sm">{next.description}</p>
          </div>
          <div className="w-12 h-12 bg-brand-red rounded-2xl flex items-center justify-center text-xl">
            {next.type === 'A' ? '🏋️' : next.type === 'B' ? '🏃' : '⚡'}
          </div>
        </div>

        {/* Exercise preview */}
        <div className="space-y-1">
          {next.exercises.slice(0, 4).map(pe => {
            const ex = exerciseMap[pe.exerciseId]
            if (!ex) return null
            return (
              <div key={pe.exerciseId} className="flex justify-between text-sm">
                <span className="text-brand-smoke">{ex.name}</span>
                <span className="text-brand-gray">
                  {pe.sets > 1 ? `${pe.sets}×` : ''} {formatPlanned(pe.planned, ex.unit)}
                  {pe.notes && <span className="text-brand-red ml-1 text-xs">{pe.notes.startsWith('↑') ? '↑' : ''}</span>}
                </span>
              </div>
            )
          })}
          {next.exercises.length > 4 && (
            <div className="text-xs text-brand-gray/70">+{next.exercises.length - 4} more exercises</div>
          )}
        </div>

        <button
          onClick={onStartWorkout}
          className="w-full bg-brand-red hover:bg-brand-red-hi active:bg-brand-red-lo text-brand-smoke font-semibold py-3 rounded-xl transition-colors text-base"
        >
          Start Workout
        </button>
      </div>

      {/* Last workout */}
      {lastLog && (
        <button
          onClick={() => onNavigate('history')}
          className="w-full bg-brand-surface rounded-2xl p-4 flex items-center justify-between hover:bg-brand-input transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-input rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-brand-gray" />
            </div>
            <div className="text-left">
              <div className="text-brand-smoke font-semibold text-sm">{lastLog.templateName}</div>
              <div className="text-brand-gray text-xs">
                {new Date(lastLog.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                {' · '}{workoutDuration(lastLog)}
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-brand-gray/50" />
        </button>
      )}

      {/* Quick log weight */}
      <button
        onClick={() => onNavigate('weight')}
        className="w-full bg-brand-surface rounded-2xl p-4 flex items-center justify-between hover:bg-brand-input transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-input rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-brand-gray" />
          </div>
          <div className="text-left">
            <div className="text-brand-smoke font-semibold text-sm">Log Body Weight</div>
            <div className="text-brand-gray text-xs">
              {latestWeight ? `Last: ${latestWeight.weight} lbs on ${new Date(latestWeight.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'Track your progress'}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-brand-gray/50" />
      </button>

      {logs.length === 0 && (
        <div className="bg-brand-surface/50 rounded-2xl p-6 text-center">
          <Trophy className="w-10 h-10 text-brand-red mx-auto mb-2" />
          <p className="text-brand-smoke font-semibold">Welcome! Start your first workout.</p>
          <p className="text-brand-gray text-sm mt-1">The app will track your progress and automatically ramp up intensity each session.</p>
        </div>
      )}
    </div>
  )
}
