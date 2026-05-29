'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

interface MockTest {
  id: string
  test_no: number
  title: string
  description: string | null
  duration_minutes: number
  total_marks: number
  is_active: boolean
  mock_test_questions: { count: number }[]
}

interface Props {
  set: { id: string; set_no: number; title: string }
  initialTests: MockTest[]
  defaultCreateTest?: number
}

export default function AdminSetClient({ set, initialTests, defaultCreateTest }: Props) {
  const [tests, setTests] = useState<MockTest[]>(initialTests)
  const [creating, setCreating] = useState(false)
  const [newTestNo, setNewTestNo] = useState(defaultCreateTest?.toString() ?? '')
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [msg, setMsg] = useState('')

  const handleCreate = async () => {
    if (!newTestNo || !newTitle) return
    setCreating(true)
    setMsg('')
    try {
      const res = await fetch(`/api/admin/mock-tests/${set.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_no: parseInt(newTestNo),
          title: newTitle,
          description: newDesc,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setTests((prev) =>
          [...prev.filter((t) => t.test_no !== data.test_no), { ...data, mock_test_questions: [] }].sort(
            (a, b) => a.test_no - b.test_no
          )
        )
        setNewTestNo('')
        setNewTitle('')
        setNewDesc('')
        setMsg('Test created!')
      } else {
        setMsg(data.error ?? 'Failed')
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      {/* Create test */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3 text-sm">Create / Update Test</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="number"
            min={1}
            max={5}
            value={newTestNo}
            onChange={(e) => setNewTestNo(e.target.value)}
            placeholder="Test No (1-5)"
            className="border rounded-lg px-3 py-2 text-sm w-32"
          />
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Test Title"
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newTestNo || !newTitle}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {creating ? 'Saving...' : 'Save Test'}
          </button>
        </div>
        {msg && <p className="text-sm mt-2 text-emerald-600">{msg}</p>}
      </div>

      {/* Tests grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 5 }, (_, i) => i + 1).map((testNo) => {
          const test = tests.find((t) => t.test_no === testNo)
          const qCount = (test?.mock_test_questions as { count: number }[])?.[0]?.count ?? 0
          return (
            <div
              key={testNo}
              className={`bg-white rounded-xl border p-5 ${test ? 'border-purple-200' : 'border-dashed border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-700">Test {testNo}</span>
                {test && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {qCount}/65 Q
                  </span>
                )}
              </div>
              {test ? (
                <>
                  <p className="text-sm text-gray-600 mb-1">{test.title}</p>
                  {test.description && <p className="text-xs text-gray-400 mb-2">{test.description}</p>}
                  <p className="text-xs text-gray-500 mb-3">
                    {test.duration_minutes} min · {test.total_marks} marks
                  </p>
                  <Link
                    href={`/admin/mock-tests/${set.id}/${test.id}/edit`}
                    className="text-xs text-purple-600 hover:underline"
                  >
                    Edit Questions →
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => setNewTestNo(testNo.toString())}
                  className="text-xs text-gray-400 hover:text-emerald-600 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Test {testNo}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
