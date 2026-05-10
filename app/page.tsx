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
      })
  }, [])

  const streak = calcStreak(allEntries)

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Сегодня</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-400">{streak}</div>
          <div className="text-xs text-zinc-500">дней подряд</div>
        </div>
      </div>

      {/* Week badge */}
      <div className="inline-block bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-400">
        Неделя 1 — <span className="text-zinc-200">Базовые практики</span>
      </div>

      {/* Practice cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PracticeCard
          track="Отношения"
          task="Пауза 3 секунды перед ответом в конфликте"
          principle="Ты контролируешь только свою реакцию"
          done={entry?.relDone ?? false}
          onToggle={() => toggle('relDone')}
        />
        <PracticeCard
          track="Работа"
          task="Утром — одна задача которую реально контролируешь"
          principle="Obstacle is the way"
          done={entry?.workDone ?? false}
          onToggle={() => toggle('workDone')}
        />
      </div>

      {/* Reflection */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Вечерняя рефлексия</h2>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="Одна ситуация дня — что было не в твоей власти? Что ты сделал?"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:border-green-500 transition-colors"
          rows={4}
        />
        <button
          onClick={saveReflection}
          disabled={saving || !reflection.trim()}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {saving ? 'Сохраняю...' : 'Сохранить'}
        </button>
      </div>

      {/* Recent reflections */}
      {allEntries.filter(e => e.reflection).slice(0, 3).length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Последние записи</h2>
          <div className="space-y-2">
            {allEntries.filter(e => e.reflection).slice(0, 3).map(e => (
              <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <p className="text-xs text-zinc-500 mb-1">
                  {new Date(e.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </p>
                <p className="text-sm text-zinc-300">{e.reflection}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PracticeCard({
  track, task, principle, done, onToggle,
}: {
  track: string
  task: string
  principle: string
  done: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`border rounded-xl p-5 cursor-pointer transition-all ${
        done
          ? 'bg-green-950 border-green-700'
          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
      }`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{track}</span>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          done ? 'bg-green-500 border-green-500' : 'border-zinc-600'
        }`}>
          {done && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <p className="text-sm font-medium text-zinc-100 mb-2">{task}</p>
      <p className="text-xs text-zinc-500 italic">&ldquo;{principle}&rdquo;</p>
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
    const entryDate = new Date(entry.date)
    entryDate.setHours(0, 0, 0, 0)
    const diff = Math.round((cursor.getTime() - entryDate.getTime()) / 86400000)
    if (diff > 1) break
    if (entry.relDone || entry.workDone) {
      streak++
      cursor = entryDate
    }
  }
  return streak
}
