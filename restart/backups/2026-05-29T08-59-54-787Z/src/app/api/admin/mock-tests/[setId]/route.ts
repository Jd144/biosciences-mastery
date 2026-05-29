import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { setId } = await params
  const svc = getServiceClient()
  const { data, error } = await svc
    .from('mock_tests')
    .select('*, mock_test_questions(count)')
    .eq('set_id', setId)
    .order('test_no')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { setId } = await params
  const body = await request.json()
  const { test_no, title, description, duration_minutes, total_marks } = body

  if (!test_no || !title) {
    return NextResponse.json({ error: 'test_no and title required' }, { status: 400 })
  }

  const svc = getServiceClient()
  const { data, error } = await svc
    .from('mock_tests')
    .upsert(
      {
        set_id: setId,
        test_no,
        title,
        description,
        duration_minutes: duration_minutes ?? 180,
        total_marks: total_marks ?? 100,
      },
      { onConflict: 'set_id,test_no' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
