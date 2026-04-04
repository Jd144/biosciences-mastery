import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock, CheckCircle, BookOpen } from 'lucide-react'

const subjectEmojis: Record<string, string> = {
  'biochemistry': '🧪',
  'microbiology': '🦠',
  'cell-biology': '🔬',
  'molecular-biology-genetics': '🧬',
  'bioanalytical-techniques': '🔭',
  'immunology': '🛡️',
  'bioinformatics': '💻',
  'recombinant-dna-technology': '🧫',
  'plant-biotechnology': '🌱',
  'animal-biotechnology-bioprocessing': '🐭',
}

export default async function SubjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all subjects with topic count
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*, topics(count)')
    .eq('is_active', true)
    .order('order_index')

  // Fetch entitlements
  const { data: entitlements } = await supabase
    .from('entitlements')
    .select('type, subject_id')
    .eq('user_id', user.id)

  const hasFull = entitlements?.some((e) => e.type === 'FULL') ?? false
  const ownedSubjectIds = new Set(
    entitlements?.filter((e) => e.type === 'SUBJECT').map((e) => e.subject_id) ?? []
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-500 text-sm mt-1">All 10 GAT-B subjects</p>
        </div>
        {!hasFull && (
          <Link
            href="/app/buy/full"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Unlock All ₹999
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects?.map((subject) => {
          const isOwned = hasFull || ownedSubjectIds.has(subject.id)
          const topicCount = (subject.topics as { count: number }[])?.[0]?.count ?? 0
          const emoji = subjectEmojis[subject.slug] ?? '📚'

          return (
            <div
              key={subject.id}
              className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${
                isOwned
                  ? 'border-emerald-100 hover:border-emerald-300 hover:shadow-md'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-4xl">{emoji}</span>
                  {isOwned ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Owned
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{subject.name}</h3>
                <p className="text-xs text-gray-400 flex items-center gap-1 mb-4">
                  <BookOpen className="w-3 h-3" /> {topicCount} topics
                </p>

                {isOwned ? (
                  <Link
                    href={`/app/subjects/${subject.slug}`}
                    className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                  >
                    Start Studying →
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <Link
                      href={`/app/buy/subject?subject=${subject.slug}`}
                      className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      Buy ₹449
                    </Link>
                    <Link
                      href="/app/buy/full"
                      className="flex-1 text-center border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      Full ₹999
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
