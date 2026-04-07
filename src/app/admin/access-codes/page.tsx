import { createClient } from '@/lib/supabase/server'
import { getServiceClient, isAdmin } from '@/lib/admin'
import { redirect } from 'next/navigation'
import AccessCodesClient from './AccessCodesClient'

export default async function AccessCodesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) redirect('/app/dashboard')

  const serviceClient = getServiceClient()
  const { data: codes } = await serviceClient
    .from('access_codes')
    .select('id, code, assigned_email, used_at, created_at, used_by_user_id')
    .order('created_at', { ascending: false })

  return <AccessCodesClient initialCodes={codes ?? []} />
}
