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

const LEVEL_STYLES = [
  'bg-cyan-950/30 border border-cyan-900/20',
  'bg-cyan-900/40 border border-cyan-700/30',
  'bg-cyan-600/50 border border-cyan-500/50',
  'bg-cyan-400/70 border border-cyan-300',
]

export default function CalendarPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [selected, setSelected] = useState<Entry | null>(null)

  useEffect(() => {
    fetch('/api/entries').then(r => r.json()).then(setEntries)
  }, [])

  const entryByDate = Object.fromEntries(entries.map(e => [e.date.split('T')[0], e]))
  const weeks = buildWeeks()

  const total = entries.length
  const completed = entries.filter(e => e.relDone && e.workDone).length
  const partial = entries.filter(e => (e.relDone || e.workDone) && !(e.relDone && e.workDone)).length
  const rate = total ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <div className="text-[10px] tracking-[0.3em] text-cyan-500/50 mb-1">// TACTICAL OVERVIEW</div>
        <h1 className="text-2xl font-bold glow-text tracking-wider">ACTIVITY MAP</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'LOGGED', value: total },
          { label: 'COMPLETE', value: completed },
          { label: 'PARTIAL', value: partial },
          { label: 'RATE', value: `${rate}%` },
        ].map(({ label, value }) => (
          <div key={label} className="hud-card p-3 text-center hex-border">
            <div className="text-lg font-bold glow-text">{value}</div>
            <div className="text-[9px] tracking-[0.15em] text-cyan-500/40 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[9px] text-cyan-500/40 tracking-widest">
        <span>NO DATA</span>
        {LEVEL_STYLES.map((s, i) => (
          <div key={i} className={`w-4 h-4 ${s}`} />
        ))}
        <span>FULL</span>
      </div>

      {/* Heatmap */}
      <div className="hud-card p-5">
        <div className="text-[9px] tracking-[0.2em] text-cyan-500/40 mb-4">12-WEEK SCAN // ОПЕРАЦИИ</div>
        <div className="overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1.5">
                {week.map((day, di) => {
                  const entry = day ? entryByDate[day] : undefined
                  const level = getLevel(entry)
                  return (
                    <div
                      key={di}
                      title={day ?? ''}
                      onClick={() => day && entry && setSelected(entry)}
                      className={`w-5 h-5 transition-all duration-150 ${
                        day
                          ? `${LEVEL_STYLES[level]} cursor-pointer hover:scale-125`
                          : 'opacity-0'
                      }`}
                      style={level >= 2 ? { boxShadow: `0 0 ${level * 4}px rgba(0,212,255,${level * 0.2})` } : {}}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected entry */}
      {selected && (
        <div className="hud-card p-5 space-y-3 glow-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="status-dot" />
              <span className="text-xs glow-text tracking-widest">
                {new Date(selected.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
              </span>
            </div>
            <button onClick={() => setSelected(null)} className="text-[9px] text-cyan-500/40 hover:text-cyan-400 tracking-widest">
              [ CLOSE ]
            </button>
          </div>
          <div className="flex gap-2">
            <Badge done={selected.relDone} label="RELATIONS" />
            <Badge done={selected.workDone} label="WORK" />
          </div>
          {selected.reflection && (
            <div className="border-t border-cyan-500/10 pt-3">
              <div className="text-[9px] text-cyan-500/40 tracking-widest mb-2">LOG ENTRY:</div>
              <p className="text-xs text-cyan-300/60 font-mono leading-relaxed">{selected.reflection}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Badge({ done, label }: { done: boolean; label: string }) {
  return (
    <span className={`text-[9px] px-2 py-1 tracking-[0.15em] border font-bold ${
      done
        ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10'
        : 'border-cyan-900/30 text-cyan-500/30'
    }`}
      style={done ? { boxShadow: '0 0 8px rgba(0,212,255,0.2)' } : {}}
    >
      {done ? '■' : '□'} {label}
    </span>
  )
}

function buildWeeks(): (string | null)[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(today.getDate() - 84)
  while (start.getDay() !== 1) start.setDate(start.getDate() - 1)

  const weeks: (string | null)[][] = []
  const current = new Date(start)

  while (current <= today) {
    const week: (string | null)[] = []
    for (let d = 0; d < 7; d++) {
      week.push(current > today ? null : current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}
