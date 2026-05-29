import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const svc = getServiceClient()
  const { data, error } = await svc
    .from('mock_test_sets')
    .select('*, mock_tests(id, test_no, title, is_active)')
    .order('set_no')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { set_no, title, description } = body

  if (!set_no || !title) {
    return NextResponse.json({ error: 'set_no and title required' }, { status: 400 })
  }

  const svc = getServiceClient()
  const { data, error } = await svc
    .from('mock_test_sets')
    .upsert({ set_no, title, description }, { onConflict: 'set_no' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
