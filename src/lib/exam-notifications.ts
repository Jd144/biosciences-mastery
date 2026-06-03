export type ExamUpdateEventType = 'admit_card_release' | 'exam_date' | 'registration_end' | 'result_date'

export interface ExamEmailPayload {
  to: string
  examName: string
  examCode: string
  eventType: ExamUpdateEventType
  eventDate?: string
  message: string
  examPageUrl: string
}

export function buildExamUpdateEmailHtml(payload: ExamEmailPayload): string {
  const eventLabel: Record<ExamUpdateEventType, string> = {
    admit_card_release: 'Admit Card Update',
    exam_date: 'Exam Date Update',
    registration_end: 'Registration Deadline Update',
    result_date: 'Result Update',
  }

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;max-width:640px;margin:0 auto;">
      <h2 style="color:#065f46;">${payload.examName} (${payload.examCode})</h2>
      <p><strong>${eventLabel[payload.eventType]}</strong></p>
      <p>${payload.message}</p>
      ${payload.eventDate ? `<p><strong>Date:</strong> ${payload.eventDate}</p>` : ''}
      <p>
        <a href="${payload.examPageUrl}" style="display:inline-block;background:#059669;color:white;padding:10px 14px;border-radius:8px;text-decoration:none;">
          Open Exam Dashboard
        </a>
      </p>
      <p style="font-size:12px;color:#6b7280;">You are receiving this update because you are following this exam on BioSciences Mastery.</p>
    </div>
  `
}

export async function sendExamUpdateEmail(payload: ExamEmailPayload): Promise<{ status: 'sent' | 'skipped' | 'failed'; error?: string }> {
  const webhookUrl = process.env.EXAM_NOTIFICATION_WEBHOOK_URL
  if (!webhookUrl) {
    return { status: 'skipped', error: 'EXAM_NOTIFICATION_WEBHOOK_URL not configured' }
  }

  try {
    const html = buildExamUpdateEmailHtml(payload)
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: payload.to,
        subject: `[${payload.examCode}] ${payload.examName} update`,
        html,
      }),
    })

    if (!response.ok) {
      return { status: 'failed', error: `Webhook HTTP ${response.status}` }
    }

    return { status: 'sent' }
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown email failure',
    }
  }
}
