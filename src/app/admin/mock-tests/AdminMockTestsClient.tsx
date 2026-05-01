'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, ClipboardList, Plus } from 'lucide-react'

interface MockTest {
  id: string
  test_no: number
  title: string
  is_active: boolean
  mock_test_questions: { count: number }[]
}

interface MockSet {
  id: string
  set_no: number
  title: string
  description: string | null
  is_active: boolean
  mock_tests: MockTest[]
}

interface Props {
  initialSets: MockSet[]
}

export default function AdminMockTestsClient({ initialSets }: Props) {
  const [sets, setSets] = useState<MockSet[]>(initialSets)
  const [creating, setCreating] = useState(false)
  const [newSetNo, setNewSetNo] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [msg, setMsg] = useState('')

  const handleCreateSet = async () => {
    if (!newSetNo || !newTitle) return
    setCreating(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/mock-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ set_no: parseInt(newSetNo), title: newTitle, description: newDesc }),
      })
      const data = await res.json()
      if (res.ok) {
        setSets((prev) => [...prev.filter((s) => s.set_no !== data.set_no), { ...data, mock_tests: [] }].sort((a, b) => a.set_no - b.set_no))
        setNewSetNo('')
        setNewTitle('')
        setNewDesc('')
        setMsg('Set created!')
      } else {
        setMsg(data.error ?? 'Failed')
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      {/* Create new set form */}
      <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3 text-sm">Create / Update Set</h2>
        <div className="flex flex-wrap gap-3">
          <input
            type="number"
            min={1}
            max={5}
            value={newSetNo}
            onChange={(e) => setNewSetNo(e.target.value)}
            placeholder="Set No (1-5)"
            className="border rounded-lg px-3 py-2 text-sm w-32"
          />
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Set Title"
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
          />
          <button
            onClick={handleCreateSet}
            disabled={creating || !newSetNo || !newTitle}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {creating ? 'Saving...' : 'Save Set'}
          </button>
        </div>
        {msg && <p className="text-sm mt-2 text-emerald-600">{msg}</p>}
      </div>

      {/* Sets list */}
      {sets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No sets yet. Create Set 1 above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sets.map((set) => {
            const tests = Array.isArray(set.mock_tests)
              ? set.mock_tests.sort((a, b) => a.test_no - b.test_no)
              : []
            return (
              <div key={set.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      Set {set.set_no}
                    </span>
                    <span className="font-bold text-gray-800">{set.title}</span>
                    {set.description && (
                      <span className="text-xs text-gray-500">{set.description}</span>
                    )}
                  </div>
                  <Link
                    href={`/admin/mock-tests/${set.id}`}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                  >
                    Manage Tests <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((testNo) => {
                    const test = tests.find((t) => t.test_no === testNo)
                    const qCount = (test?.mock_test_questions as { count: number }[])?.[0]?.count ?? 0
                    return (
                      <div
                        key={testNo}
                        className={`rounded-xl border p-3 ${test ? 'border-emerald-200' : 'border-dashed border-gray-200'}`}
                      >
                        <p className="font-semibold text-gray-700 text-xs mb-1">Test {testNo}</p>
                        {test ? (
                          <>
                            <p className="text-xs text-gray-600 truncate mb-1">{test.title}</p>
                            <p className="text-xs text-emerald-600">{qCount}/65 Q</p>
                            <Link
                              href={`/admin/mock-tests/${set.id}/${test.id}/edit`}
                              className="text-xs text-purple-600 hover:underline"
                            >
                              Edit →
                            </Link>
                          </>
                        ) : (
                          <Link
                            href={`/admin/mock-tests/${set.id}?createTest=${testNo}`}
                            className="text-xs text-gray-400 hover:text-emerald-600 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Create
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
