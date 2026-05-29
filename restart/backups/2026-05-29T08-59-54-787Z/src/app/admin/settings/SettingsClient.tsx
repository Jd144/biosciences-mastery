'use client'
import { useState } from 'react'
import { Settings, Save } from 'lucide-react'

interface Props {
  initialSettings: Record<string, string>
}

const SETTING_LABELS: Record<string, string> = {
  free_ai_requests_per_day: 'Free AI Requests Per Day',
  free_quiz_questions: 'Free Quiz Questions Limit',
  premium_quiz_questions: 'Premium Quiz Questions Limit',
}

export default function SettingsClient({ initialSettings }: Props) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSave = async (key: string) => {
    setSaving({ ...saving, [key]: true })
    setErrors({ ...errors, [key]: '' })
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: settings[key] }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setSaved({ ...saved, [key]: true })
      setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2000)
    } catch (err) {
      setErrors({ ...errors, [key]: err instanceof Error ? err.message : 'Save failed' })
    } finally {
      setSaving({ ...saving, [key]: false })
    }
  }

  const allKeys = Object.keys(SETTING_LABELS)

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-6 h-6 text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900">App Settings</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
        {allKeys.map((key) => (
          <div key={key} className="p-6 flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-800 mb-1">
                {SETTING_LABELS[key] ?? key}
              </label>
              <p className="text-xs text-gray-400">{key}</p>
              {errors[key] && <p className="text-xs text-red-600 mt-1">{errors[key]}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={settings[key] ?? ''}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={() => handleSave(key)}
                disabled={saving[key]}
                className="flex items-center gap-1.5 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {saved[key] ? 'Saved!' : saving[key] ? '...' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Note: Changes to AI limits take effect immediately for new requests. Restart the server if environment variable overrides are in use.
      </p>
    </div>
  )
}
