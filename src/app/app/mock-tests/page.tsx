import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, Clock, Target, CheckCircle, Lock } from 'lucide-react'

interface MockTest {
  id: string
  test_no: number
  title: string
  description: string | null
  duration_minutes: number
  total_marks: number
  is_active: boolean
}

interface MockSet {
  id: string
  set_no: number
  title: string
  description: string | null
  mock_tests: MockTest[]
}

export default async function MockTestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [setsRes, attemptsRes] = await Promise.all([
    supabase
      .from('mock_test_sets')
      .select(`
        id, set_no, title, description,
        mock_tests (id, test_no, title, description, duration_minutes, total_marks, is_active)
      `)
      .eq('is_active', true)
      .order('set_no'),
    supabase
      .from('mock_test_attempts')
      .select('test_id, score, max_score, submitted_at')
      .eq('user_id', user.id)
      .not('submitted_at', 'is', null),
  ])

  const sets: MockSet[] = (setsRes.data ?? []).map((s) => ({
    ...s,
    mock_tests: Array.isArray(s.mock_tests)
      ? (s.mock_tests as MockTest[]).sort((a, b) => a.test_no - b.test_no)
      : [],
  }))

  const completedTests = new Map(
    (attemptsRes.data ?? []).map((a) => [a.test_id, { score: a.score, maxScore: a.max_score }])
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="w-7 h-7 text-emerald-600" />
          <h1 className="text-2xl font-bold text-gray-900">Mock Tests</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Full-length GATE BT mock tests in exam pattern. 65 questions · 100 marks · 3 hours · Negative marking
        </p>
      </div>

      {/* Exam pattern info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Questions', value: '65', icon: <ClipboardList className="w-5 h-5 text-emerald-600" /> },
          { label: 'Total Marks', value: '100', icon: <Target className="w-5 h-5 text-blue-600" /> },
          { label: 'Duration', value: '3 Hours', icon: <Clock className="w-5 h-5 text-purple-600" /> },
          { label: 'Neg. Marking', value: '-1/3 · -2/3', icon: <Lock className="w-5 h-5 text-red-500" /> },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            {item.icon}
            <div>
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="font-bold text-gray-900 text-sm">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {sets.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No mock tests available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sets.map((set) => (
            <div key={set.id}>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  Set {set.set_no}
                </span>
                <h2 className="text-lg font-bold text-gray-900">{set.title}</h2>
              </div>
              {set.description && (
                <p className="text-sm text-gray-500 mb-4">{set.description}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {set.mock_tests.map((test) => {
                  const completed = completedTests.get(test.id)
                  const pct = completed
                    ? Math.round((completed.score / (completed.maxScore || 100)) * 100)
                    : null
                  return (
                    <div
                      key={test.id}
                      className="bg-white border border-gray-100 rounded-xl p-5 hover:border-emerald-200 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="text-xs text-emerald-600 font-semibold mb-1">
                            Test {test.test_no}
                          </p>
                          <h3 className="font-bold text-gray-800 text-sm">{test.title}</h3>
                        </div>
                        {completed && (
                          <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Done
                          </span>
                        )}
                      </div>

                      {test.description && (
                        <p className="text-xs text-gray-500 mb-3">{test.description}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {test.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          {test.total_marks} marks
                        </span>
                      </div>

                      {completed && pct !== null && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Score</span>
                            <span className={`font-semibold ${pct >= 50 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {completed.score}/{completed.maxScore} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${pct >= 50 ? 'bg-emerald-500' : 'bg-red-400'}`}
                              style={{ width: `${Math.max(0, pct)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <Link
                        href={`/app/mock-tests/${set.id}/${test.id}`}
                        className={`block text-center text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                          completed
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {completed ? 'Review / Retake' : 'Start Test →'}
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
