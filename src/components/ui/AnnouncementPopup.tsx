"use client"
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function AnnouncementPopup({ userId }: { userId?: string }) {
  const [announcement, setAnnouncement] = useState<any>(null)
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/announcements/active?page=' + encodeURIComponent(pathname) + (userId ? ('&user=' + userId) : ''))
      .then(r => r.json())
      .then(a => {
        if (a && a.message) {
          setAnnouncement(a)
          setVisible(true)
          setTimeout(() => setVisible(false), (a.popup_duration || 10) * 1000)
        }
      })
  }, [pathname, userId])

  if (!announcement || !visible) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-lg z-50 max-w-lg w-full flex items-center justify-between gap-4">
      <span>{announcement.message}</span>
      <button className="ml-4 text-white/80 hover:text-white text-lg" onClick={() => setVisible(false)}>&times;</button>
    </div>
  )
}
