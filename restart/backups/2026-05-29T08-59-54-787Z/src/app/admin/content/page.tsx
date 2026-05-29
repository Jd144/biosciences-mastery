import { createClient } from '@/lib/supabase/server'
import AdminContentForm from './AdminContentForm'

interface Props {
  searchParams: Promise<{ topicId?: string }>
}

export default async function AdminContentPage({ searchParams }: Props) {
  const { topicId } = await searchParams
  const supabase = await createClient()

  if (!topicId) {
    const { data: topics } = await supabase
      .from('topics')
      .select('id, title, subjects(name)')
      .order('subject_id')
      .order('order_index')
      .limit(100)

    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Content Manager</h1>
        <p className="text-gray-500 mb-4">Select a topic to manage its content:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topics?.map((t) => (
            <a
              key={t.id}
              href={`/admin/content?topicId=${t.id}`}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:border-emerald-200 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-gray-800 text-sm mb-1">{t.title}</p>
              <p className="text-xs text-gray-400">{(t.subjects as unknown as unknown as { name: string } | null)?.name}</p>
            </a>
          ))}
        </div>
      </div>
    )
  }

  const { data: topic } = await supabase
    .from('topics')
    .select('*, subjects(name, slug)')
    .eq('id', topicId)
    .single()

  const [contentRes, tablesRes, diagramsRes] = await Promise.all([
    supabase.from('topic_content').select('*').eq('topic_id', topicId),
    supabase.from('topic_tables').select('*').eq('topic_id', topicId),
    supabase.from('topic_diagrams').select('*').eq('topic_id', topicId),
  ])

  return (
    <AdminContentForm
      topic={topic}
      content={contentRes.data ?? []}
      tables={tablesRes.data ?? []}
      diagrams={diagramsRes.data ?? []}
    />
  )
}
