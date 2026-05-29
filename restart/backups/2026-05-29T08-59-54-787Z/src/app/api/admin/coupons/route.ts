import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const svc = getServiceClient()
  const { data, error } = await svc.from('coupons').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const { code, discount_type, discount_value, usage_limit, valid_from, valid_to } = body
  if (!code || !discount_type || !discount_value) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  const svc = getServiceClient()
  const { data, error } = await svc
    .from('coupons')
    .insert({
      code: code.toUpperCase().trim(),
      discount_type,
      discount_value: Number(discount_value),
      usage_limit: usage_limit ? Number(usage_limit) : null,
      valid_from: valid_from || null,
      valid_to: valid_to || null,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
