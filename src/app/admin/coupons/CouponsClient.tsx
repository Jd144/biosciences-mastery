'use client'
import { useState } from 'react'
import { Tag, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react'

interface Coupon {
  id: string
  code: string
  discount_type: 'percent' | 'flat'
  discount_value: number
  usage_limit: number | null
  uses_count: number
  valid_from: string | null
  valid_to: string | null
  is_active: boolean
  created_at: string
}

interface Props {
  initialCoupons: Coupon[]
}

export default function CouponsClient({ initialCoupons }: Props) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percent' as 'percent' | 'flat',
    discount_value: '',
    usage_limit: '',
    valid_from: '',
    valid_to: '',
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
          valid_from: form.valid_from || null,
          valid_to: form.valid_to || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCoupons([data, ...coupons])
      setForm({ code: '', discount_type: 'percent', discount_value: '', usage_limit: '', valid_from: '', valid_to: '' })
      setSuccess('Coupon created!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create coupon')
    } finally {
      setCreating(false)
    }
  }

  const toggleActive = async (coupon: Coupon) => {
    const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    })
    if (res.ok) {
      const updated = await res.json()
      setCoupons(coupons.map((c) => (c.id === coupon.id ? updated : c)))
    }
  }

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    const res = await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    if (res.ok) setCoupons(coupons.filter((c) => c.id !== id))
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Tag className="w-6 h-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Coupon
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Code *</label>
            <input
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="SAVE20"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percent' | 'flat' })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="percent">Percent (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Value * {form.discount_type === 'percent' ? '(%)' : '(₹)'}
            </label>
            <input
              required
              type="number"
              min="1"
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
              placeholder={form.discount_type === 'percent' ? '20' : '100'}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Usage Limit (blank = unlimited)</label>
            <input
              type="number"
              min="1"
              value={form.usage_limit}
              onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
              placeholder="100"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valid From</label>
            <input
              type="datetime-local"
              value={form.valid_from}
              onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Valid To</label>
            <input
              type="datetime-local"
              value={form.valid_to}
              onChange={(e) => setForm({ ...form, valid_to: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Coupon'}
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && <p className="text-emerald-600 text-sm">{success}</p>}
          </div>
        </form>
      </div>

      {/* Coupons table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Discount</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Uses</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Validity</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No coupons yet</td>
              </tr>
            )}
            {coupons.map((c, i) => (
              <tr key={c.id} className={`${i !== 0 ? 'border-t border-gray-100' : ''} hover:bg-gray-50`}>
                <td className="px-4 py-3 font-mono font-bold text-purple-700">{c.code}</td>
                <td className="px-4 py-3 text-gray-800">
                  {c.discount_type === 'percent' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {c.uses_count}{c.usage_limit !== null ? ` / ${c.usage_limit}` : ''}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {c.valid_from ? new Date(c.valid_from).toLocaleDateString('en-IN') : '—'}
                  {' → '}
                  {c.valid_to ? new Date(c.valid_to).toLocaleDateString('en-IN') : '∞'}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(c)}
                    className="text-gray-400 hover:text-purple-600"
                    title={c.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {c.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => deleteCoupon(c.id)}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
