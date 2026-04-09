'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import ThemeToggle from '@/components/ThemeToggle'
import { BookOpen, LogOut, LayoutDashboard, ShieldCheck, FlaskConical, User } from 'lucide-react'

interface NavbarProps {
  isAdmin?: boolean
}

export default function Navbar({ isAdmin }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b transition-all duration-200"
      style={{
        background: 'var(--nav-bg)',
        borderColor: 'var(--nav-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/app/dashboard" className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
              BioSciences Mastery
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/app/dashboard"
              className="flex items-center gap-1.5 text-sm font-medium hover:text-emerald-600 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/app/subjects"
              className="flex items-center gap-1.5 text-sm font-medium hover:text-emerald-600 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <BookOpen className="w-4 h-4" />
              Subjects
            </Link>
            <Link
              href="/app/gatb"
              className="flex items-center gap-1.5 text-sm font-medium hover:text-emerald-600 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <FlaskConical className="w-4 h-4" />
              GATE B 2026
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
                <Link
                  href="/admin/plans"
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Plans Pricing
                </Link>
                <Link
                  href="/admin/entitlements"
                  className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  <User className="w-4 h-4" />
                  Entitlements
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/app/buy/full">
              <Button size="sm" variant="outline">Upgrade ₹999</Button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm hover:text-red-600 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

