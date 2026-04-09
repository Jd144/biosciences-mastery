'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Subject {
  id: string
  name: string
  slug: string
  order_index: number
  price_inr?: number
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/subjects')
      .then(r => r.json())
      .then(d => { setSubjects(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subjects</h1>
        <Link href="/admin/subjects/new" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700">
          + Add Subject
        </Link>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : subjects.length === 0 ? (
        <p className="text-gray-500">No subjects yet!</p>
      ) : (
        <table className="w-full border-collapse bg-white rounded-xl border">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4">#</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Slug</th>
              <th className="text-left p-4">Price (INR)</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s, i) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-400">{i + 1}</td>
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4 text-gray-400 font-mono text-sm">{s.slug}</td>
                <td className="p-4">₹{s.price_inr?.toFixed(2) ?? '0.00'}</td>
                <td className="p-4 flex gap-2">
                  <Link href={`/admin/subjects/${s.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                  <button
                    className="text-red-600 hover:underline ml-2"
                    onClick={async () => {
                      if (!confirm('Delete this subject? This cannot be undone.')) return;
                      await fetch(`/api/admin/subjects/${s.id}`, { method: 'DELETE' });
                      setSubjects(subjects.filter(sub => sub.id !== s.id));
                    }}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}