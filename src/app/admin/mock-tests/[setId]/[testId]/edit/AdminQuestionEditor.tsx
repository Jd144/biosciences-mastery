'use client'

import { useState } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'

interface Question {
  id?: string
  question_no: number
  section: 'GA' | 'BT'
  question: string
  options: { A: string; B: string; C: string; D: string }
  answer: 'A' | 'B' | 'C' | 'D'
  marks: 1 | 2
  explanation: string
}

const emptyQuestion = (no: number, section: 'GA' | 'BT' = 'GA'): Question => ({
  question_no: no,
  section,
  question: '',
  options: { A: '', B: '', C: '', D: '' },
  answer: 'A',
  marks: 1,
  explanation: '',
})

interface Props {
  testId: string
  setId: string
  initialQuestions: Question[]
}

export default function AdminQuestionEditor({ testId, setId, initialQuestions }: Props) {
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions.length > 0
      ? initialQuestions
      : [emptyQuestion(1, 'GA')]
  )
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)

  const activeQ = questions[activeIdx]

  const updateQ = (field: keyof Question, value: unknown) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === activeIdx ? { ...q, [field]: value } : q))
    )
  }

  const updateOption = (opt: 'A' | 'B' | 'C' | 'D', value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === activeIdx ? { ...q, options: { ...q.options, [opt]: value } } : q
      )
    )
  }

  const addQuestion = () => {
    const no = questions.length + 1
    const section: 'GA' | 'BT' = no <= 10 ? 'GA' : 'BT'
    setQuestions((prev) => [...prev, emptyQuestion(no, section)])
    setActiveIdx(questions.length)
  }

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => {
      const updated = prev.filter((_, i) => i !== idx).map((q, i) => ({ ...q, question_no: i + 1 }))
      return updated
    })
    setActiveIdx((i) => Math.max(0, i > idx ? i - 1 : Math.min(i, questions.length - 2)))
  }

  const handleSaveAll = async () => {
    // Validate
    for (const q of questions) {
      if (!q.question || !q.options.A || !q.options.B || !q.options.C || !q.options.D) {
        setSaveMsg('Please fill all question fields and options before saving.')
        return
      }
    }
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch(`/api/admin/mock-tests/${setId}/${testId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questions),
      })
      const data = await res.json()
      if (res.ok) {
        // Update IDs
        if (Array.isArray(data)) {
          setQuestions((prev) =>
            prev.map((q) => {
              const saved = data.find((d) => d.question_no === q.question_no)
              return saved ? { ...q, id: saved.id } : q
            })
          )
        }
        setSaveMsg(`✓ Saved ${questions.length} questions`)
      } else {
        setSaveMsg(data.error ?? 'Failed to save')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!activeQ) return null

  const gaCount = questions.filter((q) => q.section === 'GA').length
  const btCount = questions.filter((q) => q.section === 'BT').length

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Question palette */}
      <div className="lg:w-56 shrink-0">
        <div className="bg-white border border-gray-100 rounded-xl p-3 sticky top-20">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-600">Questions ({questions.length}/65)</p>
            <div className="text-xs text-gray-400">
              GA:{gaCount} BT:{btCount}
            </div>
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto mb-3">
            {questions.map((q, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveIdx(idx)}
                  className={`flex-1 text-left text-xs px-2 py-1.5 rounded-lg ${
                    idx === activeIdx
                      ? 'bg-emerald-600 text-white font-semibold'
                      : q.question
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-red-50 text-red-500 hover:bg-red-100'
                  }`}
                >
                  <span className={`text-xs mr-1 ${q.section === 'GA' ? 'text-blue-400' : 'text-purple-400'} ${idx === activeIdx ? 'text-white/70' : ''}`}>
                    [{q.section}]
                  </span>
                  Q{q.question_no} ({q.marks}M)
                </button>
                <button
                  onClick={() => removeQuestion(idx)}
                  className="text-red-400 hover:text-red-600 p-1"
                  title="Remove"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {questions.length < 65 && (
            <button
              onClick={addQuestion}
              className="w-full flex items-center justify-center gap-1 text-xs py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-3.5 h-3.5" /> Add Question
            </button>
          )}

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full flex items-center justify-center gap-1 text-xs py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 mt-2"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'Saving...' : 'Save All'}
          </button>
          {saveMsg && (
            <p className={`text-xs mt-2 text-center ${saveMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'}`}>
              {saveMsg}
            </p>
          )}
        </div>
      </div>

      {/* Question editor */}
      <div className="flex-1">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <h2 className="font-bold text-gray-800 text-lg">Q{activeQ.question_no}</h2>

            {/* Section */}
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-500">Section:</label>
              <select
                value={activeQ.section}
                onChange={(e) => updateQ('section', e.target.value)}
                className="border rounded px-2 py-1 text-xs"
              >
                <option value="GA">GA – General Aptitude</option>
                <option value="BT">BT – Biotechnology</option>
              </select>
            </div>

            {/* Marks */}
            <div className="flex items-center gap-1">
              <label className="text-xs text-gray-500">Marks:</label>
              <select
                value={activeQ.marks}
                onChange={(e) => updateQ('marks', parseInt(e.target.value) as 1 | 2)}
                className="border rounded px-2 py-1 text-xs"
              >
                <option value={1}>1 Mark</option>
                <option value={2}>2 Marks</option>
              </select>
            </div>
          </div>

          {/* Question text */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-600 block mb-1">Question *</label>
            <textarea
              value={activeQ.question}
              onChange={(e) => updateQ('question', e.target.value)}
              rows={3}
              className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Enter question text..."
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {(['A', 'B', 'C', 'D'] as const).map((opt) => (
              <div key={opt}>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Option {opt} *</label>
                <div className="flex items-center gap-2">
                  <input
                    value={activeQ.options[opt]}
                    onChange={(e) => updateOption(opt, e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder={`Option ${opt}`}
                  />
                  <button
                    onClick={() => updateQ('answer', opt)}
                    className={`w-8 h-8 rounded-full border-2 text-xs font-bold transition-colors shrink-0 ${
                      activeQ.answer === opt
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-gray-300 text-gray-400 hover:border-emerald-300'
                    }`}
                    title={`Set ${opt} as correct answer`}
                  >
                    ✓
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 text-sm">
            <span className="font-semibold text-emerald-700">Correct Answer: {activeQ.answer}</span>
          </div>

          {/* Explanation */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Explanation (optional)</label>
            <textarea
              value={activeQ.explanation}
              onChange={(e) => updateQ('explanation', e.target.value)}
              rows={2}
              className="w-full border rounded-xl px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Explain the correct answer..."
            />
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              onClick={() => setActiveIdx((i) => Math.min(questions.length - 1, i + 1))}
              disabled={activeIdx === questions.length - 1}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
