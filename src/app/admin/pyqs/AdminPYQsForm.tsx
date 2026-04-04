'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { PlusCircle, Trash2 } from 'lucide-react'

interface PYQ {
  id: string
  year: number
  question: string
  options: { A: string; B: string; C: string; D: string }
  answer: string
  explanation: string | null
}

interface Props {
  topic: { id: string; title: string; subjects?: { name: string } | null } | null
  pyqs: PYQ[]
}

const defaultForm = {
  year: new Date().getFullYear(),
  question: '',
  optA: '',
  optB: '',
  optC: '',
  optD: '',
  answer: 'A',
  explanation: '',
}

export default function AdminPYQsForm({ topic, pyqs: initialPYQs }: Props) {
  const [pyqs, setPYQs] = useState(initialPYQs)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addPYQ = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/pyqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: topic?.id,
          year: form.year,
          question: form.question,
          options: { A: form.optA, B: form.optB, C: form.optC, D: form.optD },
          answer: form.answer,
          explanation: form.explanation,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPYQs([data, ...pyqs])
      setForm(defaultForm)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const deletePYQ = async (id: string) => {
    if (!confirm('Delete this PYQ?')) return
    await fetch(`/api/admin/pyqs?id=${id}`, { method: 'DELETE' })
    setPYQs(pyqs.filter((p) => p.id !== id))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{topic?.title}</h1>
        <p className="text-gray-500 text-sm">{(topic?.subjects as unknown as { name: string } | null)?.name} • PYQs ({pyqs.length})</p>
      </div>

      {/* Add PYQ Form */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-orange-500" /> Add New PYQ
        </h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex gap-3">
            <div className="w-32">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Year</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Question</label>
              <textarea
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
              <div key={opt}>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Option {opt}</label>
                <input
                  value={form[`opt${opt}` as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [`opt${opt}`]: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="w-32">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Correct Answer</label>
              <select
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                {['A', 'B', 'C', 'D'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Explanation</label>
              <input
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button onClick={addPYQ} loading={saving} disabled={!form.question || !form.optA}>
            <PlusCircle className="w-4 h-4 mr-1.5" /> Add PYQ
          </Button>
        </div>
      </div>

      {/* PYQs List */}
      <div className="space-y-3">
        {pyqs.map((pyq) => (
          <div key={pyq.id} className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{pyq.year}</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Ans: {pyq.answer}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 mb-2">{pyq.question}</p>
                <div className="grid grid-cols-2 gap-1">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <p key={opt} className={`text-xs px-2 py-1 rounded ${opt === pyq.answer ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}>
                      {opt}. {pyq.options[opt]}
                    </p>
                  ))}
                </div>
              </div>
              <button
                onClick={() => deletePYQ(pyq.id)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
