import { createClient as createServiceClient } from '@supabase/supabase-js'

const DEFAULT_ADMIN_EMAILS = ['jdbanna34@gmail.com', '22ibo048@smvdu.ac.in']
const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAILS.join(','))
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

function normalizeEmail(email?: string | null): string | null {
  return email?.trim().toLowerCase() ?? null
}

export async function isAdmin(userId: string, email?: string | null): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email)

  if (normalizedEmail && ADMIN_EMAILS.includes(normalizedEmail)) return true

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) return false

  const supabase = createServiceClient(url, serviceKey)

  const { data: byUserId } = await supabase
    .from('admin_allowlist')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (byUserId) return true

  if (normalizedEmail) {
    const { data: byEmail } = await supabase
      .from('admin_allowlist')
      .select('id')
      .ilike('email', normalizedEmail)
      .maybeSingle()
    if (byEmail) return true
  }

  return false
}

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.')
  }

  return createServiceClient(url, serviceKey)
}
