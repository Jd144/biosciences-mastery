'use client'
import { useEffect, useState } from 'react'

export default function AiChatHistoryPage() {
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<number|null>(null)

  useEffect(() => {
    fetch('/api/ai/chat/history')
      .then(r => r.json())
      .then(d => { setChats(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My AI Chat History</h1>
      {loading ? <p>Loading...</p> : chats.length === 0 ? <p>No chat history yet.</p> : (
        <div className="space-y-6">
          {chats.map((c, i) => {
            let messages = []
            try { messages = JSON.parse(c.messages) } catch {}
            return (
              <div key={c.id} className="bg-white rounded-xl border p-6 shadow-sm">
                <div className="mb-2 text-xs text-gray-500">
                  {c.topics?.title ? <b>{c.topics.title}</b> : c.topic_id || 'General'} | {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                  <button className="ml-4 text-blue-600 underline text-xs" onClick={() => setOpen(open === i ? null : i)}>{open === i ? 'Hide' : 'Show'} Chat</button>
                </div>
                {open === i && (
                  <div className="mt-2 space-y-2">
                    {messages.map((m: any, j: number) => (
                      <div key={j} className={m.role === 'assistant' ? 'bg-emerald-50 p-2 rounded' : 'bg-gray-50 p-2 rounded'}>
                        <b>{m.role === 'assistant' ? 'AI' : 'You'}:</b> {m.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
