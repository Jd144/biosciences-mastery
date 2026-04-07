import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import Link from 'next/link'
import { ShieldCheck, BookOpen, List, FileText, HelpCircle, ClipboardList, Users, ShoppingBag, Tag, BarChart2, Settings } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!(await isAdmin(user.id))) redirect('/app/dashboard')

  const navItems = [
    { href: '/admin', label: 'Overview', icon: ShieldCheck },
    { href: '/admin/subjects', label: 'Subjects', icon: BookOpen },
    { href: '/admin/topics', label: 'Topics', icon: List },
    { href: '/admin/content', label: 'Content', icon: FileText },
    { href: '/admin/pyqs', label: 'PYQs', icon: HelpCircle },
    { href: '/admin/quizzes', label: 'Quizzes', icon: ClipboardList },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/coupons', label: 'Coupons', icon: Tag },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span className="font-bold">Admin Panel</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">BioSciences Mastery</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-gray-700">
          <Link href="/app/dashboard" className="text-xs text-gray-400 hover:text-gray-200">
            ← Back to App
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
