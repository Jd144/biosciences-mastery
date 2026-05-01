import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdmin, getServiceClient } from '@/lib/admin'

// GET questions for a test
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ setId: string; testId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { testId } = await params
  const svc = getServiceClient()
  const { data, error } = await svc
    .from('mock_test_questions')
    .select('*')
    .eq('test_id', testId)
    .order('question_no')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST: upsert a single question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ setId: string; testId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { testId } = await params
  const body = await request.json()

  // body can be a single question or array of questions
  const questions = Array.isArray(body) ? body : [body]
  const toUpsert = questions.map((q: Record<string, unknown>, idx: number) => ({
    ...q,
    test_id: testId,
    question_no: q.question_no ?? idx + 1,
  }))

  const svc = getServiceClient()
  const { data, error } = await svc
    .from('mock_test_questions')
    .upsert(toUpsert, { onConflict: 'test_id,question_no' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// DELETE a test
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ setId: string; testId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(user.id, user.email))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { testId } = await params
  const svc = getServiceClient()
  const { error } = await svc.from('mock_tests').delete().eq('id', testId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
