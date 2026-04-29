import { Home, Dumbbell, History, TrendingUp, Scale } from 'lucide-react'

export type Page = 'home' | 'workout' | 'history' | 'progress' | 'weight'

interface Props {
  current: Page
  onChange: (p: Page) => void
  workoutActive: boolean
}

const NAV: { id: Page; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'home',     label: 'Home',    Icon: Home },
  { id: 'workout',  label: 'Workout', Icon: Dumbbell },
  { id: 'history',  label: 'History', Icon: History },
  { id: 'progress', label: 'Progress',Icon: TrendingUp },
  { id: 'weight',   label: 'Weight',  Icon: Scale },
]

export default function BottomNav({ current, onChange, workoutActive }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 pb-safe">
      <div className="flex">
        {NAV.map(({ id, label, Icon }) => {
          const active = current === id
          const pulse = id === 'workout' && workoutActive
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors
                ${active ? 'text-orange-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {pulse && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
