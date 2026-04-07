import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Lock, ChevronRight, BookOpen } from 'lucide-react'

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectSlug: string }>
}) {
  const { subjectSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch subject
  const { data: subject } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', subjectSlug)
    .eq('is_active', true)
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

  // Fetch topics
  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('subject_id', subject.id)
    .order('order_index')

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/app/subjects" className="hover:text-emerald-600">Subjects</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{subject.name}</span>
      </nav>

      {/* Subject Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{subject.name}</h1>
            <p className="text-gray-500 text-sm">{subject.description}</p>
            <p className="text-sm text-gray-400 mt-2">
              <BookOpen className="inline w-4 h-4 mr-1" />
              {topics?.length ?? 0} topics
            </p>
          </div>
          {!hasAccess && (
            <div className="flex gap-3">
              <Link
                href={`/app/buy/subject?subject=${subject.slug}`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                Buy Subject ₹449
              </Link>
              <Link
                href="/app/buy/full"
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm font-medium px-4 py-2 rounded-lg"
              >
                Full Course ₹999
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Locked Banner */}
      {!hasAccess && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-amber-700 text-sm">
            <strong>This subject is locked.</strong> Purchase to unlock all topics, notes, PYQs, quizzes, and AI features.
          </p>
        </div>
      )}

      {/* Topics List */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Topics</h2>
        </div>
        {topics?.map((topic, i) => (
          <div
            key={topic.id}
            className={`flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${
              i !== 0 ? 'border-t border-gray-100' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-400 w-6">{topic.order_index}.</span>
              <span className={`font-medium text-sm ${hasAccess ? 'text-gray-800' : 'text-gray-400'}`}>
                {topic.title}
              </span>
            </div>
            {hasAccess ? (
              <Link
                href={`/app/subjects/${subjectSlug}/topics/${topic.slug}`}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
              >
                Study <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href={`/app/subjects/${subjectSlug}/topics/${topic.slug}`}
                className="text-amber-600 hover:text-amber-700 text-xs font-medium flex items-center gap-1 border border-amber-200 px-2 py-1 rounded-md hover:bg-amber-50"
              >
                <Lock className="w-3 h-3" /> Preview
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
