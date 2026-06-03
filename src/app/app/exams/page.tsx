'use client'

import { useEffect, useMemo, useState } from 'react'

type Timeline = {
  event_type: string
  event_date: string
  event_label: string | null
}

type Exam = {
  id: string
  code: string
  name: string
  description: string
  official_link: string
  syllabus_link: string | null
  registration_link: string | null
  admit_card_link: string | null
  result_link: string | null
  study_resources_link: string | null
  exam_timelines: Timeline[]
  exam_details: {
    eligibility?: string
    exam_pattern?: string
    marking_scheme?: string
    duration?: string
    seats_approximate?: string
    fellowship_details?: string
    stipend_details?: string
    award_amount?: string
  } | null
}

function getDaysLeft(dateString: string): number {
  const now = new Date()
  const date = new Date(dateString)
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const utcDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.ceil((utcDate - utcNow) / (1000 * 60 * 60 * 24))
}

function displayEventName(eventType: string): string {
  return eventType.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function ExamsDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [exams, setExams] = useState<Exam[]>([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    const loadExams = () => {
      fetch('/api/exams')
        .then((response) => response.json())
        .then((payload: { exams: Exam[]; selectedExamId: string | null }) => {
          setExams(payload.exams ?? [])
          setSelectedExamId((current) => current || payload.selectedExamId || payload.exams?.[0]?.id || '')
        })
        .finally(() => setLoading(false))
    }

    loadExams()
    const interval = setInterval(loadExams, 30000)
    return () => clearInterval(interval)
  }, [])

  const selectedExam = useMemo(() => exams.find((exam) => exam.id === selectedExamId) ?? null, [selectedExamId, exams])

  const keyDates = useMemo(() => {
    if (!selectedExam) return []
    return selectedExam.exam_timelines
      .filter((timeline) => ['registration_end', 'admit_card_release', 'exam_date', 'result_date'].includes(timeline.event_type))
      .map((timeline) => ({
        label: displayEventName(timeline.event_type),
        date: timeline.event_date,
        daysLeft: getDaysLeft(timeline.event_date),
      }))
  }, [selectedExam])

  async function handleExamSwitch(nextExamId: string) {
    setSelectedExamId(nextExamId)
    setStatus('')
    await fetch('/api/profile/exam', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selected_exam_id: nextExamId }),
    })
    setStatus('Selected exam updated.')
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading exam dashboard...</div>
  }

  if (!selectedExam) {
    return (
      <div className="bg-white border rounded-xl p-6">
        <h1 className="text-xl font-semibold">No exam selected</h1>
        <p className="text-sm text-gray-600 mt-2">Please choose your exam from profile page to view personalized timeline and updates.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-xl p-5">
        <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">Currently preparing for</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">{selectedExam.name}</h1>
        <p className="text-sm text-gray-600 mt-2">{selectedExam.description}</p>

        <div className="mt-4">
          <label className="text-sm font-medium block mb-1">Switch exam</label>
          <select className="border rounded-lg px-3 py-2" value={selectedExamId} onChange={(event) => handleExamSwitch(event.target.value)}>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
          {status && <p className="text-xs text-emerald-700 mt-2">{status}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Complete Timeline</h2>
          <div className="space-y-3">
            {selectedExam.exam_timelines.map((item) => {
              const daysLeft = getDaysLeft(item.event_date)
              return (
                <div key={item.event_type} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{displayEventName(item.event_type)}</p>
                    <span className="text-xs text-emerald-700 font-semibold">{new Date(item.event_date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {daysLeft > 0
                      ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining`
                      : daysLeft === 0
                        ? 'Today'
                        : `${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? 's' : ''} ago`}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Key Date Highlights</h2>
            <div className="space-y-2 text-sm">
              {keyDates.map((item) => (
                <div key={item.label} className="rounded-lg bg-emerald-50 p-2 border border-emerald-100">
                  <strong>{item.label}:</strong> {new Date(item.date).toLocaleDateString()} {item.daysLeft > 0 ? `(${item.daysLeft} days left)` : ''}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Admit Card</h2>
            <p className="text-sm text-gray-600">{selectedExam.admit_card_link ? 'Admit card link is available.' : 'Admit card link will be updated by admin when released.'}</p>
            {selectedExam.admit_card_link && (
              <a href={selectedExam.admit_card_link} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-emerald-700 underline font-medium">
                Download Admit Card
              </a>
            )}
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Exam Details</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><strong>Eligibility:</strong> {selectedExam.exam_details?.eligibility ?? 'NA'}</li>
              <li><strong>Pattern:</strong> {selectedExam.exam_details?.exam_pattern ?? 'NA'}</li>
              <li><strong>Marking:</strong> {selectedExam.exam_details?.marking_scheme ?? 'NA'}</li>
              <li><strong>Duration:</strong> {selectedExam.exam_details?.duration ?? 'NA'}</li>
              <li><strong>Seats:</strong> {selectedExam.exam_details?.seats_approximate ?? 'NA'}</li>
            </ul>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Official Links</h2>
            <div className="space-y-2 text-sm">
              <a className="block text-emerald-700 underline" href={selectedExam.official_link} target="_blank" rel="noopener noreferrer">Official Website</a>
              {selectedExam.registration_link && <a className="block text-emerald-700 underline" href={selectedExam.registration_link} target="_blank" rel="noopener noreferrer">Registration Portal</a>}
              {selectedExam.syllabus_link && <a className="block text-emerald-700 underline" href={selectedExam.syllabus_link} target="_blank" rel="noopener noreferrer">Syllabus</a>}
              {selectedExam.result_link && <a className="block text-emerald-700 underline" href={selectedExam.result_link} target="_blank" rel="noopener noreferrer">Result Portal</a>}
              {selectedExam.study_resources_link && <a className="block text-emerald-700 underline" href={selectedExam.study_resources_link} target="_blank" rel="noopener noreferrer">Study Resources</a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
