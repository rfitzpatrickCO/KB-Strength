import { useState } from 'react'
import { Trash2, ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react'
import { WorkoutLog } from '../types'
import { workoutDuration } from '../lib/workoutEngine'
import { exerciseMap } from '../lib/exercises'

interface Props {
  logs: WorkoutLog[]
  onDelete: (id: string) => void
}

function WorkoutCard({ log, onDelete }: { log: WorkoutLog; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const completed = log.exercises.filter(e => e.completed).length
  const dateStr = new Date(log.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  })

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4"
      >
        <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-lg shrink-0">
          {log.templateType === 'A' ? '🏋️' : log.templateType === 'B' ? '🏃' : '⚡'}
        </div>
        <div className="flex-1 text-left">
          <div className="font-semibold text-white text-sm">{log.templateName}</div>
          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{dateStr}</span>
            {log.endTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{workoutDuration(log)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 text-xs text-slate-500">
          <span>{completed}/{log.exercises.length}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-700 px-4 pb-4 pt-3 space-y-3">
          {log.exercises.map(exLog => {
            const ex = exerciseMap[exLog.exerciseId]
            if (!ex) return null
            const completedSets = exLog.sets.filter(s => s.completed && !s.skipped)
            return (
              <div key={exLog.exerciseId} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium">{ex.name}</span>
                  <span className={`text-xs font-semibold ${exLog.completed ? 'text-green-400' : 'text-slate-500'}`}>
                    {exLog.sets.filter(s => s.completed || s.skipped).length}/{exLog.plannedSets} sets
                  </span>
                </div>
                {completedSets.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {completedSets.map(s => (
                      <span key={s.setNumber} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                        {ex.unit === 'weight_reps' && `${s.weight}kg×${s.reps}`}
                        {ex.unit === 'reps_only' && `${s.reps} reps`}
                        {ex.unit === 'duration' && `${s.duration}s`}
                        {ex.unit === 'distance_duration' && `${s.distance}mi`}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
          {log.notes && <p className="text-xs text-slate-400 italic">{log.notes}</p>}

          {/* Delete */}
          <div className="pt-2 border-t border-slate-700">
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 text-sm text-slate-400 bg-slate-700 rounded-xl py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className="flex-1 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl py-2"
                >
                  Delete
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete workout
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function History({ logs, onDelete }: Props) {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date))

  if (logs.length === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-64 text-center">
        <div className="text-4xl mb-3">📋</div>
        <h2 className="text-white font-semibold">No workouts yet</h2>
        <p className="text-slate-400 text-sm mt-1">Start your first workout from the Home tab.</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-bold text-white">History</h2>
      <p className="text-slate-400 text-sm">{logs.length} workout{logs.length !== 1 ? 's' : ''} logged</p>
      {sorted.map(log => (
        <WorkoutCard key={log.id} log={log} onDelete={() => onDelete(log.id)} />
      ))}
    </div>
  )
}
