import { createClient as createServiceClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jdbanna34@gmail.com'

export async function isAdmin(userId: string, email?: string | null): Promise<boolean> {
  // Fast path: hardcoded admin email
  if (email && email === ADMIN_EMAIL) return true

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) return false

  const supabase = createServiceClient(url, serviceKey)
  const { data } = await supabase
    .from('admin_allowlist')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. This client is only available server-side.'
    )
  }

  return createServiceClient(url, serviceKey)
}
