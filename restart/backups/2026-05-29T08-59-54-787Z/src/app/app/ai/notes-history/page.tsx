'use client'
import { useEffect, useState } from 'react'

export default function AiNotesHistoryPage() {
  const [notes, setNotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ai/notes/history')
      .then(r => r.json())
      .then(d => { setNotes(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My AI Notes History</h1>
      {loading ? <p>Loading...</p> : notes.length === 0 ? <p>No notes generated yet.</p> : (
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
