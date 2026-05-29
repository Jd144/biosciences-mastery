import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const serviceSupabase = getServiceClient()
  const { data, error } = await serviceSupabase.auth.admin.listUsers()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data.users)
}
