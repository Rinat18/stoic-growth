'use client'

import { useEffect, useState } from 'react'

type Entry = {
  id: number
  date: string
  relDone: boolean
  workDone: boolean
  reflection: string | null
}

function getLevel(entry: Entry | undefined): 0 | 1 | 2 | 3 {
  if (!entry) return 0
  if (entry.relDone && entry.workDone) return 3
  if (entry.relDone || entry.workDone) return 2
  if (entry.reflection) return 1
  return 0
}

const LEVEL_COLORS = [
  'bg-zinc-800',
  'bg-green-900',
  'bg-green-600',
  'bg-green-400',
]

export default function CalendarPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selected, setSelected] = useState<Entry | null>(null)

  useEffect(() => {
    fetch('/api/entries').then(r => r.json()).then(setEntries)
  }, [])

  const entryByDate = Object.fromEntries(
    entries.map(e => [e.date.split('T')[0], e])
  )

  const weeks = buildWeeks()

  const total = entries.length
  const completed = entries.filter(e => e.relDone && e.workDone).length
  const partial = entries.filter(e => (e.relDone || e.workDone) && !(e.relDone && e.workDone)).length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Календарь</h1>
        <p className="text-zinc-500 text-sm mt-1">Твой прогресс за последние 3 месяца</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Всего дней" value={total} />
        <StatCard label="Оба практики" value={completed} color="text-green-400" />
        <StatCard label="Частично" value={partial} color="text-yellow-400" />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span>Меньше</span>
        {LEVEL_COLORS.map((c, i) => (
          <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
        ))}
        <span>Больше</span>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => {
                const entry = day ? entryByDate[day] : undefined
                const level = getLevel(entry)
                return (
                  <div
                    key={di}
                    title={day ?? ''}
                    onClick={() => day && entry && setSelected(entry)}
                    className={`w-4 h-4 rounded-sm transition-transform hover:scale-125 ${
                      day ? `${LEVEL_COLORS[level]} cursor-pointer` : 'bg-transparent'
                    }`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected entry */}
      {selected && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {new Date(selected.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-zinc-300 text-xs">закрыть</button>
          </div>
          <div className="flex gap-3">
            <Badge done={selected.relDone} label="Отношения" />
            <Badge done={selected.workDone} label="Работа" />
          </div>
          {selected.reflection && (
            <p className="text-sm text-zinc-300 border-t border-zinc-800 pt-3">{selected.reflection}</p>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color = 'text-zinc-100' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-zinc-500 mt-1">{label}</div>
    </div>
  )
}

function Badge({ done, label }: { done: boolean; label: string }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
      done ? 'bg-green-900 text-green-300' : 'bg-zinc-800 text-zinc-500'
    }`}>
      {label}
    </span>
  )
}

function buildWeeks(): (string | null)[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - 84) // 12 weeks back

  // align to Monday
  while (start.getDay() !== 1) start.setDate(start.getDate() - 1)

  const weeks: (string | null)[][] = []
  let current = new Date(start)

  while (current <= today) {
    const week: (string | null)[] = []
    for (let d = 0; d < 7; d++) {
      if (current > today) {
        week.push(null)
      } else {
        week.push(current.toISOString().split('T')[0])
      }
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}
