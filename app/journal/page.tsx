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
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <div className="text-[10px] tracking-[0.3em] text-cyan-500/50 mb-1">// INTELLIGENCE DATABASE</div>
        <h1 className="text-2xl font-bold glow-text tracking-wider">INTEL LOGS</h1>
      </div>

      {/* Input */}
      <div className="hud-card p-5 space-y-3">
        <div className="text-[9px] tracking-[0.2em] text-cyan-500/50">NEW INTEL ENTRY</div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="> что зацепило? запиши своими словами..."
          className="w-full bg-transparent border border-cyan-500/20 p-3 text-sm text-cyan-300/80 placeholder-cyan-500/20 resize-none focus:outline-none focus:border-cyan-500/50 transition-colors font-mono"
          rows={3}
        />
        <div className="flex gap-2 items-center">
          <input
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="SOURCE // Daily Stoic, Meditations..."
            className="flex-1 bg-transparent border border-cyan-500/20 px-3 py-2 text-xs text-cyan-300/70 placeholder-cyan-500/20 focus:outline-none focus:border-cyan-500/50 transition-colors font-mono tracking-wider"
          />
          <button
            onClick={addInsight}
            disabled={saving || !text.trim()}
            className="px-4 py-2 text-[10px] tracking-[0.2em] font-bold border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 disabled:opacity-20 disabled:cursor-not-allowed transition-all whitespace-nowrap"
          >
            {saving ? 'UPLOADING...' : '[ UPLOAD ]'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-cyan-500/10">
        {[
          { key: 'reflections', label: `DEBRIEF LOGS`, count: entries.length },
          { key: 'insights', label: `INTEL ENTRIES`, count: insights.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-2 text-[10px] tracking-[0.2em] font-bold border-b-2 -mb-px transition-all ${
              tab === key
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-cyan-500/30 hover:text-cyan-500/60'
            }`}
          >
            {label} <span className="opacity-60">[{count}]</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'reflections' ? (
        <div className="space-y-3">
          {entries.length === 0 && (
            <div className="hud-card p-6 text-center">
              <p className="text-[10px] text-cyan-500/30 tracking-widest">NO DEBRIEF LOGS FOUND</p>
              <p className="text-[9px] text-cyan-500/20 tracking-widest mt-1">UPLOAD FIRST LOG FROM MISSION BRIEF</p>
            </div>
          )}
          {entries.map((e, i) => (
            <div key={e.id} className="hud-card p-5 data-entry" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3 bg-cyan-500/60" style={{ boxShadow: '0 0 4px #00d4ff' }} />
                  <span className="text-[9px] text-cyan-500/50 tracking-widest">
                    {new Date(e.date).toLocaleDateString('ru-RU', { weekday: 'short', day: '2-digit', month: '2-digit' }).toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-1">
                  <StatusBit active={e.relDone} label="R" />
                  <StatusBit active={e.workDone} label="W" />
                </div>
              </div>
              <p className="text-xs text-cyan-300/60 font-mono leading-relaxed">{e.reflection}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {insights.length === 0 && (
            <div className="hud-card p-6 text-center">
              <p className="text-[10px] text-cyan-500/30 tracking-widest">NO INTEL ENTRIES FOUND</p>
              <p className="text-[9px] text-cyan-500/20 tracking-widest mt-1">UPLOAD FIRST ENTRY ABOVE</p>
            </div>
          )}
          {insights.map((ins, i) => (
            <div key={ins.id} className="hud-card p-5 data-entry" style={{ animationDelay: `${i * 0.05}s` }}>
              <p className="text-xs text-cyan-100/70 font-mono leading-relaxed mb-3">{ins.text}</p>
              <div className="flex items-center justify-between border-t border-cyan-500/10 pt-2">
                {ins.source ? (
                  <span className="text-[9px] tracking-widest text-cyan-500/50 border border-cyan-500/20 px-2 py-0.5">
                    SRC: {ins.source.toUpperCase()}
                  </span>
                ) : <span />}
                <span className="text-[9px] text-cyan-500/30 tracking-widest">
                  {new Date(ins.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBit({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={`text-[8px] w-5 h-5 flex items-center justify-center border font-bold ${
      active
        ? 'border-cyan-500/60 text-cyan-400 bg-cyan-500/10'
        : 'border-cyan-900/30 text-cyan-900'
    }`}
      style={active ? { boxShadow: '0 0 6px rgba(0,212,255,0.3)' } : {}}
    >
      {label}
    </span>
  )
}
