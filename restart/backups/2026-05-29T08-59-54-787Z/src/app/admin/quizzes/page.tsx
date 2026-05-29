import { createClient } from '@/lib/supabase/server'

interface Props {
  searchParams: Promise<{ topicId?: string }>
}

export default async function AdminQuizzesPage({ searchParams }: Props) {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Quiz Manager</h1>
        <p className="text-gray-500 mb-4">Select a topic:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {topics?.map((t) => (
            <a
              key={t.id}
              href={`/admin/quizzes?topicId=${t.id}`}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:border-purple-200 hover:shadow-sm transition-all"
            >
              <p className="font-medium text-gray-800 text-sm mb-1">{t.title}</p>
              <p className="text-xs text-gray-400">{(t.subjects as unknown as { name: string } | null)?.name}</p>
            </a>
          ))}
        </div>
      </div>
    )
  }

  const [topicRes, quizzesRes] = await Promise.all([
    supabase.from('topics').select('*, subjects(name)').eq('id', topicId).single(),
    supabase
      .from('quizzes')
      .select('*, quiz_questions(count)')
      .eq('topic_id', topicId)
      .order('quiz_no'),
  ])

  const topic = topicRes.data
  const quizzes = quizzesRes.data ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{topic?.title}</h1>
        <p className="text-gray-500 text-sm">Quizzes ({quizzes.length}/10)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((quizNo) => {
          const quiz = quizzes.find((q) => q.quiz_no === quizNo)
          const questionCount = (quiz?.quiz_questions as { count: number }[])?.[0]?.count ?? 0
          return (
            <div
              key={quizNo}
              className={`bg-white rounded-xl border p-4 ${quiz ? 'border-purple-200' : 'border-dashed border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-700">Quiz {quizNo}</span>
                {quiz && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {questionCount}/30 Q
                  </span>
                )}
              </div>
              {quiz ? (
                <a
                  href={`/admin/quizzes/${quiz.id}/edit`}
                  className="text-xs text-purple-600 hover:underline"
                >
                  Edit Questions →
                </a>
              ) : (
                <a
                  href={`/admin/quizzes/new?topicId=${topicId}&quizNo=${quizNo}`}
                  className="text-xs text-gray-400 hover:text-purple-600"
                >
                  Create Quiz {quizNo} →
                </a>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-700">
        <strong>Note:</strong> Each quiz should have exactly 30 questions. Click &quot;Create Quiz&quot; to add a new quiz,
        or &quot;Edit Questions&quot; to manage existing questions.
      </div>
    </div>
  )
}
