'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Subject {
  id: string
  name: string
  slug: string
}

interface Topic {
  id: string
  title: string
  slug: string
  subject_id: string
  order_index: number
  subjects?: { name: string }
}

export default function AdminTopicsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/subjects')
      .then(r => r.json())
      .then(d => setSubjects(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = selectedSubject
      ? `/api/admin/topics?subjectId=${selectedSubject}`
      : '/api/admin/topics'
    fetch(url)
      .then(r => r.json())
      .then(d => { setTopics(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedSubject])

  const deleteTopic = async (id: string) => {
    if (!confirm('Delete this topic?')) return
    await fetch(`/api/admin/topics/${id}`, { method: 'DELETE' })
    setTopics(topics.filter(t => t.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Topics</h1>
        <Link
          href="/admin/topics/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add Topic
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedSubject('')}
          className={`text-sm px-3 py-1.5 rounded-lg font-medium ${!selectedSubject ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All
        </button>
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSubject(s.id)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium ${selectedSubject === s.id ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Slug</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t, i) => (
                <tr key={t.id} className={`${i !== 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
                  <td className="px-4 py-3 text-gray-400">{t.order_index}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{t.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{t.subjects?.name}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{t.slug}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <Link href={`/admin/content?topicId=${t.id}`} className="text-blue-600 hover:underline text-xs font-medium">Content</Link>
                    <Link href={`/admin/pyqs?topicId=${t.id}`} className="text-orange-600 hover:underline text-xs font-medium">PYQs</Link>
                    <Link href={`/admin/quizzes?topicId=${t.id}`} className="text-purple-600 hover:underline text-xs font-medium">Quizzes</Link>
                    <button onClick={() => deleteTopic(t.id)} className="text-red-600 hover:underline text-xs font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
