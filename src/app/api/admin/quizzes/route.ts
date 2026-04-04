import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const topicId = searchParams.get('topicId')
  let query = supabase
    .from('quizzes')
    .select('*, quiz_questions(count)')
    .order('quiz_no')
  if (topicId) query = query.eq('topic_id', topicId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const serviceSupabase = getServiceClient()

  // body can be { quiz: {...}, questions: [...] }
  const { quiz, questions } = body

  const { data: quizData, error: quizError } = await serviceSupabase
    .from('quizzes')
    .upsert(quiz, { onConflict: 'topic_id,quiz_no' })
    .select()
    .single()

  if (quizError) return NextResponse.json({ error: quizError.message }, { status: 500 })

  if (questions && questions.length > 0) {
    const questionsWithQuizId = questions.map((q: Record<string, unknown>, i: number) => ({
      ...q,
      quiz_id: quizData.id,
      question_no: i + 1,
    }))
    const { error: qError } = await serviceSupabase
      .from('quiz_questions')
      .upsert(questionsWithQuizId)
    if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })
  }

  return NextResponse.json(quizData, { status: 201 })
}
