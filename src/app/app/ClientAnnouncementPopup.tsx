"use client"
import AnnouncementPopup from '@/components/ui/AnnouncementPopup'
export default function ClientAnnouncementPopup({ userId }: { userId?: string }) {
  return <AnnouncementPopup userId={userId} />
}