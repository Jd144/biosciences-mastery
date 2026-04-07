'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, BookOpen, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function VerifyCodePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleVerify = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/access-codes/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Invalid code')
      setSuccess(true)
      setTimeout(() => {
        router.replace('/app/dashboard')
        router.refresh()
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Granted!</h2>
          <p className="text-gray-500 text-sm">Redirecting to your dashboard&hellip;</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-emerald-100 w-16 h-16 rounded-2xl mb-4">
            <KeyRound className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Enter Access Code</h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter the access code provided by your instructor to unlock full platform access.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Access Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && code.trim() && handleVerify()}
            placeholder="XXXX-XXXX-XXXX"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-lg text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button
          onClick={handleVerify}
          loading={loading}
          disabled={!code.trim() || loading}
          className="w-full"
        >
          <KeyRound className="w-4 h-4 mr-2" />
          Verify &amp; Unlock Access
        </Button>

        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs">
          <BookOpen className="w-4 h-4" />
          BioSciences Mastery &mdash; GAT-B Preparation
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
