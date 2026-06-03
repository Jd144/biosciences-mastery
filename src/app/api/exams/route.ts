import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Timeline {
  event_type: string
  event_date: string
  event_label: string | null
}

interface ExamRow {
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
  exam_timelines: Timeline[] | null
  exam_details: Record<string, unknown>[] | Record<string, unknown> | null
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [examsRes, profileRes] = await Promise.all([
    supabase
      .from('exams')
      .select('id, code, name, description, official_link, syllabus_link, registration_link, admit_card_link, result_link, study_resources_link, exam_timelines(event_type, event_date, event_label), exam_details(*)')
      .order('name'),
    supabase.from('user_profiles').select('selected_exam_id').eq('user_id', user.id).maybeSingle(),
  ])

  if (examsRes.error) {
    return NextResponse.json({ error: examsRes.error.message }, { status: 500 })
  }

  const exams = (examsRes.data ?? []).map((exam: ExamRow) => ({
    ...exam,
    exam_details: Array.isArray(exam.exam_details) ? exam.exam_details[0] ?? null : exam.exam_details,
    exam_timelines: [...(exam.exam_timelines ?? [])].sort((a, b) => a.event_date.localeCompare(b.event_date)),
  }))

  return NextResponse.json({
    exams,
    selectedExamId: profileRes.data?.selected_exam_id ?? null,
  })
}
