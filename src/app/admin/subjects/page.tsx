import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PlusCircle, BookOpen } from 'lucide-react'

export default async function AdminSubjectsPage() {
  const supabase = await createClient()
  const { data: subjects } = await supabase
    .from('subjects')
    .select('*, topics(count)')
    .order('order_index')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
        <Link
          href="/admin/subjects/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <PlusCircle className="w-4 h-4" /> Add Subject
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Slug</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Topics</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects?.map((s, i) => {
              const topicCount = (s.topics as { count: number }[])?.[0]?.count ?? 0
              return (
                <tr key={s.id} className={`${i !== 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
                  <td className="px-4 py-3 text-gray-400">{s.order_index}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.slug}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-gray-500">
                      <BookOpen className="w-3.5 h-3.5" /> {topicCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/topics?subjectId=${s.id}`}
                      className="text-blue-600 hover:underline text-xs font-medium mr-3"
                    >
                      Topics
                    </Link>
                    <Link
                      href={`/admin/subjects/${s.id}/edit`}
                      className="text-gray-500 hover:underline text-xs"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
