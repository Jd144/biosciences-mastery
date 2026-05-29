'use client'
import { useEffect, useState } from 'react'

export default function EntitlementsListPage() {
  const [entitlements, setEntitlements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/entitlements')
      .then(r => r.json())
      .then(d => { setEntitlements(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">User Entitlements</h1>
      {loading ? <p>Loading...</p> : (
        <table className="w-full border-collapse bg-white rounded-xl border">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Plan</th>
              <th className="text-left p-4">Subject</th>
              <th className="text-left p-4">Free?</th>
              <th className="text-left p-4">Activated</th>
            </tr>
          </thead>
          <tbody>
            {entitlements.map(e => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="p-4">{e.users?.email || e.user_id}</td>
                <td className="p-4">{e.type}</td>
                <td className="p-4">{e.subjects?.name || (e.type === 'FULL' ? '—' : e.subject_id)}</td>
                <td className="p-4">{e.is_free ? 'Yes' : 'No'}</td>
                <td className="p-4">{new Date(e.activated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
