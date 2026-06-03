import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEADLINE_REMINDER_DAYS = [7, 3, 1]

function daysUntil(dateString: string): number {
  const today = new Date()
  const target = new Date(dateString)
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  const utcTarget = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate())
  return Math.ceil((utcTarget - utcToday) / (1000 * 60 * 60 * 24))
}

async function ensureDeadlineReminders(userId: string, examId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: registrationEvent } = await supabase
    .from('exam_timelines')
    .select('event_date')
    .eq('exam_id', examId)
    .eq('event_type', 'registration_end')
    .maybeSingle()

  if (!registrationEvent?.event_date) return

  const daysLeft = daysUntil(registrationEvent.event_date)
  if (!DEADLINE_REMINDER_DAYS.includes(daysLeft)) return

  const key = `registration_end_${examId}_${daysLeft}`
  const { data: existing } = await supabase
    .from('user_notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('notification_key', key)
    .maybeSingle()

  if (existing) return

  await supabase.from('user_notifications').insert({
    user_id: userId,
    exam_id: examId,
    type: 'registration_deadline',
    title: 'Registration deadline approaching',
    message: `Registration closes in ${daysLeft} day${daysLeft > 1 ? 's' : ''}. Complete your application before the deadline.`,
    notification_key: key,
    metadata: { daysLeft },
  })
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('selected_exam_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.selected_exam_id) {
    await ensureDeadlineReminders(user.id, profile.selected_exam_id, supabase)
  }

  const { data, error } = await supabase
    .from('user_notifications')
    .select('id, type, title, message, is_read, created_at, exam_id, metadata')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ notifications: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const notificationId = typeof body.id === 'string' ? body.id : null

  if (!notificationId) {
    return NextResponse.json({ error: 'Notification id is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('user_notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
