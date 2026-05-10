'use client'

import { useEffect, useState } from 'react'

type Insight = {
  id: number
  text: string
  source: string | null
  createdAt: string
}

type Entry = {
  id: number
  date: string
  reflection: string | null
  relDone: boolean
  workDone: boolean
}

export default function JournalPage() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [entries, setEntries] = useState<Entry[]>([])
  const [text, setText] = useState('')
  const [source, setSource] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'reflections' | 'insights'>('reflections')

  useEffect(() => {
    fetch('/api/insights').then(r => r.json()).then(setInsights)
    fetch('/api/entries').then(r => r.json()).then((data: Entry[]) =>
      setEntries(data.filter(e => e.reflection))
    )
  }, [])

  async function addInsight() {
    if (!text.trim()) return
    setSaving(true)
    const res = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source: source || null }),
    })
    const saved = await res.json()
    setInsights(prev => [saved, ...prev])
    setText('')
    setSource('')
    setSaving(false)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Журнал</h1>
        <p className="text-zinc-500 text-sm mt-1">Рефлексии и инсайты из книг</p>
      </div>

      {/* Add insight */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Новый инсайт</h2>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Что зацепило? Запиши своими словами..."
          className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none focus:border-green-500 transition-colors"
          rows={3}
        />
        <div className="flex gap-3">
          <input
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="Источник (Daily Stoic, Meditations...)"
            className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors"
          />
          <button
            onClick={addInsight}
            disabled={saving || !text.trim()}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            {saving ? '...' : 'Добавить'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setTab('reflections')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'reflections'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Рефлексии ({entries.length})
        </button>
        <button
          onClick={() => setTab('insights')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === 'insights'
              ? 'border-green-500 text-green-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Инсайты ({insights.length})
        </button>
      </div>

      {/* Content */}
      {tab === 'reflections' ? (
        <div className="space-y-3">
          {entries.length === 0 && (
            <p className="text-zinc-600 text-sm">Рефлексий пока нет. Запиши первую на главной.</p>
          )}
          {entries.map(e => (
            <div key={e.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-zinc-500">
                  {new Date(e.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <div className="flex gap-2">
                  <Badge done={e.relDone} label="Отн." />
                  <Badge done={e.workDone} label="Раб." />
                </div>
              </div>
              <p className="text-sm text-zinc-200">{e.reflection}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {insights.length === 0 && (
            <p className="text-zinc-600 text-sm">Инсайтов пока нет. Добавь первый выше.</p>
          )}
          {insights.map(i => (
            <div key={i.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-sm text-zinc-200 mb-3">{i.text}</p>
              <div className="flex items-center justify-between">
                {i.source && (
                  <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded">{i.source}</span>
                )}
                <p className="text-xs text-zinc-600 ml-auto">
                  {new Date(i.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Badge({ done, label }: { done: boolean; label: string }) {
  return (
    <span className={`text-xs px-2 py-1 rounded font-medium ${
      done ? 'bg-green-900 text-green-300' : 'bg-zinc-800 text-zinc-600'
    }`}>
      {label}
    </span>
  )
}
