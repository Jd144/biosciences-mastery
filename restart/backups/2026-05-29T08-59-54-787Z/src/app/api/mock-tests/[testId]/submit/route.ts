import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin'

// GATE BT negative marking constants
const NEGATIVE_MARKING_ONE_MARK = 1 / 3   // deducted for wrong on 1-mark question
const NEGATIVE_MARKING_TWO_MARK = 2 / 3   // deducted for wrong on 2-mark question

interface AnswerMap {
  [questionId: string]: string
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { testId } = await params
  const { answers, time_taken_seconds }: { answers: AnswerMap; time_taken_seconds?: number } = await request.json()

  // Fetch all questions with answers and marks
  const { data: questions, error: qErr } = await supabase
    .from('mock_test_questions')
    .select('id, answer, marks')
    .eq('test_id', testId)

  if (qErr || !questions) return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })

  // Calculate score using GATE negative marking
  // 1-mark wrong: -1/3, 2-mark wrong: -2/3
  let score = 0
  const maxScore = questions.reduce((acc, q) => acc + q.marks, 0)

  for (const q of questions) {
    const chosen = answers[q.id]
    if (!chosen) continue // Not attempted - no penalty
    if (chosen === q.answer) {
      score += q.marks
    } else {
      score -= q.marks === 2 ? NEGATIVE_MARKING_TWO_MARK : NEGATIVE_MARKING_ONE_MARK
    }
  }

  const roundedScore = Math.round(score * 100) / 100

  // Upsert attempt
  const svc = getServiceClient()
  const { data, error } = await svc
    .from('mock_test_attempts')
    .upsert(
      {
        test_id: testId,
        user_id: user.id,
        answers,
        score: roundedScore,
        max_score: maxScore,
        time_taken_seconds: time_taken_seconds ?? null,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'test_id,user_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ score: roundedScore, maxScore, attempt: data })
}
