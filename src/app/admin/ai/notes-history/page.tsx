'use client'
import { useEffect, useState } from 'react'

export default function AdminAiNotesHistoryPage() {
  const [users, setUsers] = useState<any[]>([])
  const [selected, setSelected] = useState('')
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
  }, [])

  async function fetchNotes(userId: string) {
    setLoading(true)
    setNotes([])
    setSelected(userId)
    const res = await fetch('/api/admin/ai/notes-history?userId=' + encodeURIComponent(userId))
    const d = await res.json()
    setNotes(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User AI Notes History (Admin)</h1>
      <div className="mb-6 flex gap-4 items-center">
        <select className="border rounded px-3 py-2 min-w-[220px]" value={selected} onChange={e => fetchNotes(e.target.value)}>
          <option value="">Select user...</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.email || u.phone || u.id}</option>
          ))}
        </select>
      </div>
      {loading ? <p>Loading...</p> : notes.length === 0 && selected ? <p>No notes found for this user.</p> : (
        <div className="space-y-6">
          {notes.map((n, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 shadow-sm">
              <div className="mb-2 text-xs text-gray-500">
                {n.topics?.title ? <b>{n.topics.title}</b> : n.topic_id} | {n.language} | {n.updated_at ? new Date(n.updated_at).toLocaleString() : ''}
              </div>
              <div className="prose prose-sm max-w-none" style={{ whiteSpace: 'pre-wrap' }}>{n.content_md}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
