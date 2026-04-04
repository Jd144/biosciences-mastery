'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { BookOpen, Phone, Mail, Lock } from 'lucide-react'

type MainMode = 'password' | 'otp'
type PasswordView = 'signin' | 'signup' | 'forgot'
type OtpMode = 'phone' | 'email'
type OtpStep = 'input' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  // Main mode: email+password (default) or OTP
  const [mainMode, setMainMode] = useState<MainMode>('password')

  // Password auth state
  const [passwordView, setPasswordView] = useState<PasswordView>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // OTP auth state
  const [otpMode, setOtpMode] = useState<OtpMode>('phone')
  const [otpStep, setOtpStep] = useState<OtpStep>('input')
  const [phone, setPhone] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [otp, setOtp] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const resetPasswordState = () => {
    setError('')
    setMessage('')
    setFullName('')
    setEmail('')
    setPassword('')
  }

  const resetOtpState = () => {
    setError('')
    setMessage('')
    setPhone('')
    setOtpEmail('')
    setOtp('')
    setOtpStep('input')
  }

  // ── Password auth handlers ──────────────────────────────────────────────────

  const handleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/app/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
      setMessage('Account created! Please check your email to confirm your address.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    setError('')
    setLoading(true)
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/reset`,
      })
      if (error) throw error
      setMessage('Password reset email sent! Check your inbox (and spam folder).')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  // ── OTP auth handlers ───────────────────────────────────────────────────────

  const handleSendOTP = async () => {
    setError('')
    setLoading(true)
    try {
      if (otpMode === 'phone') {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
        const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone })
        if (error) throw error
        setMessage(`OTP sent to ${formattedPhone}`)
        setOtpStep('otp')
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: otpEmail,
          options: { emailRedirectTo: `${window.location.origin}/app/dashboard` },
        })
        if (error) throw error
        setMessage(`Check your email ${otpEmail} for the login link`)
        setOtpStep('otp')
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
      if (otpMode === 'phone') {
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
        const { error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp,
          type: 'sms',
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.verifyOtp({
          email: otpEmail,
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

        {/* Main mode toggle */}
        <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
          <button
            onClick={() => { setMainMode('password'); resetPasswordState() }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              mainMode === 'password' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Lock className="w-4 h-4" /> Email &amp; Password
          </button>
          <button
            onClick={() => { setMainMode('otp'); resetOtpState() }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
              mainMode === 'otp' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Phone className="w-4 h-4" /> OTP Login
          </button>
        </div>

        {/* ── Email + Password ─────────────────────────────────────────────── */}
        {mainMode === 'password' && (
          <>
            {/* Sub-tabs: Sign In / Sign Up / Forgot Password */}
            <div className="flex gap-1 mb-6 border-b border-gray-200">
              {(['signin', 'signup', 'forgot'] as PasswordView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => { setPasswordView(v); setError(''); setMessage('') }}
                  className={`flex-1 pb-2 text-sm font-medium transition-colors ${
                    passwordView === v
                      ? 'text-emerald-600 border-b-2 border-emerald-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {v === 'signin' ? 'Sign In' : v === 'signup' ? 'Sign Up' : 'Forgot Password'}
                </button>
              ))}
            </div>

            {message && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 text-sm text-emerald-700">
                {message}
              </div>
            )}

            {/* Sign In */}
            {passwordView === 'signin' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    onKeyDown={(e) => { if (e.key === 'Enter' && email && password) handleSignIn() }}
                  />
                </div>
                <button
                  onClick={() => { setPasswordView('forgot'); setError(''); setMessage('') }}
                  className="text-sm text-emerald-600 hover:underline mb-4 block"
                >
                  Forgot password?
                </button>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <Button
                  onClick={handleSignIn}
                  loading={loading}
                  disabled={!email || !password}
                  className="w-full"
                >
                  Sign In
                </Button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => { setPasswordView('signup'); setError(''); setMessage('') }}
                    className="text-emerald-600 font-medium hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </>
            )}

            {/* Sign Up */}
            {passwordView === 'signup' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <Button
                  onClick={handleSignUp}
                  loading={loading}
                  disabled={!fullName || !email || password.length < 6}
                  className="w-full"
                >
                  Create Account
                </Button>
                <p className="text-center text-sm text-gray-500 mt-4">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setPasswordView('signin'); setError(''); setMessage('') }}
                    className="text-emerald-600 font-medium hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </>
            )}

            {/* Forgot Password */}
            {passwordView === 'forgot' && (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <Button
                  onClick={handleForgotPassword}
                  loading={loading}
                  disabled={!email.includes('@')}
                  className="w-full mb-3"
                >
                  Send Reset Email
                </Button>
                <button
                  onClick={() => { setPasswordView('signin'); setError(''); setMessage('') }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back to Sign In
                </button>
              </>
            )}
          </>
        )}

        {/* ── OTP Login ────────────────────────────────────────────────────── */}
        {mainMode === 'otp' && (
          <>
            {otpStep === 'input' && (
              <>
                {/* OTP sub-toggle: Phone / Email */}
                <div className="flex rounded-lg border border-gray-200 p-1 mb-6">
                  <button
                    onClick={() => { setOtpMode('phone'); setError('') }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                      otpMode === 'phone' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Phone className="w-4 h-4" /> Phone OTP
                  </button>
                  <button
                    onClick={() => { setOtpMode('email'); setError('') }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                      otpMode === 'email' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Mail className="w-4 h-4" /> Email OTP
                  </button>
                </div>

                {otpMode === 'phone' ? (
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
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <Button
                  onClick={handleSendOTP}
                  loading={loading}
                  disabled={otpMode === 'phone' ? phone.length < 10 : !otpEmail.includes('@')}
                  className="w-full"
                >
                  Send OTP
                </Button>
              </>
            )}

            {otpStep === 'otp' && (
              <>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6 text-sm text-emerald-700">
                  {message}
                </div>

                {otpMode === 'email' && (
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
                  Verify &amp; Login
                </Button>
                <button
                  onClick={() => { setOtpStep('input'); setOtp(''); setError('') }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  ← Back
                </button>
              </>
            )}
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
