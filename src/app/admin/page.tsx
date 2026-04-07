import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/admin'
import { BookOpen, Users, ShoppingCart, FileText } from 'lucide-react'

export default async function AdminOverview() {
  const supabase = await createClient()
  const serviceSupabase = getServiceClient()

  const [subjectsRes, topicsRes, ordersRes, usersRes] = await Promise.all([
    supabase.from('subjects').select('id', { count: 'exact' }),
    supabase.from('topics').select('id', { count: 'exact' }),
    serviceSupabase.from('orders').select('id', { count: 'exact' }).eq('status', 'paid'),
    serviceSupabase.auth.admin.listUsers(),
  ])

  const stats = [
    { label: 'Subjects', value: subjectsRes.count ?? 0, icon: BookOpen, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Topics', value: topicsRes.count ?? 0, icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'Paid Orders', value: ordersRes.count ?? 0, icon: ShoppingCart, color: 'bg-purple-100 text-purple-600' },
    { label: 'Total Users', value: usersRes.data?.users?.length ?? 0, icon: Users, color: 'bg-orange-100 text-orange-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h3 className="font-semibold text-amber-800 mb-2">Quick Actions</h3>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Go to <strong>Orders</strong> to view paid orders and revenue</li>
          <li>• Go to <strong>Coupons</strong> to create and manage discount codes</li>
          <li>• Go to <strong>Subjects</strong> to manage the subject catalog</li>
          <li>• Go to <strong>Topics</strong> to add/edit topics for each subject</li>
          <li>• Go to <strong>Content</strong> to add notes, flowcharts, tables</li>
          <li>• Go to <strong>PYQs</strong> to add official previous year questions</li>
          <li>• Go to <strong>Quizzes</strong> to create and manage quiz questions</li>
        </ul>
      </div>
    </div>
  )
}
