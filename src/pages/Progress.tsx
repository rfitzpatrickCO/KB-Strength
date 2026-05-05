import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { WorkoutLog, BodyWeightEntry } from '../types'
import { exerciseMap } from '../lib/exercises'

interface Props {
  logs: WorkoutLog[]
  bodyWeights: BodyWeightEntry[]
}

const KB_EXERCISES = [
  'kb_swing', 'kb_goblet_squat', 'kb_deadlift',
  'kb_clean_press_l', 'kb_row_l', 'kb_shoulder_press_l',
]

function ExerciseChart({ exerciseId, logs }: { exerciseId: string; logs: WorkoutLog[] }) {
  const ex = exerciseMap[exerciseId]
  if (!ex) return null

  const data = useMemo(() => {
    const points: { date: string; value: number; label: string }[] = []
    for (const log of logs) {
      const exLog = log.exercises.find(e => e.exerciseId === exerciseId)
      if (!exLog) continue
      const completedSets = exLog.sets.filter(s => s.completed && !s.skipped)
      if (completedSets.length === 0) continue

      let value = 0
      let label = ''
      if (ex.unit === 'weight_reps') {
        const maxW = Math.max(...completedSets.map(s => s.weight ?? 0))
        value = maxW
        label = `${maxW}kg`
      } else if (ex.unit === 'reps_only') {
        const maxR = Math.max(...completedSets.map(s => s.reps ?? 0))
        value = maxR
        label = `${maxR} reps`
      } else if (ex.unit === 'duration') {
        const maxD = Math.max(...completedSets.map(s => s.duration ?? 0))
        value = maxD
        label = `${maxD}s`
      }
      if (value > 0) {
        const d = new Date(log.date)
        points.push({
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          value,
          label,
        })
      }
    }
    return points
  }, [exerciseId, logs])

  if (data.length < 2) return null

  const unit = ex.unit === 'weight_reps' ? 'kg' : ex.unit === 'reps_only' ? 'reps' : 's'

  return (
    <div className="bg-brand-surface rounded-2xl p-4 space-y-2">
      <h3 className="text-brand-smoke font-semibold text-sm">{ex.name}</h3>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
          <XAxis dataKey="date" tick={{ fill: '#6E7378', fontSize: 10 }} />
          <YAxis
            tick={{ fill: '#6E7378', fontSize: 10 }}
            unit={unit}
            width={40}
          />
          <Tooltip
            contentStyle={{ background: '#242424', border: '1px solid #3A3A3A', borderRadius: 8 }}
            labelStyle={{ color: '#6E7378' }}
            itemStyle={{ color: '#CC1F1F' }}
            formatter={(v: number) => [`${v}${unit}`, ex.name]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#CC1F1F"
            strokeWidth={2}
            dot={{ fill: '#CC1F1F', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function WorkoutFrequencyChart({ logs }: { logs: WorkoutLog[] }) {
  const data = useMemo(() => {
    // Last 8 weeks
    const weeks: Record<string, number> = {}
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i * 7)
      const label = `W${8 - i}`
      weeks[label] = 0
    }
    for (const log of logs) {
      const d = new Date(log.date)
      const diff = Math.floor((now.getTime() - d.getTime()) / (7 * 86400000))
      if (diff < 8) {
        const label = `W${8 - diff}`
        if (label in weeks) weeks[label]++
      }
    }
    return Object.entries(weeks).map(([week, count]) => ({ week, count }))
  }, [logs])

  return (
    <div className="bg-brand-surface rounded-2xl p-4 space-y-2">
      <h3 className="text-brand-smoke font-semibold text-sm">Workouts per Week</h3>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
          <XAxis dataKey="week" tick={{ fill: '#6E7378', fontSize: 10 }} />
          <YAxis tick={{ fill: '#6E7378', fontSize: 10 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#242424', border: '1px solid #3A3A3A', borderRadius: 8 }}
            labelStyle={{ color: '#6E7378' }}
            itemStyle={{ color: '#CC1F1F' }}
          />
          <Bar dataKey="count" fill="#CC1F1F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Progress({ logs, bodyWeights }: Props) {
  const bwData = useMemo(() =>
    bodyWeights.slice(-30).map(e => {
      const d = new Date(e.date)
      return { date: `${d.getMonth() + 1}/${d.getDate()}`, weight: e.weight }
    }), [bodyWeights])

  if (logs.length < 2 && bodyWeights.length < 2) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-64 text-center">
        <div className="text-4xl mb-3">📈</div>
        <h2 className="text-brand-smoke font-semibold">Not enough data yet</h2>
        <p className="text-brand-gray text-sm mt-1">Complete a few workouts and log your weight to see charts here.</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-brand-smoke">Progress</h2>

      {/* Body weight chart */}
      {bwData.length >= 2 && (
        <div className="bg-brand-surface rounded-2xl p-4 space-y-2">
          <h3 className="text-brand-smoke font-semibold text-sm">Body Weight (lbs)</h3>
          <div className="flex justify-between text-xs text-brand-gray">
            <span>Start: {bwData[0].weight} lbs</span>
            <span className={bwData[bwData.length - 1].weight < bwData[0].weight ? 'text-brand-gold' : 'text-brand-red-hi'}>
              Now: {bwData[bwData.length - 1].weight} lbs
              {' '}({bwData[bwData.length - 1].weight < bwData[0].weight ? '▼' : '▲'}
              {Math.abs(bwData[bwData.length - 1].weight - bwData[0].weight).toFixed(1)})
            </span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={bwData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
              <XAxis dataKey="date" tick={{ fill: '#6E7378', fontSize: 10 }} />
              <YAxis tick={{ fill: '#6E7378', fontSize: 10 }} unit="lb" domain={['dataMin - 2', 'dataMax + 2']} width={42} />
              <Tooltip
                contentStyle={{ background: '#242424', border: '1px solid #3A3A3A', borderRadius: 8 }}
                labelStyle={{ color: '#6E7378' }}
                itemStyle={{ color: '#F5A800' }}
                formatter={(v: number) => [`${v} lbs`, 'Weight']}
              />
              <Line type="monotone" dataKey="weight" stroke="#F5A800" strokeWidth={2} dot={{ fill: '#F5A800', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Workout frequency */}
      {logs.length >= 2 && <WorkoutFrequencyChart logs={logs} />}

      {/* Strength charts */}
      {logs.length >= 2 && (
        <>
          <h3 className="text-brand-gray text-xs font-semibold uppercase tracking-wider">Strength Progress</h3>
          {KB_EXERCISES.map(id => (
            <ExerciseChart key={id} exerciseId={id} logs={logs} />
          ))}
        </>
      )}
    </div>
  )
}
