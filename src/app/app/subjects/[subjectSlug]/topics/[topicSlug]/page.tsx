import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TopicPageClient from './TopicPageClient'

export default async function TopicPage({
  params,
}: {
  params: Promise<{ subjectSlug: string; topicSlug: string }>
}) {
  const { subjectSlug, topicSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch subject (public read)
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', subjectSlug)
    .single()

  if (!subject) notFound()

  // Fetch topic (public read)
  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subject.id)
    .eq('slug', topicSlug)
    .single()

  if (!topic) notFound()

  // Check entitlement (only if authenticated)
  let hasAccess = false
  if (user) {
    const { data: entitlements } = await supabase
      .from('entitlements')
      .select('type, subject_id')
      .eq('user_id', user.id)

    const hasFull = entitlements?.some((e) => e.type === 'FULL') ?? false
    const hasSubject = entitlements?.some(
      (e) => e.type === 'SUBJECT' && e.subject_id === subject.id
    ) ?? false
    hasAccess = hasFull || hasSubject
  }

  // Fetch topic overview (short notes) — visible to all users
  const { data: contentRows } = await supabase
    .from('topic_content')
    .select('language, short_notes_md, detailed_notes_md, flowchart_mermaid')
    .eq('topic_id', topic.id)

  // Premium-only content — only fetch when entitled
  const [tablesRes, diagramsRes, pyqsRes, quizzesRes] = hasAccess
    ? await Promise.all([
        supabase.from('topic_tables').select('*').eq('topic_id', topic.id),
        supabase.from('topic_diagrams').select('*').eq('topic_id', topic.id),
        supabase
          .from('pyqs')
          .select('*')
          .eq('topic_id', topic.id)
          .order('year', { ascending: false }),
        supabase
          .from('quizzes')
          .select('*, quiz_questions(*)')
          .eq('topic_id', topic.id)
          .order('quiz_no'),
      ])
    : [
        // Free users: fetch only the first quiz for the 10-question free experience
        { data: null },
        { data: null },
        { data: null },
        await supabase
          .from('quizzes')
          .select('*, quiz_questions(*)')
          .eq('topic_id', topic.id)
          .eq('quiz_no', 1)
          .limit(1),
      ]

  return (
    <TopicPageClient
      subject={subject}
      topic={topic}
      userId={user?.id ?? null}
      isAuthenticated={!!user}
      hasAccess={hasAccess}
      content={contentRows ?? []}
      tables={tablesRes.data ?? []}
      diagrams={diagramsRes.data ?? []}
      pyqs={pyqsRes.data ?? []}
      quizzes={quizzesRes.data ?? []}
    />
  )
}
