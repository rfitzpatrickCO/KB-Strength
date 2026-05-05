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
      <h2 className="text-xl font-bold text-brand-smoke">Body Weight</h2>

      {/* Stats */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-brand-surface rounded-2xl p-4 text-center">
            <Scale className="w-5 h-5 text-brand-red mx-auto mb-1" />
            <div className="text-xl font-bold text-brand-smoke">{sorted[0].weight} lbs</div>
            <div className="text-xs text-brand-gray">Current</div>
          </div>
          {change !== null && (
            <div className="bg-brand-surface rounded-2xl p-4 text-center">
              <TrendingDown className="w-5 h-5 text-brand-gold mx-auto mb-1" />
              <div className={`text-xl font-bold ${Number(change) < 0 ? 'text-brand-gold' : 'text-brand-red-hi'}`}>
                {Number(change) < 0 ? '' : '+'}{change} lbs
              </div>
              <div className="text-xs text-brand-gray">Total change</div>
            </div>
          )}
        </div>
      )}

      {/* Log entry */}
      <div className="bg-brand-surface rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-brand-smoke flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-red" /> Log Weight
        </h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-brand-gray">Weight (lbs)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 185.5"
              className="w-full bg-brand-input text-brand-smoke rounded-xl px-3 py-3 text-base box-border"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-brand-gray">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-brand-input text-brand-smoke rounded-xl px-3 py-3 text-base box-border"
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!weight}
          className={`w-full py-3 rounded-xl font-semibold text-brand-smoke transition-colors
            ${saved ? 'bg-brand-gold text-brand-black' : 'bg-brand-red hover:bg-brand-red-hi active:bg-brand-red-lo'}
            disabled:opacity-40`}
        >
          {saved ? '✓ Saved!' : 'Save Entry'}
        </button>
      </div>

      {/* History */}
      {sorted.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-brand-gray text-xs font-semibold uppercase tracking-wider">Log</h3>
          {sorted.map((entry, i) => {
            const prev = sorted[i + 1]
            const delta = prev ? (entry.weight - prev.weight) : null
            return (
              <div key={entry.id} className="bg-brand-surface rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-brand-smoke font-semibold">{entry.weight} lbs</span>
                  {delta !== null && (
                    <span className={`text-xs ml-2 ${delta < 0 ? 'text-brand-gold' : delta > 0 ? 'text-brand-red-hi' : 'text-brand-gray/70'}`}>
                      {delta > 0 ? '+' : ''}{delta.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-brand-gray text-sm">
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-brand-gray/50 hover:text-brand-red-hi transition-colors"
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
        <div className="text-center py-8 text-brand-gray/70">
          <Scale className="w-8 h-8 mx-auto mb-2" />
          <p>No entries yet. Log your first weight above.</p>
        </div>
      )}
    </div>
  )
}
