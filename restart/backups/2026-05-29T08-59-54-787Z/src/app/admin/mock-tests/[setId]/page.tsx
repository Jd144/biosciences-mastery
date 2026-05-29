import { getServiceClient } from '@/lib/admin'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AdminSetClient from './AdminSetClient'

interface Props {
  params: Promise<{ setId: string }>
  searchParams: Promise<{ createTest?: string }>
}

export default async function AdminMockSetPage({ params, searchParams }: Props) {
  const { setId } = await params
  const { createTest } = await searchParams
  const svc = getServiceClient()

  const [setRes, testsRes] = await Promise.all([
    svc.from('mock_test_sets').select('*').eq('id', setId).single(),
    svc.from('mock_tests')
      .select('*, mock_test_questions(count)')
      .eq('set_id', setId)
      .order('test_no'),
  ])

  if (setRes.error || !setRes.data) notFound()

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/admin/mock-tests" className="hover:text-emerald-600">Mock Tests</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Set {setRes.data.set_no}: {setRes.data.title}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Set {setRes.data.set_no}: {setRes.data.title}
      </h1>

      <AdminSetClient
        set={setRes.data}
        initialTests={testsRes.data ?? []}
        defaultCreateTest={createTest ? parseInt(createTest) : undefined}
      />
    </div>
  )
}
