import { createClient } from '@/lib/supabase/server'

export default async function AdminOrdersPage() {
  const supabase = await createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*, subjects(name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const totalRevenue = orders
    ?.filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount_paise, 0) ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-emerald-700 font-bold">
          Revenue: ₹{(totalRevenue / 100).toLocaleString('en-IN')}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Order ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Plan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Subject</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order, i) => (
              <tr key={order.id} className={`${i !== 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">
                  {order.razorpay_order_id?.slice(-8)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.plan_type === 'FULL' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {order.plan_type === 'FULL' ? 'Full Course' : 'Single Subject'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {(order.subjects as unknown as { name: string } | null)?.name ?? '—'}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  ₹{(order.amount_paise / 100).toFixed(0)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    order.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(order.created_at).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
