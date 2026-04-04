'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { BookOpen, Phone, Mail } from 'lucide-react'

type AuthMode = 'phone' | 'email'
type Step = 'input' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<AuthMode>('phone')
  const [step, setStep] = useState<Step>('input')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSendOTP = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'phone') {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone })
        if (error) throw error
        setMessage(`OTP sent to ${formattedPhone}`)
        setStep('otp')
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/app/dashboard` },
        })
        if (error) throw error
        setMessage(`Check your email ${email} for the login link`)
        setStep('otp')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'phone') {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
        const { error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp,
          type: 'sms',
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email',
        })
        if (error) throw error
      }
      router.push('/app/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-emerald-100 w-16 h-16 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BioSciences Mastery</h1>
          <p className="text-gray-500 text-sm mt-1">GAT-B Preparation Platform</p>
        </div>

        {step === 'input' && (
          <>
            {/* Mode Toggle */}
            <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
              <button
                onClick={() => { setMode('phone'); setError('') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'phone' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Phone className="w-4 h-4" /> Phone OTP
              </button>
              <button
                onClick={() => { setMode('email'); setError('') }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'email' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Mail className="w-4 h-4" /> Email OTP
              </button>
            </div>

            {mode === 'phone' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    maxLength={10}
                    className="flex-1 border border-gray-300 rounded-r-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <Button
              onClick={handleSendOTP}
              loading={loading}
              disabled={mode === 'phone' ? phone.length < 10 : !email.includes('@')}
              className="w-full"
            >
              Send OTP
            </Button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6 text-sm text-emerald-700">
              {message}
            </div>

            {mode === 'email' && (
              <p className="text-sm text-gray-500 mb-4">
                Also check your spam folder. Enter the 6-digit code from the email.
              </p>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <Button
              onClick={handleVerifyOTP}
              loading={loading}
              disabled={otp.length < 6}
              className="w-full mb-3"
            >
              Verify & Login
            </Button>
            <button
              onClick={() => { setStep('input'); setOtp(''); setError('') }}
              className="w-full text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
