'use client'
import { useEffect, useState } from 'react'

export default function AdminAiChatHistoryPage() {
  const [users, setUsers] = useState<any[]>([])
  const [selected, setSelected] = useState('')
  const [chats, setChats] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState<number|null>(null)

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(d => setUsers(Array.isArray(d) ? d : []))
  }, [])

  async function fetchChats(userId: string) {
    setLoading(true)
    setChats([])
    setSelected(userId)
    const res = await fetch('/api/admin/ai/chat-history?userId=' + encodeURIComponent(userId))
    const d = await res.json()
    setChats(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User AI Chat History (Admin)</h1>
      <div className="mb-6 flex gap-4 items-center">
        <select className="border rounded px-3 py-2 min-w-[220px]" value={selected} onChange={e => fetchChats(e.target.value)}>
          <option value="">Select user...</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.email || u.phone || u.id}</option>
          ))}
        </select>
      </div>
      {loading ? <p>Loading...</p> : chats.length === 0 && selected ? <p>No chat history found for this user.</p> : (
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
                        <b>{m.role === 'assistant' ? 'AI' : 'User'}:</b> {m.content}
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
