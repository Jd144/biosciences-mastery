import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getServiceClient, isAdmin } from '@/lib/admin'
import { buildExamUpdateEmailHtml, sendExamUpdateEmail, type ExamUpdateEventType } from '@/lib/exam-notifications'

type TimelineInput = {
  event_type: string
  event_date: string
  event_label?: string | null
}

const TRACKED_EVENTS: ExamUpdateEventType[] = ['admit_card_release', 'exam_date', 'registration_end', 'result_date']

function isTrackedEvent(eventType: string): eventType is ExamUpdateEventType {
  return TRACKED_EVENTS.includes(eventType as ExamUpdateEventType)
}

function formatAdminMessage(eventType: ExamUpdateEventType, eventDate: string, examName: string): string {
  if (eventType === 'admit_card_release') return `${examName} admit card update: ${eventDate}`
  if (eventType === 'exam_date') return `${examName} exam date update: ${eventDate}`
  if (eventType === 'registration_end') return `${examName} registration deadline updated: ${eventDate}`
  return `${examName} result update: ${eventDate}`
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const serviceSupabase = getServiceClient()

  const { data: existingTimelineRows } = await serviceSupabase
    .from('exam_timelines')
    .select('event_type, event_date')
    .eq('exam_id', id)

  const { data: oldExam } = await serviceSupabase
    .from('exams')
    .select('admit_card_link')
    .eq('id', id)
    .maybeSingle()

  const oldTimelineMap = new Map<string, string>()
  ;(existingTimelineRows ?? []).forEach((row) => {
    oldTimelineMap.set(row.event_type, row.event_date)
  })

  const { error: examError } = await serviceSupabase
    .from('exams')
    .update({
      name: body.name,
      description: body.description,
      official_link: body.official_link,
      syllabus_link: body.syllabus_link || null,
      registration_link: body.registration_link || null,
      admit_card_link: body.admit_card_link || null,
      result_link: body.result_link || null,
      study_resources_link: body.study_resources_link || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (examError) {
    return NextResponse.json({ error: examError.message }, { status: 500 })
  }

  const { error: detailsError } = await serviceSupabase.from('exam_details').upsert(
    {
      exam_id: id,
      eligibility: body.eligibility || null,
      exam_pattern: body.exam_pattern || null,
      marking_scheme: body.marking_scheme || null,
      duration: body.duration || null,
      seats_approximate: body.seats_approximate || null,
      fellowship_details: body.fellowship_details || null,
      stipend_details: body.stipend_details || null,
      award_amount: body.award_amount || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'exam_id' }
  )

  if (detailsError) {
    return NextResponse.json({ error: detailsError.message }, { status: 500 })
  }

  const timelineInputs = Array.isArray(body.timelines) ? (body.timelines as TimelineInput[]) : []
  for (const timeline of timelineInputs) {
    if (!timeline.event_type || !timeline.event_date) continue

    const { error: timelineError } = await serviceSupabase.from('exam_timelines').upsert(
      {
        exam_id: id,
        event_type: timeline.event_type,
        event_date: timeline.event_date,
        event_label: timeline.event_label || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'exam_id,event_type' }
    )

    if (timelineError) {
      return NextResponse.json({ error: timelineError.message }, { status: 500 })
    }
  }

  const { data: exam } = await serviceSupabase
    .from('exams')
    .select('name, code')
    .eq('id', id)
    .single()

  const changedEvents = timelineInputs.filter((timeline) => {
    if (!isTrackedEvent(timeline.event_type)) return false
    return oldTimelineMap.get(timeline.event_type) !== timeline.event_date
  })

  if ((oldExam?.admit_card_link ?? null) !== (body.admit_card_link || null) && body.admit_card_link) {
    const existingAdmitCardUpdate = changedEvents.some((event) => event.event_type === 'admit_card_release')
    if (!existingAdmitCardUpdate) {
      changedEvents.push({
        event_type: 'admit_card_release',
        event_date:
          timelineInputs.find((timeline) => timeline.event_type === 'admit_card_release')?.event_date ??
          oldTimelineMap.get('admit_card_release') ??
          new Date().toISOString().slice(0, 10),
      })
    }
  }

  if (exam && changedEvents.length > 0) {
    const { data: followers } = await serviceSupabase
      .from('user_exams')
      .select('user_id')
      .eq('exam_id', id)

    const uniqueFollowerIds = [...new Set((followers ?? []).map((item) => item.user_id))]

    for (const followerId of uniqueFollowerIds) {
      const authUser = await serviceSupabase.auth.admin.getUserById(followerId)
      const email = authUser.data.user?.email ?? null

      for (const changed of changedEvents) {
        if (!isTrackedEvent(changed.event_type)) continue

        const message = formatAdminMessage(changed.event_type, changed.event_date, exam.name)
        const notificationKey = `${changed.event_type}_${id}_${changed.event_date}`

        const htmlMessage = buildExamUpdateEmailHtml({
          to: email ?? '',
          examName: exam.name,
          examCode: exam.code,
          eventType: changed.event_type,
          eventDate: changed.event_date,
          message,
          examPageUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/app/exams`,
        })

        const emailResult = email
          ? await sendExamUpdateEmail({
              to: email,
              examName: exam.name,
              examCode: exam.code,
              eventType: changed.event_type,
              eventDate: changed.event_date,
              message,
              examPageUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/app/exams`,
            })
          : { status: 'skipped' as const, error: 'No user email available' }

        const { data: existingNotice } = await serviceSupabase
          .from('user_notifications')
          .select('id')
          .eq('user_id', followerId)
          .eq('notification_key', notificationKey)
          .maybeSingle()

        if (!existingNotice) {
          await serviceSupabase.from('user_notifications').insert({
            user_id: followerId,
            exam_id: id,
            type: changed.event_type,
            title: `${exam.name} update`,
            message,
            html_message: htmlMessage,
            email_status: emailResult.status,
            notification_key: notificationKey,
            metadata: {
              eventType: changed.event_type,
              eventDate: changed.event_date,
            },
          })
        }

        await serviceSupabase.from('exam_notification_logs').insert({
          exam_id: id,
          user_id: followerId,
          event_type: changed.event_type,
          email,
          status: emailResult.status,
          payload: {
            eventDate: changed.event_date,
            message,
            error: emailResult.error ?? null,
          },
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
