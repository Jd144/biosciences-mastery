import { getServiceClient } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import { BarChart2, TrendingUp, Users, ShoppingBag } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()
  const svc = getServiceClient()

  const [ordersRes, usersRes, couponsRes] = await Promise.all([
    supabase.from('orders').select('amount_paise, status, plan_type, created_at, coupon_code, discount_paise'),
    svc.auth.admin.listUsers(),
    svc.from('coupons').select('code, uses_count, discount_type, discount_value'),
  ])

  const orders = ordersRes.data ?? []
  const paidOrders = orders.filter((o) => o.status === 'paid')
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.amount_paise, 0)
  const totalDiscount = paidOrders.reduce((sum, o) => sum + (o.discount_paise ?? 0), 0)
  const fullOrders = paidOrders.filter((o) => o.plan_type === 'FULL').length
  const subjectOrders = paidOrders.filter((o) => o.plan_type === 'SINGLE_SUBJECT').length

  const users = usersRes.data?.users ?? []
  const now = new Date()
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const newUsers30 = users.filter((u) => new Date(u.created_at) > last30Days).length
  const newOrders30 = paidOrders.filter((o) => new Date(o.created_at) > last30Days).length

  const coupons = couponsRes.data ?? []
  const topCoupons = [...coupons].sort((a, b) => b.uses_count - a.uses_count).slice(0, 5)

  const stats = [
    { label: 'Total Revenue', value: `₹${(totalRevenue / 100).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Total Discounts Given', value: `₹${(totalDiscount / 100).toLocaleString('en-IN')}`, icon: ShoppingBag, color: 'bg-purple-100 text-purple-600' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'New Users (30d)', value: newUsers30, icon: Users, color: 'bg-orange-100 text-orange-600' },
    { label: 'Paid Orders', value: paidOrders.length, icon: ShoppingBag, color: 'bg-teal-100 text-teal-600' },
    { label: 'New Orders (30d)', value: newOrders30, icon: BarChart2, color: 'bg-pink-100 text-pink-600' },
    { label: 'Full Course Sales', value: fullOrders, icon: BarChart2, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Subject Sales', value: subjectOrders, icon: BarChart2, color: 'bg-yellow-100 text-yellow-600' },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <BarChart2 className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {topCoupons.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Top Coupons by Usage</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Code</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Discount</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Uses</th>
              </tr>
            </thead>
            <tbody>
              {topCoupons.map((c, i) => (
                <tr key={c.code} className={i !== 0 ? 'border-t border-gray-100' : ''}>
                  <td className="px-4 py-2 font-mono font-bold text-purple-700">{c.code}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{c.uses_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
