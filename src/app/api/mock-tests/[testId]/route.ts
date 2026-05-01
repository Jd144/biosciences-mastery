import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { testId } = await params

  const [testRes, questionsRes, attemptRes] = await Promise.all([
    supabase
      .from('mock_tests')
      .select('id, test_no, title, description, duration_minutes, total_marks, set_id, mock_test_sets(set_no, title)')
      .eq('id', testId)
      .eq('is_active', true)
      .single(),
    supabase
      .from('mock_test_questions')
      .select('id, question_no, section, question, options, marks')
      .eq('test_id', testId)
      .order('question_no'),
    supabase
      .from('mock_test_attempts')
      .select('id, answers, score, max_score, submitted_at, time_taken_seconds')
      .eq('test_id', testId)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (testRes.error) return NextResponse.json({ error: 'Test not found' }, { status: 404 })

  return NextResponse.json({
    test: testRes.data,
    questions: questionsRes.data ?? [],
    attempt: attemptRes.data ?? null,
  })
}
