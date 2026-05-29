'use client'
import { useEffect, useState } from 'react'

export default function AnnouncementsAdminPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any|null>(null)
  const [form, setForm] = useState({
    message: '',
    start_time: '',
    end_time: '',
    popup_duration: 10,
    is_active: true,
    page_filter: '',
    user_filter: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/announcements')
      .then(r => r.json())
      .then(d => { setAnnouncements(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function handleEdit(a: any) {
    setEditing(a.id)
    setForm({
      message: a.message,
      start_time: a.start_time?.slice(0, 16) ?? '',
      end_time: a.end_time?.slice(0, 16) ?? '',
      popup_duration: a.popup_duration,
      is_active: a.is_active,
      page_filter: a.page_filter ?? '',
      user_filter: a.user_filter ?? ''
    })
  }

  async function handleSave(e: any) {
    e.preventDefault()
    setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/admin/announcements/${editing}` : '/api/admin/announcements'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSaving(false)
    if (res.ok) {
      setEditing(null)
      setForm({ message: '', start_time: '', end_time: '', popup_duration: 10, is_active: true, page_filter: '', user_filter: '' })
      // reload
      fetch('/api/admin/announcements')
        .then(r => r.json())
        .then(d => setAnnouncements(Array.isArray(d) ? d : []))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this announcement?')) return
    await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
    setAnnouncements(announcements.filter(a => a.id !== id))
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Announcements</h1>
      <form onSubmit={handleSave} className="space-y-4 mb-8">
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={3}
          placeholder="Announcement message"
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          required
        />
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Start Time</label>
            <input type="datetime-local" className="border rounded px-2 py-1" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">End Time</label>
            <input type="datetime-local" className="border rounded px-2 py-1" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Popup Duration (sec)</label>
            <input type="number" min={1} max={120} className="border rounded px-2 py-1 w-20" value={form.popup_duration} onChange={e => setForm(f => ({ ...f, popup_duration: Number(e.target.value) }))} required />
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">Active?</label>
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Page Filter (optional)</label>
            <input type="text" className="border rounded px-2 py-1" value={form.page_filter} onChange={e => setForm(f => ({ ...f, page_filter: e.target.value }))} placeholder="/app/gatb or leave blank for all" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">User Filter (optional)</label>
            <input type="text" className="border rounded px-2 py-1" value={form.user_filter} onChange={e => setForm(f => ({ ...f, user_filter: e.target.value }))} placeholder="user id, role, etc." />
          </div>
        </div>
        <button type="submit" disabled={saving} className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 disabled:opacity-50">
          {editing ? (saving ? 'Saving...' : 'Save Changes') : (saving ? 'Adding...' : 'Add Announcement')}
        </button>
        {editing && <button type="button" className="ml-4 text-gray-500 underline" onClick={() => setEditing(null)}>Cancel Edit</button>}
      </form>
      <table className="w-full border-collapse bg-white rounded-xl border">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-4">Message</th>
            <th className="text-left p-4">Start</th>
            <th className="text-left p-4">End</th>
            <th className="text-left p-4">Duration</th>
            <th className="text-left p-4">Active</th>
            <th className="text-left p-4">Page Filter</th>
            <th className="text-left p-4">User Filter</th>
            <th className="text-left p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map(a => (
            <tr key={a.id} className="border-b hover:bg-gray-50">
              <td className="p-4 max-w-xs truncate">{a.message}</td>
              <td className="p-4">{a.start_time ? new Date(a.start_time).toLocaleString() : ''}</td>
              <td className="p-4">{a.end_time ? new Date(a.end_time).toLocaleString() : ''}</td>
              <td className="p-4">{a.popup_duration}s</td>
              <td className="p-4">{a.is_active ? 'Yes' : 'No'}</td>
              <td className="p-4">{a.page_filter || 'All'}</td>
              <td className="p-4">{a.user_filter || 'All'}</td>
              <td className="p-4">
                <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(a)}>Edit</button>
                <button className="text-red-600 hover:underline" onClick={() => handleDelete(a.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
