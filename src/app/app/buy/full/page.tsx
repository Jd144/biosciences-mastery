'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function BuyFullPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasFull, setHasFull] = useState(false)
  const [checkingOwnership, setCheckingOwnership] = useState(true)

  useEffect(() => {
    fetch('/api/entitlements')
      .then((r) => r.json())
      .then((data) => {
        if (data.hasFull) setHasFull(true)
      })
      .finally(() => setCheckingOwnership(false))
  }, [])

  const handleBuy = async () => {
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
        body: JSON.stringify({ planType: 'FULL' }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        name: 'BioSciences Mastery',
        description: 'Full Course — Lifetime Access',
        order_id: data.orderId,
        handler: () => {
          router.push('/app/dashboard?payment=success')
        },
        theme: { color: '#059669' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      })
      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setLoading(false)
    }
  }

  if (checkingOwnership) {
    return <div className="text-center py-16 text-gray-400">Loading...</div>
  }

  if (hasFull) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You already own the Full Course!</h2>
        <p className="text-gray-500">Your full course entitlement covers all subjects.</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Full Course</h1>
        <div className="text-4xl font-extrabold text-emerald-600 mb-1">₹999</div>
        <p className="text-gray-500 text-sm mb-6">all 10 subjects • lifetime access</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">What&apos;s included (all subjects)</p>
          <ul className="space-y-2">
            {[
              'All 10 GAT-B subjects',
              'Complete notes (short + detailed)',
              'Flowcharts, tables & diagrams',
              'Official PYQ bank',
              '10 quizzes × 30 questions per subject',
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

        <Button
          onClick={handleBuy}
          loading={loading}
          disabled={loading}
          className="w-full text-lg py-4"
        >
          Pay ₹999 — Unlock Everything
        </Button>

        <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-xs">
          <Shield className="w-4 h-4" />
          Secured by Razorpay • 100% safe payment
        </div>
      </div>
    </div>
  )
}
