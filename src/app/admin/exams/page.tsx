'use client'

import { useEffect, useMemo, useState } from 'react'

type TimelineEventType = 'registration_start' | 'registration_end' | 'admit_card_release' | 'exam_date' | 'result_date'

type Timeline = {
  event_type: TimelineEventType
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
  exam_details: {
    eligibility: string | null
    exam_pattern: string | null
    marking_scheme: string | null
    duration: string | null
    seats_approximate: string | null
    fellowship_details: string | null
    stipend_details: string | null
    award_amount: string | null
  } | null
  exam_timelines: Timeline[]
  follower_count?: number
}

type FormState = {
  name: string
  description: string
  official_link: string
  syllabus_link: string
  registration_link: string
  admit_card_link: string
  result_link: string
  study_resources_link: string
  eligibility: string
  exam_pattern: string
  marking_scheme: string
  duration: string
  seats_approximate: string
  fellowship_details: string
  stipend_details: string
  award_amount: string
  timelines: Record<TimelineEventType, string>
}

const TIMELINE_TYPES: TimelineEventType[] = ['registration_start', 'registration_end', 'admit_card_release', 'exam_date', 'result_date']

function createFormState(exam: Exam): FormState {
  const timelineMap: Record<TimelineEventType, string> = {
    registration_start: '',
    registration_end: '',
    admit_card_release: '',
    exam_date: '',
    result_date: '',
  }

  exam.exam_timelines.forEach((timeline) => {
    timelineMap[timeline.event_type] = timeline.event_date
  })

  return {
    name: exam.name,
    description: exam.description,
    official_link: exam.official_link,
    syllabus_link: exam.syllabus_link ?? '',
    registration_link: exam.registration_link ?? '',
    admit_card_link: exam.admit_card_link ?? '',
    result_link: exam.result_link ?? '',
    study_resources_link: exam.study_resources_link ?? '',
    eligibility: exam.exam_details?.eligibility ?? '',
    exam_pattern: exam.exam_details?.exam_pattern ?? '',
    marking_scheme: exam.exam_details?.marking_scheme ?? '',
    duration: exam.exam_details?.duration ?? '',
    seats_approximate: exam.exam_details?.seats_approximate ?? '',
    fellowship_details: exam.exam_details?.fellowship_details ?? '',
    stipend_details: exam.exam_details?.stipend_details ?? '',
    award_amount: exam.exam_details?.award_amount ?? '',
    timelines: timelineMap,
  }
}

