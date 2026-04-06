'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'

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
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay'))
          document.body.appendChild(script)
        })
      }

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error('Payment gateway is not configured. Please contact support.')
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
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          // Verify payment signature before redirecting
          const verifyRes = await fetch('/api/payments/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
            credentials: 'include',
          })
          if (verifyRes.ok) {
            router.push('/app/dashboard?payment=success')
          } else {
            setError('Payment verification failed. Please contact support.')
            setLoading(false)
          }
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
