'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, ChevronLeft, ChevronRight, Flag, CheckCircle } from 'lucide-react'

interface Question {
  id: string
  question_no: number
  section: 'GA' | 'BT'
  question: string
  options: { A: string; B: string; C: string; D: string }
  marks: number
  answer?: string
  explanation?: string
}

interface Test {
  id: string
  test_no: number
  title: string
  duration_minutes: number
  total_marks: number
  mock_test_sets: { set_no: number; title: string } | null
}

interface Attempt {
  answers: Record<string, string>
  score: number
  max_score: number
  submitted_at: string
  time_taken_seconds?: number
}

interface Props {
  test: Test
  questions: Question[]
  existingAttempt: Attempt | null
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function MockTestClient({ test, questions, existingAttempt }: Props) {
  const totalSeconds = test.duration_minutes * 60
  const [answers, setAnswers] = useState<Record<string, string>>(existingAttempt?.answers ?? {})
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [submitted, setSubmitted] = useState(!!existingAttempt?.submitted_at)
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(
    existingAttempt?.submitted_at
      ? { score: existingAttempt.score, maxScore: existingAttempt.max_score }
      : null
  )
  const [submitting, setSubmitting] = useState(false)
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [showReview, setShowReview] = useState(false)
  const startTimeRef = useRef(Date.now())

  // Timer countdown
  useEffect(() => {
    if (submitted) return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          handleSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted])

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return
    setSubmitting(true)
    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000)
    try {
      const res = await fetch(`/api/mock-tests/${test.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, time_taken_seconds: timeTaken }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ score: data.score, maxScore: data.maxScore })
        setSubmitted(true)
        setShowReview(true)
      }
    } finally {
      setSubmitting(false)
    }
  }, [answers, test.id, submitted, submitting])

  const gaQuestions = questions.filter((q) => q.section === 'GA')
  const btQuestions = questions.filter((q) => q.section === 'BT')
  const currentQ = questions[currentIdx]

  const answered = Object.keys(answers).length
  const flaggedCount = flagged.size

  if (submitted && result && showReview) {
    const pct = Math.round((result.score / result.maxScore) * 100)
    const correct = questions.filter((q) => answers[q.id] === q.answer).length
    const wrong = questions.filter((q) => answers[q.id] && answers[q.id] !== q.answer).length
    const notAttempted = questions.filter((q) => !answers[q.id]).length

    return (
      <div className="max-w-4xl mx-auto">
        {/* Result header */}
        <div className={`rounded-2xl p-8 mb-6 text-white ${pct >= 50 ? 'bg-gradient-to-br from-emerald-600 to-teal-600' : 'bg-gradient-to-br from-red-500 to-orange-500'}`}>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8" />
            <div>
              <p className="text-lg font-semibold opacity-90">Test Submitted</p>
              <h2 className="text-3xl font-bold">{result.score} / {result.maxScore}</h2>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="opacity-80">Score %</p>
              <p className="text-xl font-bold">{pct}%</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="opacity-80">Correct</p>
              <p className="text-xl font-bold text-emerald-200">{correct}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="opacity-80">Wrong</p>
              <p className="text-xl font-bold text-red-200">{wrong}</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="opacity-80">Skipped</p>
              <p className="text-xl font-bold">{notAttempted}</p>
            </div>
          </div>
        </div>

        {/* Section-wise breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[{ label: 'General Aptitude (GA)', qs: gaQuestions }, { label: 'Biotechnology (BT)', qs: btQuestions }].map((sec) => {
            const secCorrect = sec.qs.filter((q) => answers[q.id] === q.answer).length
            const secMarks = sec.qs.reduce((acc, q) => acc + (answers[q.id] === q.answer ? q.marks : answers[q.id] ? -(q.marks === 2 ? 2 / 3 : 1 / 3) : 0), 0)
            return (
              <div key={sec.label} className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="font-semibold text-gray-700 text-sm mb-2">{sec.label}</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(secMarks * 100) / 100}</p>
                <p className="text-xs text-gray-500">{secCorrect}/{sec.qs.length} correct</p>
              </div>
            )
          })}
        </div>

        {/* Question review */}
        <h3 className="text-lg font-bold text-gray-900 mb-4">Question Review</h3>
        <div className="space-y-4">
          {questions.map((q) => {
            const chosen = answers[q.id]
            const isCorrect = chosen === q.answer
            const isWrong = chosen && chosen !== q.answer
            return (
              <div key={q.id} className={`bg-white border rounded-xl p-5 ${isCorrect ? 'border-emerald-200' : isWrong ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">Q{q.question_no}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.section === 'GA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {q.section}
                    </span>
                    <span className="text-xs text-gray-400">{q.marks}M</span>
                  </div>
                  {isCorrect && <span className="text-xs text-emerald-600 font-semibold">+{q.marks}</span>}
                  {isWrong && <span className="text-xs text-red-600 font-semibold">{q.marks === 2 ? '-0.67' : '-0.33'}</span>}
                  {!chosen && <span className="text-xs text-gray-400">Skipped</span>}
                </div>
                <p className="text-sm text-gray-800 mb-3">{q.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                    <div
                      key={opt}
                      className={`text-xs px-3 py-2 rounded-lg border ${
                        opt === q.answer
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold'
                          : opt === chosen && chosen !== q.answer
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="font-semibold mr-1">{opt}.</span>
                      {q.options[opt]}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-xs text-gray-500 border-l-2 border-gray-200 pl-3 mt-2">{q.explanation}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (!currentQ) return null

  const timerDanger = timeLeft < 300 // last 5 minutes

  return (
    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-4">
      {/* Main exam area */}
      <div className="flex-1">
        {/* Top bar */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">
              {test.mock_test_sets?.title} · Test {test.test_no}
            </p>
            <p className="font-bold text-gray-900">{test.title}</p>
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-xl ${timerDanger ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700'}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${currentQ.section === 'GA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {currentQ.section === 'GA' ? 'General Aptitude' : 'Biotechnology'}
              </span>
              <span className="text-xs text-gray-400">{currentQ.marks} Mark{currentQ.marks > 1 ? 's' : ''}</span>
            </div>
            <button
              onClick={() => setFlagged((f) => {
                const n = new Set(f)
                n.has(currentQ.id) ? n.delete(currentQ.id) : n.add(currentQ.id)
                return n
              })}
              className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg ${flagged.has(currentQ.id) ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-600'}`}
            >
              <Flag className="w-3.5 h-3.5" />
              {flagged.has(currentQ.id) ? 'Flagged' : 'Flag'}
            </button>
          </div>

          <p className="font-semibold text-sm text-gray-400 mb-2">Q{currentQ.question_no}.</p>
          <p className="text-base text-gray-900 mb-6 leading-relaxed">{currentQ.question}</p>

          <div className="space-y-2">
            {(['A', 'B', 'C', 'D'] as const).map((opt) => {
              const selected = answers[currentQ.id] === opt
              return (
                <button
                  key={opt}
                  onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: opt }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                    selected
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-medium'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-200'
                  }`}
                >
                  <span className="font-bold mr-2 text-gray-500">{opt}.</span>
                  {currentQ.options[opt]}
                </button>
              )
            })}
          </div>

          {answers[currentQ.id] && (
            <button
              onClick={() => setAnswers((prev) => { const n = { ...prev }; delete n[currentQ.id]; return n })}
              className="text-xs text-gray-400 hover:text-red-500 mt-3"
            >
              Clear Answer
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-gray-500">
            {currentIdx + 1} / {questions.length}
          </span>
          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (confirm(`Submit test? You have answered ${answered}/${questions.length} questions.`)) {
                  handleSubmit()
                }
              }}
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          )}
        </div>
      </div>

      {/* Question palette sidebar */}
      <div className="lg:w-64 shrink-0">
        <div className="bg-white border border-gray-100 rounded-xl p-4 sticky top-20">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-700 text-sm">Question Palette</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="bg-emerald-50 text-emerald-700 rounded-lg p-2 text-center">
              <p className="font-bold text-lg">{answered}</p>
              <p>Answered</p>
            </div>
            <div className="bg-gray-50 text-gray-600 rounded-lg p-2 text-center">
              <p className="font-bold text-lg">{questions.length - answered}</p>
              <p>Not Answered</p>
            </div>
            {flaggedCount > 0 && (
              <div className="bg-orange-50 text-orange-700 rounded-lg p-2 text-center col-span-2">
                <p className="font-bold">{flaggedCount} Flagged for Review</p>
              </div>
            )}
          </div>

          {/* GA section */}
          <div className="mb-3">
            <p className="text-xs font-semibold text-blue-700 mb-2">General Aptitude</p>
            <div className="flex flex-wrap gap-1">
              {gaQuestions.map((q) => {
                const idx = questions.indexOf(q)
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-8 h-8 text-xs rounded-lg font-medium border transition-colors ${
                      currentIdx === idx
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : answers[q.id]
                        ? flagged.has(q.id)
                          ? 'bg-orange-100 border-orange-300 text-orange-700'
                          : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                        : flagged.has(q.id)
                        ? 'bg-orange-50 border-orange-200 text-orange-600'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    {q.question_no}
                  </button>
                )
              })}
            </div>
          </div>

          {/* BT section */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-purple-700 mb-2">Biotechnology</p>
            <div className="flex flex-wrap gap-1">
              {btQuestions.map((q) => {
                const idx = questions.indexOf(q)
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-8 h-8 text-xs rounded-lg font-medium border transition-colors ${
                      currentIdx === idx
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : answers[q.id]
                        ? flagged.has(q.id)
                          ? 'bg-orange-100 border-orange-300 text-orange-700'
                          : 'bg-emerald-100 border-emerald-300 text-emerald-700'
                        : flagged.has(q.id)
                        ? 'bg-orange-50 border-orange-200 text-orange-600'
                        : 'bg-gray-50 border-gray-200 text-gray-500'
                    }`}
                  >
                    {q.question_no}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => {
              if (confirm(`Submit test? You have answered ${answered}/${questions.length} questions.`)) {
                handleSubmit()
              }
            }}
            disabled={submitting}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit & Finish'}
          </button>

          {/* Legend */}
          <div className="mt-3 text-xs space-y-1 text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded inline-block"></span> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-gray-50 border border-gray-200 rounded inline-block"></span> Not Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-orange-100 border border-orange-300 rounded inline-block"></span> Flagged
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