export default function AdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExamId, setSelectedExamId] = useState<string>('')
  const [form, setForm] = useState<FormState | null>(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    fetch('/api/admin/exams')
      .then((response) => response.json())
      .then((payload: { exams?: Exam[]; error?: string }) => {
        const nextExams = payload.exams ?? []
        setExams(nextExams)
        if (nextExams.length > 0) {
          setSelectedExamId(nextExams[0].id)
          setForm(createFormState(nextExams[0]))
        }
      })
  }, [])

  const selectedExam = useMemo(() => exams.find((exam) => exam.id === selectedExamId) ?? null, [selectedExamId, exams])

  async function handleSave() {
    if (!selectedExam || !form) return
    setSaving(true)
    setStatus('')

    const timelines = TIMELINE_TYPES.map((eventType) => ({
      event_type: eventType,
      event_date: form.timelines[eventType],
      event_label: eventType.replace(/_/g, ' '),
    }))

    const response = await fetch(`/api/admin/exams/${selectedExam.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        timelines,
      }),
    })

    setSaving(false)
    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => ({ error: 'Failed to save exam data' }))) as { error?: string }
      setStatus(errorPayload.error ?? 'Failed to save exam data')
      return
    }

    setStatus('Exam updated and notifications triggered for followers.')
  }

  if (exams.length === 0 || !form) {
    return <div className="text-sm text-gray-500">Loading exam management...</div>
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Biotechnology Exams Management</h1>
        <p className="text-sm text-gray-600 mt-1">Update exam dates, admit card links, result links and details. Followers are notified automatically.</p>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <label className="text-sm font-medium block mb-2">Select Exam</label>
        <select
          className="border rounded-lg px-3 py-2 w-full"
          value={selectedExamId}
          onChange={(event) => {
            const nextId = event.target.value
            setSelectedExamId(nextId)
            const nextExam = exams.find((exam) => exam.id === nextId)
            if (nextExam) {
              setForm(createFormState(nextExam))
            }
          }}
        >
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name}
            </option>
          ))}
        </select>
        {selectedExam && (
          <p className="text-xs text-gray-500 mt-2">Followers: {selectedExam.follower_count ?? 0}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border rounded-xl p-4">
        <input className="border rounded px-3 py-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Exam name" />
        <input className="border rounded px-3 py-2" value={form.official_link} onChange={(event) => setForm({ ...form, official_link: event.target.value })} placeholder="Official link" />
        <input className="border rounded px-3 py-2" value={form.syllabus_link} onChange={(event) => setForm({ ...form, syllabus_link: event.target.value })} placeholder="Syllabus link" />
        <input className="border rounded px-3 py-2" value={form.registration_link} onChange={(event) => setForm({ ...form, registration_link: event.target.value })} placeholder="Registration link" />
        <input className="border rounded px-3 py-2" value={form.admit_card_link} onChange={(event) => setForm({ ...form, admit_card_link: event.target.value })} placeholder="Admit card link" />
        <input className="border rounded px-3 py-2" value={form.result_link} onChange={(event) => setForm({ ...form, result_link: event.target.value })} placeholder="Result link" />
        <textarea className="border rounded px-3 py-2 md:col-span-2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" rows={3} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border rounded-xl p-4">
        {TIMELINE_TYPES.map((eventType) => (
          <div key={eventType}>
            <label className="text-xs font-medium text-gray-500 block mb-1">{eventType.replace(/_/g, ' ')}</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={form.timelines[eventType]}
              onChange={(event) =>
                setForm({
                  ...form,
                  timelines: {
                    ...form.timelines,
                    [eventType]: event.target.value,
                  },
                })
              }
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border rounded-xl p-4">
        <textarea className="border rounded px-3 py-2" rows={3} value={form.eligibility} onChange={(event) => setForm({ ...form, eligibility: event.target.value })} placeholder="Eligibility" />
        <textarea className="border rounded px-3 py-2" rows={3} value={form.exam_pattern} onChange={(event) => setForm({ ...form, exam_pattern: event.target.value })} placeholder="Exam pattern" />
        <textarea className="border rounded px-3 py-2" rows={2} value={form.marking_scheme} onChange={(event) => setForm({ ...form, marking_scheme: event.target.value })} placeholder="Marking scheme" />
        <input className="border rounded px-3 py-2" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} placeholder="Duration" />
        <input className="border rounded px-3 py-2" value={form.seats_approximate} onChange={(event) => setForm({ ...form, seats_approximate: event.target.value })} placeholder="Approx seats" />
        <input className="border rounded px-3 py-2" value={form.award_amount} onChange={(event) => setForm({ ...form, award_amount: event.target.value })} placeholder="Award amount" />
        <textarea className="border rounded px-3 py-2" rows={2} value={form.fellowship_details} onChange={(event) => setForm({ ...form, fellowship_details: event.target.value })} placeholder="Fellowship details" />
        <textarea className="border rounded px-3 py-2" rows={2} value={form.stipend_details} onChange={(event) => setForm({ ...form, stipend_details: event.target.value })} placeholder="Stipend details" />
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="bg-emerald-600 text-white px-5 py-2 rounded-lg disabled:opacity-50">
          {saving ? 'Saving...' : 'Save exam updates'}
        </button>
        {status && <span className="text-sm text-gray-600">{status}</span>}
      </div>
    </div>
  )
}
