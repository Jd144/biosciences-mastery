import { createClient } from '@/lib/supabase/server'
import AdminPYQsForm from './AdminPYQsForm'

interface Props {
  searchParams: Promise<{ topicId?: string }>
}

export default async function AdminPYQsPage({ searchParams }: Props) {
  const { topicId } = await searchParams
  const supabase = await createClient()

  if (!topicId) {
    const { data: topics } = await supabase
      .from('topics')
      .select('id, title, subjects(name)')
      .order('order_index')
      .limit(100)

    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">PYQ Manager</h1>
        <p className="text-gray-500 mb-4">Select a topic:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topics?.map((t) => (
            <a
              key={t.id}
              href={`/admin/pyqs?topicId=${t.id}`}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:border-orange-200 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-gray-800 text-sm mb-1">{t.title}</p>
              <p className="text-xs text-gray-400">{(t.subjects as unknown as { name: string } | null)?.name}</p>
            </a>
          ))}
        </div>
      </div>
    )
  }

  const [topicRes, pyqsRes] = await Promise.all([
    supabase.from('topics').select('*, subjects(name)').eq('id', topicId).single(),
    supabase.from('pyqs').select('*').eq('topic_id', topicId).order('year', { ascending: false }),
  ])

  return <AdminPYQsForm topic={topicRes.data} pyqs={pyqsRes.data ?? []} />
}
