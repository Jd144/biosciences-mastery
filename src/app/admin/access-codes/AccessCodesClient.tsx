'use client'

import { useState } from 'react'
import { KeyRound, Plus, Trash2, Copy, CheckCircle, Clock } from 'lucide-react'
import Button from '@/components/ui/Button'

interface AccessCode {
  id: string
  code: string
  assigned_email: string
  used_at: string | null
  created_at: string
  used_by_user_id: string | null
}

interface Props {
  initialCodes: AccessCode[]
}

export default function AccessCodesClient({ initialCodes }: Props) {
  const [codes, setCodes] = useState<AccessCode[]>(initialCodes)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/admin/access-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedEmail: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCodes([data.code, ...codes])
      setEmail('')
      setSuccess(`Code generated for ${data.code.assigned_email}: ${data.code.code}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate code')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this access code? Note: users who already verified will retain their access.')) return
    try {
      const res = await fetch(`/api/admin/access-codes?id=${id}`, { method: 'DELETE' })
      if (res.ok) setCodes(codes.filter((c) => c.id !== id))
    } catch {
      // ignore
    }
  }

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <KeyRound className="w-6 h-6 text-emerald-600" />
        <h1 className="text-2xl font-bold text-gray-900">Access Codes</h1>
      </div>

      {/* Generate form */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4">Generate New Code</h2>
        <div className="flex gap-3 flex-wrap">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="student@example.com"
            className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button onClick={handleGenerate} loading={loading} disabled={!email.trim()}>
            <Plus className="w-4 h-4 mr-1.5" />
            Generate Code
          </Button>
        </div>
        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3 text-sm text-emerald-700 font-mono">
            ✅ {success}
          </div>
        )}
      </div>

      {/* Codes list */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700">All Codes ({codes.length})</p>
        </div>
        {codes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <KeyRound className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No access codes yet. Generate one above.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Code</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Assigned Email</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Created</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c, i) => (
                <tr key={c.id} className={`${i !== 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
                  <td className="px-4 py-3 font-mono text-gray-800 font-semibold">{c.code}</td>
                  <td className="px-4 py-3 text-gray-600">{c.assigned_email}</td>
                  <td className="px-4 py-3">
                    {c.used_at ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        <CheckCircle className="w-3 h-3" /> Used
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        <Clock className="w-3 h-3" /> Unused
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(c.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(c.code, c.id)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        {copiedId === c.id ? (
                          <><CheckCircle className="w-3.5 h-3.5" /> Copied</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
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
