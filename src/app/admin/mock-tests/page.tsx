import { getServiceClient } from '@/lib/admin'
import { ClipboardList } from 'lucide-react'
import AdminMockTestsClient from './AdminMockTestsClient'

export default async function AdminMockTestsPage() {
  const svc = getServiceClient()
  const { data: sets } = await svc
    .from('mock_test_sets')
    .select('*, mock_tests(id, test_no, title, is_active, mock_test_questions(count))')
    .order('set_no')

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">Mock Tests</h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
        <strong>Exam Pattern:</strong> 5 Sets × 5 Tests. Each test: 65 questions (10 GA + 55 BT), 100 marks, 3 hours.
        Negative marking: -1/3 for 1-mark questions, -2/3 for 2-mark questions.
      </div>

      <AdminMockTestsClient initialSets={sets ?? []} />
    </div>
  )
}
