import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await supabase
    .from('admin_allowlist')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

export function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
