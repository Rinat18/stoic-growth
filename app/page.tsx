'use client'

import { useEffect, useState } from 'react'

const TODAY_STR = new Date().toISOString().split('T')[0]

type Entry = {
  id: number
  date: string
  relDone: boolean
  workDone: boolean
  reflection: string | null
}

export default function Dashboard() {
  const [entry, setEntry] = useState<Entry | null>(null)
  const [allEntries, setAllEntries] = useState<Entry[]>([])
  const [reflection, setReflection] = useState('')
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/entries')
      .then(r => r.json())
      .then((data: Entry[]) => {
        setAllEntries(data)
        const today = data.find(e => e.date.startsWith(TODAY_STR))
        if (today) {
          setEntry(today)
          setReflection(today.reflection ?? '')
        }
        setLoaded(true)
      })
  }, [])

  const streak = calcStreak(allEntries)
  const completion = allEntries.length
    ? Math.round((allEntries.filter(e => e.relDone && e.workDone).length / allEntries.length) * 100)
    : 0

  async function toggle(field: 'relDone' | 'workDone') {
    const updated = {
      date: TODAY_STR,
      relDone: entry?.relDone ?? false,
      workDone: entry?.workDone ?? false,
      reflection: entry?.reflection ?? null,
      [field]: !(entry?.[field] ?? false),
    }
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    })
    const saved = await res.json()
    setEntry(saved)
    setAllEntries(prev => {
      const idx = prev.findIndex(e => e.date.startsWith(TODAY_STR))
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next }
      return [saved, ...prev]
    })
  }

  async function saveReflection() {
    setSaving(true)
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: TODAY_STR,
        relDone: entry?.relDone ?? false,
        workDone: entry?.workDone ?? false,
        reflection,
      }),
    })
    const saved = await res.json()
    setEntry(saved)
    setSaving(false)
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-cyan-500/50 mb-1">// MISSION BRIEF</div>
          <h1 className="text-2xl font-bold glow-text tracking-wider">
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long' }).toUpperCase()}
          </h1>
          <div className="text-xs text-cyan-500/40 tracking-widest mt-1">
            {new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>

        {/* Streak ring */}
        <div className="relative flex items-center justify-center">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(0,212,255,0.1)" strokeWidth="4"/>
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke="#00d4ff" strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(streak * 10, 201)} 201`}
              style={{ filter: 'drop-shadow(0 0 6px #00d4ff)' }}
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-xl font-bold glow-text leading-none">{streak}</div>
            <div className="text-[8px] text-cyan-500/50 tracking-widest">DAYS</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'TOTAL', value: allEntries.length },
          { label: 'RATE %', value: `${completion}%` },
          { label: 'WEEK', value: 1 },
        ].map(({ label, value }) => (
          <div key={label} className="hud-card p-3 text-center hex-border">
            <div className="text-lg font-bold glow-text">{loaded ? value : '—'}</div>
            <div className="text-[9px] tracking-[0.2em] text-cyan-500/40 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Practice cards */}
      <div>
        <div className="text-[10px] tracking-[0.3em] text-cyan-500/50 mb-3">// ACTIVE PROTOCOLS</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <HUDCard
            label="PROTOCOL.01 // RELATIONS"
            task="Пауза 3 секунды перед ответом в конфликте"
            principle="You control only your reaction"
            done={entry?.relDone ?? false}
            onToggle={() => toggle('relDone')}
          />
          <HUDCard
            label="PROTOCOL.02 // WORK"
            task="Утром — одна задача которую реально контролируешь"
            principle="Obstacle is the way"
            done={entry?.workDone ?? false}
            onToggle={() => toggle('workDone')}
          />
        </div>
      </div>

      {/* Reflection input */}
      <div>
        <div className="text-[10px] tracking-[0.3em] text-cyan-500/50 mb-3">// EVENING DEBRIEF</div>
        <div className="hud-card p-4 space-y-3">
          <textarea
            value={reflection}
            onChange={e => setReflection(e.target.value)}
            placeholder="INPUT: что было не в твоей власти? что ты сделал?"
            className="w-full bg-transparent border border-cyan-500/20 p-3 text-sm text-cyan-300/80 placeholder-cyan-500/20 resize-none focus:outline-none focus:border-cyan-500/60 transition-colors font-mono tracking-wide"
            rows={4}
          />
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-cyan-500/30 tracking-widest">
              {reflection.length} CHARS
            </span>
            <button
              onClick={saveReflection}
              disabled={saving || !reflection.trim()}
              className="px-4 py-2 text-[10px] tracking-[0.2em] font-bold border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              {saving ? 'UPLOADING...' : '[ UPLOAD LOG ]'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent logs */}
      {allEntries.filter(e => e.reflection).length > 0 && (
        <div>
          <div className="text-[10px] tracking-[0.3em] text-cyan-500/50 mb-3">// RECENT LOGS</div>
          <div className="space-y-2">
            {allEntries.filter(e => e.reflection).slice(0, 3).map((e, i) => (
              <div key={e.id} className="hud-card p-4 data-entry" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-1 rounded-full bg-cyan-500" style={{ boxShadow: '0 0 4px #00d4ff' }} />
                  <span className="text-[9px] text-cyan-500/40 tracking-widest">
                    {new Date(e.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                  </span>
                  <div className="flex gap-1 ml-auto">
                    {e.relDone && <span className="text-[8px] text-cyan-400/60 border border-cyan-500/20 px-1">REL</span>}
                    {e.workDone && <span className="text-[8px] text-cyan-400/60 border border-cyan-500/20 px-1">WRK</span>}
                  </div>
                </div>
                <p className="text-xs text-cyan-300/60 font-mono leading-relaxed">{e.reflection}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function HUDCard({
  label, task, principle, done, onToggle,
}: {
  label: string
  task: string
  principle: string
  done: boolean
  onToggle: () => void
}) {
  return (
    <div
      onClick={onToggle}
      className={`hud-card p-5 cursor-pointer transition-all duration-300 ${
        done ? 'border-cyan-400/60 bg-cyan-500/5' : 'hover:border-cyan-500/40'
      }`}
      style={done ? { boxShadow: '0 0 20px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.05)' } : {}}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] tracking-[0.2em] text-cyan-500/40">{label}</span>
        <div className={`w-5 h-5 border flex items-center justify-center transition-all ${
          done ? 'border-cyan-400 bg-cyan-500/20' : 'border-cyan-500/30'
        }`}
          style={done ? { boxShadow: '0 0 8px rgba(0,212,255,0.5)' } : {}}
        >
          {done && (
            <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <p className="text-sm font-medium text-cyan-100/80 mb-3 leading-relaxed">{task}</p>
      <div className="border-t border-cyan-500/10 pt-2">
        <p className="text-[10px] text-cyan-500/40 font-mono italic">&ldquo;{principle}&rdquo;</p>
      </div>
    </div>
  )
}

function calcStreak(entries: Entry[]): number {
  if (!entries.length) return 0
  let streak = 0
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)
  for (const entry of sorted) {
    const d = new Date(entry.date)
    d.setHours(0, 0, 0, 0)
    const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000)
    if (diff > 1) break
    if (entry.relDone || entry.workDone) { streak++; cursor = d }
  }
  return streak
}
