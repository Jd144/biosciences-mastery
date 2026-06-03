import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient, isAdmin } from '@/lib/admin'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const serviceSupabase = getServiceClient()
  const { data, error } = await serviceSupabase
    .from('exams')
    .select('id, code, name, description, official_link, syllabus_link, registration_link, admit_card_link, result_link, study_resources_link, exam_details(*), exam_timelines(id, event_type, event_date, event_label)')
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const normalized = (data ?? []).map((exam) => ({
    ...exam,
    exam_details: Array.isArray(exam.exam_details) ? exam.exam_details[0] ?? null : exam.exam_details,
    exam_timelines: [...(exam.exam_timelines ?? [])].sort((a, b) => a.event_date.localeCompare(b.event_date)),
  }))

  const followerCounts = await Promise.all(
    normalized.map(async (exam) => {
      const response = await serviceSupabase
        .from('user_exams')
        .select('id', { count: 'exact', head: true })
        .eq('exam_id', exam.id)
      return {
        examId: exam.id,
        count: response.count ?? 0,
      }
    })
  )

  const countMap = new Map(followerCounts.map((item) => [item.examId, item.count]))

  return NextResponse.json({
    exams: normalized.map((exam) => ({
      ...exam,
      follower_count: countMap.get(exam.id) ?? 0,
    })),
  })
}
