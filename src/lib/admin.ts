import { createClient as createServiceClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jdbanna34@gmail.com'

export async function isAdmin(userId: string, email?: string | null): Promise<boolean> {
  // Email se check karo pehle
  if (email && email === ADMIN_EMAIL) return true

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) return false

  const supabase = createServiceClient(url, serviceKey)
  
  // user_id se check karo
  const { data: byUserId } = await supabase
    .from('admin_allowlist')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  
  if (byUserId) return true

  // email se bhi check karo allowlist mein
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
    throw new Erro
