'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

export default function BuyFullPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBuy = async () => {
    setLoading(true)
    setError('')
    try {
      // Razorpay script loader
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay'))
          document.body.appendChild(script)
        })
      }

      // Backend order create (IMPORTANT: credentials: 'include')
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: 'FULL' }),
        credentials: 'include', // <-- Yeh zaroor hona chahiye!
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Razorpay checkout config
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // <--- yeh .env me sahi hona chahiye!
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* ... UI as needed ... */}
      {error && (
        <div className="bg-red-100 border border-red-300 px-4 py-2 rounded mb-3 text-red-700">
          {error}
        </div>
      )}
      <button
        className="w-full py-3 rounded-lg font-bold text-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition mb-2"
        onClick={handleBuy}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay ₹999 — Unlock Everything'}
      </button>
    </div>
  )
}
