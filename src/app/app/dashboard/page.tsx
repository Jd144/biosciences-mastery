import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, TrendingUp, ShoppingBag, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

/** Shape returned by the entitlements join query */
type EntitlementRow = {
  id: string
  type: string
  subject_id: string | null
  // Supabase returns FK joins as arrays; we take the first element when rendering
  subjects: { name: string; slug: string }[] | null
}

/** Shape returned by the orders join query */
type OrderRow = {
  id: string
  plan_type: string
  amount_paise: number
  created_at: string
  // Supabase returns FK joins as arrays; we take the first element when rendering
  subjects: { name: string }[] | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch entitlements – errors are non-fatal; fall back to empty state
  const { data: entitlementsRaw } = await supabase
    .from('entitlements')
    .select('id, type, subject_id, subjects(name, slug)')
    .eq('user_id', user.id)

  const entitlements = (entitlementsRaw ?? []) as EntitlementRow[]
  const hasFull = entitlements.some((e) => e.type === 'FULL')
  const ownedSubjects = entitlements.filter((e) => e.type === 'SUBJECT')

  // Fetch recent paid orders – errors are non-fatal
  const { data: ordersRaw } = await supabase
    .from('orders')
    .select('id, plan_type, amount_paise, created_at, subjects(name)')
    .eq('user_id', user.id)
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(5)

  const orders = (ordersRaw ?? []) as OrderRow[]

  const displayName = user.email ?? user.phone ?? 'Student'

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back! 👋</h1>
        <p className="text-gray-500 mt-1">{displayName}</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Subjects Owned</p>
              <p className="text-2xl font-bold text-gray-900">
                {hasFull ? '10 (All)' : ownedSubjects.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Access Level</p>
              <p className="text-2xl font-bold text-gray-900">
                {hasFull ? 'Full Course' : ownedSubjects.length > 0 ? 'Partial' : 'Free'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upsell Banner */}
      {!hasFull && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">Unlock Full Course</h3>
            <p className="text-emerald-100 text-sm">
              Get all 10 subjects for just ₹999 — lifetime access
            </p>
          </div>
          <Link
            href="/app/buy/full"
            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-2.5 rounded-lg transition-colors"
          >
            Buy Full Course ₹999
          </Link>
        </div>
      )}

      {/* Owned Subjects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Your Subjects</h2>
          <Link href="/app/subjects" className="text-emerald-600 text-sm font-medium hover:underline">
            View All →
          </Link>
        </div>

        {hasFull ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-emerald-700 font-medium">You have full access to all 10 subjects!</p>
          </div>
        ) : ownedSubjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ownedSubjects.map((e) => {
              const subject = e.subjects?.[0] ?? null
              return (
                <Link
                  key={e.id}
                  href={subject?.slug ? `/app/subjects/${subject.slug}` : '/app/subjects'}
                  className="bg-white border border-gray-100 rounded-xl p-4 hover:border-emerald-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium text-gray-800 text-sm">
                      {subject?.name ?? 'Subject'}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">You haven&apos;t purchased any subjects yet</p>
            <Link href="/app/subjects">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2 rounded-lg text-sm">
                Browse Subjects
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Purchases</h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {orders.map((order, i) => {
              const subject = order.subjects?.[0] ?? null
              return (
                <div
                  key={order.id}
                  className={`flex items-center justify-between px-6 py-4 ${
                    i !== 0 ? 'border-t border-gray-100' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {order.plan_type === 'FULL' ? 'Full Course' : (subject?.name ?? 'Subject')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{(order.amount_paise / 100).toFixed(0)}
                    </p>
                    <span className="inline-block text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full mt-0.5">
                      Paid
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

