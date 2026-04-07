import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import TopicPageClient from './TopicPageClient'
import type { QuizQuestion } from '@/types'

const FREE_QUIZ_QUESTION_LIMIT = 10
const PREMIUM_QUIZ_QUESTION_LIMIT = 50

export default async function TopicPage({
  params,
}: {
  params: Promise<{ subjectSlug: string; topicSlug: string }>
}) {
  const { subjectSlug, topicSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch subject
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', subjectSlug)
    .single()

  if (!subject) notFound()

  // Check entitlement
  const { data: entitlements } = await supabase
    .from('entitlements')
    .select('type, subject_id')
    .eq('user_id', user.id)

  const hasFull = entitlements?.some((e) => e.type === 'FULL') ?? false
  const hasSubject = entitlements?.some(
    (e) => e.type === 'SUBJECT' && e.subject_id === subject.id
  ) ?? false
  const isPremium = hasFull || hasSubject

  // Fetch topic
  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subject.id)
    .eq('slug', topicSlug)
    .single()

  if (!topic) notFound()

  // Fetch all content in parallel
  const [contentRes, tablesRes, diagramsRes, pyqsRes, quizzesRes] = await Promise.all([
    supabase.from('topic_content').select('*').eq('topic_id', topic.id),
    supabase.from('topic_tables').select('*').eq('topic_id', topic.id),
    supabase.from('topic_diagrams').select('*').eq('topic_id', topic.id),
    supabase.from('pyqs').select('*').eq('topic_id', topic.id).order('year', { ascending: false }),
    supabase.from('quizzes').select('*, quiz_questions(*)').eq('topic_id', topic.id).order('quiz_no'),
  ])

  // Limit quiz questions based on plan
  const questionLimit = isPremium ? PREMIUM_QUIZ_QUESTION_LIMIT : FREE_QUIZ_QUESTION_LIMIT
  const rawQuizzes = quizzesRes.data ?? []

  // Flatten questions across quizzes, cap at limit, then redistribute back
  const limitedQuizzes = rawQuizzes.reduce<{ quizzes: typeof rawQuizzes; remaining: number }>(
    (acc, quiz) => {
      const allQuestions: QuizQuestion[] = (quiz.quiz_questions as QuizQuestion[] | null) ?? []
      const allowed = Math.min(allQuestions.length, acc.remaining)
      if (allowed === 0) return acc
      return {
        quizzes: [...acc.quizzes, { ...quiz, quiz_questions: allQuestions.slice(0, allowed) }],
        remaining: acc.remaining - allowed,
      }
    },
    { quizzes: [], remaining: questionLimit }
  ).quizzes

  return (
    <TopicPageClient
      subject={subject}
      topic={topic}
      userId={user.id}
      isPremium={isPremium}
      content={contentRes.data ?? []}
      tables={isPremium ? (tablesRes.data ?? []) : []}
      diagrams={isPremium ? (diagramsRes.data ?? []) : []}
      pyqs={pyqsRes.data ?? []}
      quizzes={limitedQuizzes}
    />
  )
}
