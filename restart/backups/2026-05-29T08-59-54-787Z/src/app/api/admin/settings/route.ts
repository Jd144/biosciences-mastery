import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const svc = getServiceClient()
  const { data, error } = await svc.from('app_settings').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const settings: Record<string, string> = {}
  for (const row of (data ?? [])) settings[row.key] = row.value
  return NextResponse.json(settings)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const { key, value } = body
  if (!key || value === undefined) return NextResponse.json({ error: 'key and value required' }, { status: 400 })
  const svc = getServiceClient()
  const { data, error } = await svc
    .from('app_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
