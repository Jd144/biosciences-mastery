import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import TopicPageClient from './TopicPageClient'

const FREE_QUIZ_QUESTION_LIMIT = 10
const PREMIUM_QUIZ_QUESTION_LIMIT = 50
const FREE_AI_DAILY_LIMIT = 5

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
  const hasAccess = hasFull || hasSubject

  if (!hasAccess) {
    redirect(`/app/subjects/${subjectSlug}`)
  }

  // isPremium = has FULL access
  const isPremium = hasFull

  // Fetch topic
  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subject.id)
    .eq('slug', topicSlug)
    .single()

  if (!topic) notFound()

  // Fetch AI usage for today (free users only)
  let aiUsedToday = 0
  if (!isPremium) {
    const todayStart = new Date()
    todayStart.setUTCHours(0, 0, 0, 0)
    const { count } = await supabase
      .from('ai_usage_log')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString())
    aiUsedToday = count ?? 0
  }

  // Fetch all content in parallel
  const [contentRes, tablesRes, diagramsRes, pyqsRes, quizzesRes] = await Promise.all([
    supabase.from('topic_content').select('*').eq('topic_id', topic.id),
    supabase.from('topic_tables').select('*').eq('topic_id', topic.id),
    supabase.from('topic_diagrams').select('*').eq('topic_id', topic.id),
    supabase.from('pyqs').select('*').eq('topic_id', topic.id).order('year', { ascending: false }),
    supabase.from('quizzes').select('*, quiz_questions(*)').eq('topic_id', topic.id).order('quiz_no'),
  ])

  // Apply quiz question limit based on tier
  const questionLimit = isPremium ? PREMIUM_QUIZ_QUESTION_LIMIT : FREE_QUIZ_QUESTION_LIMIT
  const rawQuizzes = quizzesRes.data ?? []
  const limitedQuizzes = rawQuizzes.reduce<typeof rawQuizzes>(
    (acc, quiz) => {
      const soFar = acc.reduce((s, q) => s + (q.quiz_questions?.length ?? 0), 0)
      const remaining = questionLimit - soFar
      if (remaining <= 0) return acc
      const limitedQuestions = (quiz.quiz_questions ?? []).slice(0, remaining)
      return [...acc, { ...quiz, quiz_questions: limitedQuestions }]
    },
    []
  )

  return (
    <TopicPageClient
      subject={subject}
      topic={topic}
      userId={user.id}
      isPremium={isPremium}
      aiUsedToday={aiUsedToday}
      aiDailyLimit={FREE_AI_DAILY_LIMIT}
      content={contentRes.data ?? []}
      tables={tablesRes.data ?? []}
      diagrams={diagramsRes.data ?? []}
      pyqs={pyqsRes.data ?? []}
      quizzes={limitedQuizzes ?? []}
    />
  )
}
