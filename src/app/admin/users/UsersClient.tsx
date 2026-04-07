'use client'
import { useState } from 'react'
import { User, Ban, CheckCircle } from 'lucide-react'

interface UserRecord {
  id: string
  email?: string
  phone?: string
  created_at: string
  last_sign_in_at?: string
  banned_until?: string
}

interface Props {
  initialUsers: UserRecord[]
}

export default function UsersClient({ initialUsers }: Props) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers)
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const handleBan = async (userId: string, action: 'ban' | 'unban') => {
    setLoading({ ...loading, [userId]: true })
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(users.map((u) => (u.id === userId ? { ...u, banned_until: data.user?.banned_until } : u)))
      }
    } finally {
      setLoading({ ...loading, [userId]: false })
    }
  }

  const isBanned = (u: UserRecord) =>
    !!u.banned_until && new Date(u.banned_until) > new Date()

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <User className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Users ({users.length})</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Email / Phone</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Created</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Last Sign In</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const banned = isBanned(u)
              return (
                <tr key={u.id} className={`${i !== 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
                  <td className="px-4 py-3 text-gray-800">{u.email ?? u.phone ?? u.id}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      banned ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleBan(u.id, banned ? 'unban' : 'ban')}
                      disabled={loading[u.id]}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 ${
                        banned
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {banned ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      {loading[u.id] ? '...' : banned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
