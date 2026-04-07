'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, CheckCircle, Tag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { PRICES } from '@/lib/utils'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

export default function BuySubjectPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subjectSlug = searchParams.get('subject') ?? ''

  const [subjectName, setSubjectName] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [discountPaise, setDiscountPaise] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const originalAmount = PRICES.SINGLE_SUBJECT
  const finalAmount = Math.max(originalAmount - discountPaise, 100)

  useEffect(() => {
    if (!subjectSlug) return
    fetch(`/api/admin/subjects`)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.subjects ?? []).find((s: { slug: string; name: string }) => s.slug === subjectSlug)
        setSubjectName(found?.name ?? subjectSlug)
      })
      .catch(() => setSubjectName(subjectSlug))
  }, [subjectSlug])

  if (!subjectSlug) {
    router.replace('/app/subjects')
    return null
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setValidatingCoupon(true)
    setCouponError('')
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), amountPaise: originalAmount }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCouponError(data.error ?? 'Invalid coupon')
        setCouponApplied(false)
        setDiscountPaise(0)
      } else {
        setDiscountPaise(data.discountPaise)
        setCouponApplied(true)
        setCouponError('')
      }
    } catch {
      setCouponError('Failed to validate coupon')
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode('')
    setCouponApplied(false)
    setDiscountPaise(0)
    setCouponError('')
  }

  const handlePay = async () => {
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
        body: JSON.stringify({
          planType: 'SINGLE_SUBJECT',
          subjectSlug,
          couponCode: couponApplied ? couponCode.trim() : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create order')

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'BioSciences Mastery',
        description: `${subjectName ?? subjectSlug} — Single Subject`,
        theme: { color: '#059669' },
        handler: () => {
          router.replace(`/app/subjects/${subjectSlug}?payment=success`)
        },
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
      <Link href="/app/subjects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-100 w-16 h-16 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{subjectName ?? subjectSlug}</h1>
          <p className="text-gray-500 text-sm mt-1">Single subject — lifetime access</p>
        </div>

        <ul className="space-y-2 mb-6">
          {[
            'Complete notes (short + detailed)',
            'Unlimited quizzes (50 questions/topic)',
            'Previous Year Questions (PYQs)',
            'AI Doubt Solver (5/day for this subject)',
            'Flowcharts, Tables, Diagrams',
            'Lifetime access',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-xs text-amber-700">
          💡 <strong>Pro tip:</strong> Buying the Full Course (₹999) gives you all 10 subjects — better value than individual subjects.{' '}
          <Link href="/app/buy/full" className="underline font-medium">Upgrade →</Link>
        </div>

        {/* Coupon */}
        {!couponApplied ? (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Coupon code"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={handleApplyCoupon}
              loading={validatingCoupon}
              disabled={!couponCode.trim() || validatingCoupon}
              variant="secondary"
              size="sm"
            >
              <Tag className="w-4 h-4 mr-1" /> Apply
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-4 text-sm">
            <span className="text-emerald-700 font-medium">
              Coupon &ldquo;{couponCode}&rdquo; applied — saved ₹{(discountPaise / 100).toFixed(0)}
            </span>
            <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-gray-600 text-xs ml-2">Remove</button>
          </div>
        )}
        {couponError && <p className="text-red-600 text-xs mb-3">{couponError}</p>}

        {/* Pricing */}
        <div className="border-t border-gray-100 pt-4 mb-6 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Single Subject</span>
            <span>₹{(originalAmount / 100).toFixed(0)}</span>
          </div>
          {discountPaise > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Coupon Discount</span>
              <span>−₹{(discountPaise / 100).toFixed(0)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
            <span>Total</span>
            <span>₹{(finalAmount / 100).toFixed(0)}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <Button onClick={handlePay} loading={loading} disabled={loading} className="w-full">
          <BookOpen className="w-4 h-4 mr-2" />
          Pay ₹{(finalAmount / 100).toFixed(0)} — Unlock Subject
        </Button>

        <p className="text-center text-xs text-gray-400 mt-4">Secured by Razorpay · Lifetime Access</p>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
