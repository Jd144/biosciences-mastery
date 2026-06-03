import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const selectedExamId = typeof body.selected_exam_id === 'string' && body.selected_exam_id ? body.selected_exam_id : null

  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { error: profileError } = existingProfile
    ? await supabase
        .from('user_profiles')
        .update({
          selected_exam_id: selectedExamId,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    : await supabase.from('user_profiles').insert({
        user_id: user.id,
        selected_exam_id: selectedExamId,
        updated_at: new Date().toISOString(),
      })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  const { error: deleteError } = await supabase.from('user_exams').delete().eq('user_id', user.id)
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  if (selectedExamId) {
    const { error: insertError } = await supabase.from('user_exams').insert({
      user_id: user.id,
      exam_id: selectedExamId,
    })

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
