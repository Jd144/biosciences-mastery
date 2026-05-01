import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import MockTestClient from './MockTestClient'

interface Props {
  params: Promise<{ setId: string; testId: string }>
}

export default async function MockTestPage({ params }: Props) {
  const { testId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [testRes, questionsRes, attemptRes] = await Promise.all([
    supabase
      .from('mock_tests')
      .select('id, test_no, title, description, duration_minutes, total_marks, set_id, mock_test_sets(set_no, title)')
      .eq('id', testId)
      .eq('is_active', true)
      .single(),
    supabase
      .from('mock_test_questions')
      .select('id, question_no, section, question, options, marks, answer, explanation')
      .eq('test_id', testId)
      .order('question_no'),
    supabase
      .from('mock_test_attempts')
      .select('answers, score, max_score, submitted_at, time_taken_seconds')
      .eq('test_id', testId)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (testRes.error || !testRes.data) notFound()

  return (
    <MockTestClient
      test={testRes.data as unknown as Parameters<typeof MockTestClient>[0]['test']}
      questions={(questionsRes.data ?? []) as unknown as Parameters<typeof MockTestClient>[0]['questions']}
      existingAttempt={attemptRes.data as Parameters<typeof MockTestClient>[0]['existingAttempt']}
    />
  )
}
