import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'

interface Props {
  searchParams: Promise<{ subjectId?: string }>
}

export default async function AdminTopicsPage({ searchParams }: Props) {
  const { subjectId } = await searchParams
  const supabase = await createClient()

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name, slug')
    .order('order_index')

  let query = supabase
    .from('topics')
    .select('*, subjects(name)')
    .order('subject_id')
    .order('order_index')

  if (subjectId) {
    query = query.eq('subject_id', subjectId)
  }

  const { data: topics } = await query

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Topics</h1>
        <Link
          href="/admin/topics/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <PlusCircle className="w-4 h-4" /> Add Topic
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <Link
          href="/admin/topics"
          className={`text-sm px-3 py-1.5 rounded-lg font-medium ${!subjectId ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All
        </Link>
        {subjects?.map((s) => (
          <Link
            key={s.id}
            href={`/admin/topics?subjectId=${s.id}`}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium ${subjectId === s.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s.name}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Subject</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Slug</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {topics?.map((t, i) => (
              <tr key={t.id} className={`${i !== 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
                <td className="px-4 py-3 text-gray-400">{t.order_index}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{t.title}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{(t.subjects as unknown as { name: string } | null)?.name}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{t.slug}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/content?topicId=${t.id}`}
                    className="text-blue-600 hover:underline text-xs font-medium mr-3"
                  >
                    Content
                  </Link>
                  <Link
                    href={`/admin/pyqs?topicId=${t.id}`}
                    className="text-orange-600 hover:underline text-xs font-medium mr-3"
                  >
                    PYQs
                  </Link>
                  <Link
                    href={`/admin/quizzes?topicId=${t.id}`}
                    className="text-purple-600 hover:underline text-xs font-medium"
                  >
                    Quizzes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
