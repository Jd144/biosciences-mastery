'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Shield, Lock } from 'lucide-react'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface Subject {
  id: string
  slug: string
  name: string
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

function BuySubjectContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const preselected = searchParams.get('subject')

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [ownedSubjectIds, setOwnedSubjectIds] = useState<Set<string>>(new Set())
  const [hasFull, setHasFull] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<string>(preselected ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const [subjectsRes, entitlementsRes] = await Promise.all([
        supabase.from('subjects').select('id, slug, name').eq('is_active', true).order('order_index'),
        fetch('/api/entitlements').then((r) => r.json()),
      ])
      setSubjects(subjectsRes.data ?? [])
      if (entitlementsRes.hasFull) {
        setHasFull(true)
      } else {
        setOwnedSubjectIds(new Set(entitlementsRes.subjectIds ?? []))
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedSubjectObj = subjects.find((s) => s.slug === selectedSubject)
  const isOwned = selectedSubjectObj ? ownedSubjectIds.has(selectedSubjectObj.id) : false

  const handleBuy = async () => {
    if (!selectedSubject) return
    setLoading(true)
    setError('')
    try {
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay'))
          document.body.appendChild(script)
        })
      }

      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: 'SINGLE_SUBJECT', subjectSlug: selectedSubject }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        name: 'BioSciences Mastery',
        description: `${selectedSubjectObj?.name} — Lifetime Access`,
        order_id: data.orderId,
        handler: () => {
          router.push('/app/dashboard?payment=success')
        },
        theme: { color: '#059669' },
        modal: { ondismiss: () => setLoading(false) },
      })
      rzp.open()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setLoading(false)
    }
  }

  if (hasFull) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You already own everything!</h2>
        <p className="text-gray-500">Your full course entitlement covers all subjects.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Buy a Subject</h1>
        <div className="text-4xl font-extrabold text-emerald-600 mb-1">₹449</div>
        <p className="text-gray-500 text-sm mb-6">per subject • lifetime access</p>

        {/* Subject Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">— Choose a subject —</option>
            {subjects.map((s) => (
              <option key={s.slug} value={s.slug} disabled={ownedSubjectIds.has(s.id)}>
                {s.name} {ownedSubjectIds.has(s.id) ? '(Already owned)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* What you get */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">What&apos;s included:</p>
          <ul className="space-y-2">
            {[
              'Complete notes (short + detailed)',
              'Flowcharts, tables & diagrams',
              'Official PYQ bank',
              '10 quizzes × 30 questions',
              'AI Doubt Solver',
              'AI Notes Generator',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {isOwned ? (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
            <Lock className="w-4 h-4 shrink-0" />
            You already own this subject
          </div>
        ) : (
          <Button
            onClick={handleBuy}
            loading={loading}
            disabled={!selectedSubject || isOwned}
            className="w-full text-lg py-4"
          >
            Pay ₹449 — Unlock {selectedSubjectObj?.name ?? 'Subject'}
          </Button>
        )}

        <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-xs">
          <Shield className="w-4 h-4" />
          Secured by Razorpay • 100% safe payment
        </div>
      </div>

      {/* Upgrade prompt */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
        <p className="text-sm text-emerald-700 mb-2">
          Want all 10 subjects? Save money with the Full Course!
        </p>
        <a
          href="/app/buy/full"
          className="text-emerald-600 font-bold text-sm hover:underline"
        >
          Get Full Course for ₹999 →
        </a>
      </div>
    </div>
  )
}

export default function BuySubjectPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-gray-400">Loading...</div>}>
      <BuySubjectContent />
    </Suspense>
  )
}
