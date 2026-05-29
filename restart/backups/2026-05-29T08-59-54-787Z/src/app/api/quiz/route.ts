import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const FREE_QUIZ_QUESTIONS = parseInt(process.env.FREE_QUIZ_QUESTIONS ?? '10', 10)
const PREMIUM_QUIZ_QUESTIONS = parseInt(process.env.PREMIUM_QUIZ_QUESTIONS ?? '50', 10)

/**
 * GET /api/quiz?topicId=<uuid>
 *
 * Returns quiz questions for a topic. The number of questions served depends on
 * the calling user's entitlement:
 *   - Unauthenticated: 401
 *   - Authenticated, no entitlement (free): up to FREE_QUIZ_QUESTIONS questions
 *   - Authenticated, entitled (premium): up to PREMIUM_QUIZ_QUESTIONS questions
 *
 * Questions are collected across all quizzes for the topic and capped to the
 * appropriate limit.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const topicId = searchParams.get('topicId')

  if (!topicId) {
    return NextResponse.json({ error: 'topicId query parameter is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the topic exists and fetch its subject_id
  const { data: topic } = await supabase
    .from('topics')
    .select('id, title, subject_id')
    .eq('id', topicId)
    .single()

  if (!topic) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
  }

  // Check entitlement
  const { data: fullEnt } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'FULL')
    .maybeSingle()

  let hasPremium = !!fullEnt
  if (!hasPremium) {
    const { data: subjectEnt } = await supabase
      .from('entitlements')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'SUBJECT')
      .eq('subject_id', topic.subject_id)
      .maybeSingle()
    hasPremium = !!subjectEnt
  }

  const limit = hasPremium ? PREMIUM_QUIZ_QUESTIONS : FREE_QUIZ_QUESTIONS

  // Fetch quizzes ordered by quiz_no; each quiz embeds its questions
  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select('id, quiz_no, title, quiz_questions(id, question_no, question, options, answer, explanation, difficulty)')
    .eq('topic_id', topicId)
    .order('quiz_no')

  if (error) {
    console.error('Quiz fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz data' }, { status: 500 })
  }

  // Flatten questions across all quizzes and cap to the tier limit
  const allQuestions = (quizzes ?? []).flatMap((q) =>
    (q.quiz_questions ?? []).map((qq) => ({ ...qq, quiz_no: q.quiz_no, quiz_title: q.title }))
  )

  const questions = allQuestions.slice(0, limit)

  return NextResponse.json({
    topicId,
    topicTitle: topic.title,
    hasPremium,
    limit,
    total: questions.length,
    questions,
  })
}
