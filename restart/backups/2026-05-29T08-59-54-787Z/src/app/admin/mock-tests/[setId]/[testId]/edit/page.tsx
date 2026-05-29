import { getServiceClient } from '@/lib/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import AdminQuestionEditor from './AdminQuestionEditor'

interface Props {
  params: Promise<{ setId: string; testId: string }>
}

export default async function AdminTestEditPage({ params }: Props) {
  const { setId, testId } = await params
  const svc = getServiceClient()

  const [testRes, questionsRes] = await Promise.all([
    svc
      .from('mock_tests')
      .select('*, mock_test_sets(set_no, title)')
      .eq('id', testId)
      .single(),
    svc
      .from('mock_test_questions')
      .select('*')
      .eq('test_id', testId)
      .order('question_no'),
  ])

  if (testRes.error || !testRes.data) notFound()

  const setData = testRes.data.mock_test_sets as { set_no: number; title: string } | null

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 flex-wrap">
        <Link href="/admin/mock-tests" className="hover:text-emerald-600">Mock Tests</Link>
        <span>›</span>
        <Link href={`/admin/mock-tests/${setId}`} className="hover:text-emerald-600">
          Set {setData?.set_no}: {setData?.title}
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Test {testRes.data.test_no}: {testRes.data.title}</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Test {testRes.data.test_no}: {testRes.data.title}
          </h1>
          <p className="text-gray-500 text-sm">
            {testRes.data.duration_minutes} min · {testRes.data.total_marks} marks · {questionsRes.data?.length ?? 0}/65 questions
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-700">
        <strong>GATE BT Pattern:</strong> Add 10 GA questions (5×1M + 5×2M) then 55 BT questions (25×1M + 30×2M).
        Total: 65 questions, 100 marks.
      </div>

      <AdminQuestionEditor
        testId={testId}
        setId={setId}
        initialQuestions={questionsRes.data ?? []}
      />
    </div>
  )
}
