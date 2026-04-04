'use client'

import { useState } from 'react'
import { CheckCircle, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function BuyFullPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBuy = async () => {
    setLoading(true)
    setError('')
    try {
      // Load Razorpay script
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay'))
          document.body.appendChild(script)
        })
      }

      // Create order
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: 'FULL' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Open Razorpay checkout
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
        prefill: {},
        theme: { color: '#059669' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      })
      rzp.open()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-white mb-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold mb-2">Full Course</h1>
          <div className="text-6xl font-extrabold mb-2">₹999</div>
          <p className="text-emerald-200">One-time payment • Lifetime access</p>
        </div>

        <ul className="space-y-3 mb-8">
          {[
            'All 10 GAT-B subjects unlocked',
            'Comprehensive notes (short + detailed)',
            'Flowcharts, tables & diagrams',
            'Official PYQ bank (last 10 years)',
            '10 quizzes × 30 questions per topic',
            'AI Doubt Solver for all topics',
            'AI Notes Generator',
            'Lifetime access — no renewal',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm">
              <CheckCircle className="w-5 h-5 text-yellow-300 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {error && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4 text-red-800 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleBuy}
          loading={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-lg py-4"
        >
          Pay ₹999 — Unlock Everything
        </Button>

        <div className="flex items-center justify-center gap-2 mt-4 text-emerald-200 text-xs">
          <Shield className="w-4 h-4" />
          Secured by Razorpay • 100% safe payment
        </div>
      </div>
    </div>
  )
}
