'use client'

import { useEffect, useState } from 'react'

type NotificationItem = {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  async function loadNotifications() {
    const response = await fetch('/api/notifications')
    const payload = (await response.json()) as { notifications?: NotificationItem[] }
    setNotifications(payload.notifications ?? [])
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadNotifications()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  async function markAsRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)))
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading notifications...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
        <p className="text-sm text-gray-600 mt-1">Admit card releases, exam date changes, result updates and deadline reminders.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white border rounded-xl p-5 text-sm text-gray-600">No notifications yet.</div>
      ) : (
        notifications.map((notice) => (
          <div key={notice.id} className={`bg-white border rounded-xl p-4 ${notice.is_read ? 'opacity-80' : 'border-emerald-200'}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-gray-900">{notice.title}</h2>
              {!notice.is_read && (
                <button className="text-xs text-emerald-700 underline" onClick={() => markAsRead(notice.id)}>
                  Mark as read
                </button>
              )}
            </div>
            <p className="text-sm text-gray-700 mt-1">{notice.message}</p>
            <p className="text-xs text-gray-500 mt-2">{new Date(notice.created_at).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  )
}
