import { createClient as createServiceClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jdbanna34@gmail.com'

export async function isAdmin(userId: string, email?: string | null): Promise<boolean> {
  if (email && email === ADMIN_EMAIL) return true

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

  if (email) {
    const { data: byEmail } = await supabase
      .from('admin_allowlist')
      .select('id')
      .eq('email', email)
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
