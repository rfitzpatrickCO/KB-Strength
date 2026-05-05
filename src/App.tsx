import { useState, useCallback } from 'react'
import BottomNav, { Page } from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import ActiveWorkout from './pages/ActiveWorkout'
import History from './pages/History'
import Progress from './pages/Progress'
import BodyWeight from './pages/BodyWeight'
import {
  getWorkoutLogs, saveWorkoutLog, deleteWorkoutLog,
  getBodyWeightEntries, saveBodyWeightEntry, deleteBodyWeightEntry,
} from './lib/storage'
import { buildNextWorkout } from './lib/workoutEngine'
import { WorkoutLog, BodyWeightEntry } from './types'

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [logs, setLogs] = useState<WorkoutLog[]>(() => getWorkoutLogs())
  const [bodyWeights, setBodyWeights] = useState<BodyWeightEntry[]>(() => getBodyWeightEntries())
  const [activeLog, setActiveLog] = useState<WorkoutLog | null>(null)

  const workoutActive = activeLog !== null

  const startWorkout = useCallback(() => {
    const template = buildNextWorkout(logs)
    // Check if there's already an in-progress workout
    const inProgress = logs.find(l => !l.endTime)
    if (inProgress) {
      setActiveLog(inProgress)
    } else {
      setActiveLog(null) // will be created fresh
      // Pass template via page navigation
    }
    setPage('workout')
    // Store template in state
    _setNextTemplate(template)
  }, [logs])

  // Keep template for the active workout
  const [nextTemplate, _setNextTemplate] = useState(() => buildNextWorkout([]))

  const handleSaveWorkout = useCallback((log: WorkoutLog) => {
    saveWorkoutLog(log)
    setLogs(getWorkoutLogs())
    setActiveLog(log.endTime ? null : log)
    if (log.endTime) setPage('home')
  }, [])

  const handleDiscardWorkout = useCallback(() => {
    setActiveLog(null)
    setPage('home')
  }, [])

  const handleDeleteWorkout = useCallback((id: string) => {
    deleteWorkoutLog(id)
    setLogs(getWorkoutLogs())
  }, [])

  const handleSaveWeight = useCallback((entry: BodyWeightEntry) => {
    saveBodyWeightEntry(entry)
    setBodyWeights(getBodyWeightEntries())
  }, [])

  const handleDeleteWeight = useCallback((id: string) => {
    deleteBodyWeightEntry(id)
    setBodyWeights(getBodyWeightEntries())
  }, [])

  return (
    <div className="min-h-screen bg-brand-black text-brand-smoke">
      {/* Scrollable content area — pt-safe clears the iOS status bar */}
      <div className="pt-safe pb-20 overflow-y-auto min-h-screen">
        {page === 'home' && (
          <Dashboard
            logs={logs}
            bodyWeights={bodyWeights}
            onNavigate={setPage}
            onStartWorkout={startWorkout}
          />
        )}
        {page === 'workout' && (
          <ActiveWorkout
            template={nextTemplate}
            existingLog={activeLog ?? undefined}
            onSave={handleSaveWorkout}
            onDiscard={handleDiscardWorkout}
          />
        )}
        {page === 'history' && (
          <History logs={logs} onDelete={handleDeleteWorkout} />
        )}
        {page === 'progress' && (
          <Progress logs={logs} bodyWeights={bodyWeights} />
        )}
        {page === 'weight' && (
          <BodyWeight
            entries={bodyWeights}
            onSave={handleSaveWeight}
            onDelete={handleDeleteWeight}
          />
        )}
      </div>

      <BottomNav current={page} onChange={setPage} workoutActive={workoutActive} />
    </div>
  )
}
