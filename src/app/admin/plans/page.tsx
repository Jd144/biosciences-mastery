'use client'
import { useState, useEffect } from 'react'

export default function PlansAdminPage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/plans')
      .then(r => r.json())
      .then(d => { setPlans(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave(idx: number) {
    setSaving(true)
    setError('')
    const plan = plans[idx]
    const res = await fetch(`/api/admin/plans/${plan.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price_inr: parseFloat(plan.price_inr) }),
    })
    if (res.ok) {
      setSaving(false)
    } else {
      const d = await res.json()
      setError(d.error || 'Failed')
      setSaving(false)
    }
  }

  function handleChange(idx: number, value: string) {
    setPlans(plans => plans.map((p, i) => i === idx ? { ...p, price_inr: value } : p))
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Plans Pricing</h1>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <table className="w-full border-collapse bg-white rounded-xl border mb-6">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-4">Plan</th>
            <th className="text-left p-4">Description</th>
            <th className="text-left p-4">Price (INR)</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, idx) => (
            <tr key={plan.id} className="border-b hover:bg-gray-50">
              <td className="p-4 font-medium">{plan.name}</td>
              <td className="p-4">{plan.description}</td>
              <td className="p-4">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={plan.price_inr}
                  onChange={e => handleChange(idx, e.target.value)}
                  className="border rounded px-2 py-1 w-28"
                />
              </td>
              <td className="p-4">
                <button
                  onClick={() => handleSave(idx)}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
