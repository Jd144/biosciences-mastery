'use client'

import { useEffect, useState } from 'react'

type ExamOption = {
  id: string
  code: string
  name: string
}

type ProfileResponse = {
  profile: {
    full_name: string
    profile_picture_url: string
    bio: string
    selected_exam_id: string | null
    email: string
  }
  exams: ExamOption[]
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState('')
  const [exams, setExams] = useState<ExamOption[]>([])
  const [form, setForm] = useState({
    full_name: '',
    profile_picture_url: '',
    bio: '',
    selected_exam_id: '',
    email: '',
  })

  useEffect(() => {
    fetch('/api/profile')
      .then((response) => response.json())
      .then((payload: ProfileResponse) => {
        setForm({
          full_name: payload.profile.full_name,
          profile_picture_url: payload.profile.profile_picture_url,
          bio: payload.profile.bio,
          selected_exam_id: payload.profile.selected_exam_id ?? '',
          email: payload.profile.email,
        })
        setExams(payload.exams)
      })
      .finally(() => setLoading(false))
  }, [])

  function handleFileUpload(file: File | null) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (result) {
        setForm((prev) => ({ ...prev, profile_picture_url: result }))
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    setStatus('')
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.full_name,
        profile_picture_url: form.profile_picture_url,
        bio: form.bio,
        selected_exam_id: form.selected_exam_id || null,
      }),
    })

    setSaving(false)
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({ error: 'Failed to save profile' }))) as { error?: string }
      setStatus(payload.error ?? 'Failed to save profile')
      return
    }

    setStatus('Profile updated successfully.')
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading profile...</div>
  }

  const selectedExam = exams.find((exam) => exam.id === form.selected_exam_id)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-600 mt-1">Edit your profile and choose the biotechnology exam you are preparing for.</p>
      </div>

      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Full Name</label>
            <input className="border rounded-lg px-3 py-2 w-full" value={form.full_name} onChange={(event) => setForm((prev) => ({ ...prev, full_name: event.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input className="border rounded-lg px-3 py-2 w-full bg-gray-50" value={form.email} disabled />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Profile Picture Upload</label>
          <input type="file" accept="image/*" onChange={(event) => handleFileUpload(event.target.files?.[0] ?? null)} className="block w-full text-sm" />
          <p className="text-xs text-gray-500 mt-1">You can also paste image URL directly.</p>
          <input className="border rounded-lg px-3 py-2 w-full mt-2" value={form.profile_picture_url} onChange={(event) => setForm((prev) => ({ ...prev, profile_picture_url: event.target.value }))} placeholder="https://..." />
          {form.profile_picture_url && (
            <img src={form.profile_picture_url} alt="Profile preview" className="h-20 w-20 rounded-full object-cover mt-3 border" />
          )}
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Bio/About (optional)</label>
          <textarea className="border rounded-lg px-3 py-2 w-full" rows={3} value={form.bio} onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))} />
        </div>

        <div>
          <label className="text-sm font-medium block mb-1">Select biotechnology exam</label>
          <select className="border rounded-lg px-3 py-2 w-full" value={form.selected_exam_id} onChange={(event) => setForm((prev) => ({ ...prev, selected_exam_id: event.target.value }))}>
            <option value="">No exam selected</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-emerald-700 mt-2">
            Currently preparing for: <strong>{selectedExam?.name ?? 'Not selected'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="bg-emerald-600 text-white px-5 py-2 rounded-lg disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {status && <span className="text-sm text-gray-600">{status}</span>}
        </div>
      </div>
    </div>
  )
}
