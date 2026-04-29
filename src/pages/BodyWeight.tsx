import { useState } from 'react'
import { Plus, Trash2, Scale, TrendingDown } from 'lucide-react'
import { BodyWeightEntry } from '../types'
import { generateId, todayISO } from '../lib/storage'

interface Props {
  entries: BodyWeightEntry[]
  onSave: (entry: BodyWeightEntry) => void
  onDelete: (id: string) => void
}

export default function BodyWeight({ entries, onSave, onDelete }: Props) {
  const today = todayISO()
  const todayEntry = entries.find(e => e.date === today)

  const [weight, setWeight] = useState(String(todayEntry?.weight ?? ''))
  const [date, setDate] = useState(today)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!weight || isNaN(Number(weight))) return
    onSave({ id: generateId(), date, weight: Number(weight) })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date))
  const change = entries.length >= 2
    ? (sorted[0].weight - sorted[sorted.length - 1].weight).toFixed(1)
    : null

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-white">Body Weight</h2>

      {/* Stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-2xl p-4 text-center">
            <Scale className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{sorted[0].weight} lbs</div>
            <div className="text-xs text-slate-400">Current</div>
          </div>
          {change !== null && (
            <div className="bg-slate-800 rounded-2xl p-4 text-center">
              <TrendingDown className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className={`text-xl font-bold ${Number(change) < 0 ? 'text-green-400' : 'text-red-400'}`}>
                {Number(change) < 0 ? '' : '+'}{change} lbs
              </div>
              <div className="text-xs text-slate-400">Total change</div>
            </div>
          )}
        </div>
      )}

      {/* Log entry */}
      <div className="bg-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-orange-400" /> Log Weight
        </h3>
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-xs text-slate-400">Weight (lbs)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 185.5"
              className="w-full bg-slate-700 text-white rounded-xl px-3 py-3 text-base"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs text-slate-400">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-xl px-3 py-3 text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!weight}
          className={`w-full py-3 rounded-xl font-semibold text-white transition-colors
            ${saved ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-400 active:bg-orange-600'}
            disabled:opacity-40`}
        >
          {saved ? '✓ Saved!' : 'Save Entry'}
        </button>
      </div>

      {/* History */}
      {sorted.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Log</h3>
          {sorted.map((entry, i) => {
            const prev = sorted[i + 1]
            const delta = prev ? (entry.weight - prev.weight) : null
            return (
              <div key={entry.id} className="bg-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold">{entry.weight} lbs</span>
                  {delta !== null && (
                    <span className={`text-xs ml-2 ${delta < 0 ? 'text-green-400' : delta > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <Scale className="w-8 h-8 mx-auto mb-2" />
          <p>No entries yet. Log your first weight above.</p>
        </div>
      )}
    </div>
  )
}
